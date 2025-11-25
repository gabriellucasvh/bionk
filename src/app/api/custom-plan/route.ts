import crypto from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export const runtime = "nodejs";

const resendApiKey = process.env.RESEND_API_KEY;

// Regex patterns moved to top level for performance
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;
const SUSPICIOUS_PATTERNS = [
	/\b(viagra|casino|poker|loan|credit|debt)\b/i,
	/\b(click here|free money|make money fast)\b/i,
	/<script|javascript:|data:|vbscript:/i,
	/\b(http:\/\/|https:\/\/).*\b/g, // URLs suspeitas em campos de texto
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema de validação
const customPlanSchema = z.object({
	fullName: z
		.string()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100, "Nome muito longo"),
	email: z.string().email("Email inválido").max(255, "Email muito longo"),
	bionkUsername: z
		.string()
		.optional()
		.refine((val) => {
			if (!val) {
				return true;
			}
			return USERNAME_REGEX.test(val);
		}, "Username deve conter apenas letras minúsculas, números, pontos(.) e underscores(_)"),
	companyName: z
		.string()
		.min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
		.max(100, "Nome da empresa muito longo"),
	companySize: z.enum(["1", "2-10", "11-50", "51-100", "101+"], {
		errorMap: () => ({ message: "Selecione o tamanho da empresa" }),
	}),
	helpDescription: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(1000, "Descrição muito longa"),
	// Honeypot field (campo oculto para detectar bots)
	website: z.string().optional(),
});

// Rate limiter específico para formulário de contato
let _contactRateLimiter: any = null;

function getContactRateLimiter() {
	if (!_contactRateLimiter) {
		const url = process.env.UPSTASH_REDIS_REST_URL;
		const token = process.env.UPSTASH_REDIS_REST_TOKEN;
		if (!(url && token)) {
			throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
		}
		const redis = new Redis({ url, token });
		_contactRateLimiter = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "60 s"),
			analytics: true,
			prefix: "ratelimit_contact",
		});
	}

	return _contactRateLimiter;
}

// Função para sanitizar strings
function sanitizeString(str: string): string {
	return str
		.replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove scripts
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/javascript:/gi, "") // Remove javascript: URLs
		.replace(/on\w+\s*=/gi, "") // Remove event handlers
		.trim();
}

// Função para detectar conteúdo suspeito
function detectSuspiciousContent(data: any): boolean {
	const textFields = [
		data.fullName,
		data.companyName,
		data.helpDescription,
		data.bionkUsername || "",
	];

	return textFields.some((field) =>
		SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(field))
	);
}

// Função para gerar token CSRF simples
function generateCSRFToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

// Função auxiliar para extrair e normalizar IP
function getClientIP(headersList: Headers): string {
	const rawIp =
		headersList.get("x-forwarded-for") ??
		headersList.get("x-real-ip") ??
		"127.0.0.1";

	// Normalizar IP para exibição (converter IPv6 localhost para IPv4)
	return rawIp === "::1" || rawIp === "::ffff:127.0.0.1" ? "127.0.0.1" : rawIp;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		// Rate limiting
		const headersList = req.headers;
		const ip = getClientIP(headersList as Headers);

		const { success } = await getContactRateLimiter().limit(ip);
		if (!success) {
			return NextResponse.json(
				{ error: "Muitas tentativas. Tente novamente em alguns minutos." },
				{ status: 429 }
			);
		}

		// Verificação de origem
		const origin = headersList.get("origin");
		const _referer = headersList.get("referer");
		const allowedOrigins = [
			process.env.NEXTAUTH_URL,
			"https://www.bionk.me",
			"https://bionk.me",
			"http://localhost:3000", // Para desenvolvimento
		];

		if (origin && !allowedOrigins.includes(origin)) {
			return NextResponse.json(
				{ error: "Origem não autorizada" },
				{ status: 403 }
			);
		}

		// Verificação de User-Agent
		const userAgent = headersList.get("user-agent");
		if (!userAgent || userAgent.length < 10) {
			return NextResponse.json(
				{ error: "Requisição suspeita" },
				{ status: 400 }
			);
		}

		// Parse e validação dos dados
		const body = await req.json();

		// Validação com Zod
		const validationResult = customPlanSchema.safeParse(body);
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: "Dados inválidos",
					details: validationResult.error.errors.map((e) => e.message),
				},
				{ status: 400 }
			);
		}

		const data = validationResult.data;

		// Sanitização dos dados
		const sanitizedData = {
			fullName: sanitizeString(data.fullName),
			email: data.email.toLowerCase().trim(),
			bionkUsername: data.bionkUsername
				? sanitizeString(data.bionkUsername)
				: undefined,
			companyName: sanitizeString(data.companyName),
			companySize: data.companySize,
			helpDescription: sanitizeString(data.helpDescription),
		};

		// Detecção de conteúdo suspeito
		if (detectSuspiciousContent(sanitizedData)) {
			return NextResponse.json(
				{ error: "Conteúdo não permitido detectado" },
				{ status: 400 }
			);
		}

		// Verificação adicional de email
		if (!EMAIL_REGEX.test(sanitizedData.email)) {
			return NextResponse.json(
				{ error: "Formato de email inválido" },
				{ status: 400 }
			);
		}

		// Preparar conteúdo do email
		const companySizeLabels: Record<string, string> = {
			"1": "Individual/Empreendedor",
			"2-10": "2-10 pessoas",
			"11-50": "11-50 pessoas",
			"51-100": "51-100 pessoas",
			"101+": "Mais de 100 pessoas",
		};

		const emailContent = `
      <h2>Nova Solicitação de Plano Personalizado</h2>
      <p><strong>Nome Completo:</strong> ${sanitizedData.fullName}</p>
      <p><strong>Email:</strong> ${sanitizedData.email}</p>
      ${sanitizedData.bionkUsername ? `<p><strong>Username Bionk:</strong> ${sanitizedData.bionkUsername}</p>` : ""}
      <p><strong>Nome da Empresa:</strong> ${sanitizedData.companyName}</p>
      <p><strong>Tamanho da Empresa:</strong> ${companySizeLabels[sanitizedData.companySize]}</p>
      <p><strong>Como podemos ajudar:</strong></p>
      <p>${sanitizedData.helpDescription.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><small>IP: ${ip} | User-Agent: ${userAgent}</small></p>
    `;

		// Enviar email
		try {
			if (!resendApiKey) {
				return NextResponse.json({
					message: "Solicitação enviada. Entraremos em contato em breve.",
					success: true,
				});
			}
			const { Resend } = await import("resend");
			const resend = new Resend(resendApiKey);
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "contato@bionk.me",
				to: ["contato@bionk.me"], // Email da empresa
				replyTo: sanitizedData.email,
				subject: `Nova Solicitação de Plano Personalizado - ${sanitizedData.companyName}`,
				html: emailContent,
			});

			// Email de confirmação para o cliente
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "contato@bionk.me",
				to: [sanitizedData.email],
				subject: "Recebemos sua solicitação - Bionk",
				html: `
					<h2>Obrigado pelo seu interesse!</h2>
					<p>Olá ${sanitizedData.fullName},</p>
					<p>Recebemos sua solicitação de plano personalizado para <strong>${sanitizedData.companyName}</strong>.</p>
					<p>Nossa equipe analisará suas necessidades e entrará em contato em até 2 dias úteis.</p>
					<p>Atenciosamente,<br>Equipe Bionk</p>
				`,
			});

			return NextResponse.json(
				{
					message:
						"Solicitação enviada com sucesso! Entraremos em contato em breve.",
					success: true,
				},
				{ status: 200 }
			);
		} catch {
			return NextResponse.json(
				{ error: "Erro interno. Tente novamente mais tarde." },
				{ status: 500 }
			);
		}
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

// Endpoint para obter token CSRF (opcional)
export function GET(): NextResponse {
	const token = generateCSRFToken();
	return NextResponse.json({ csrfToken: token });
}

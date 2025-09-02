import crypto from "node:crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { discordWebhook } from "@/lib/discord-webhook";

const resend = new Resend(process.env.RESEND_API_KEY);

// Regex patterns moved to top level for performance
const SUSPICIOUS_PATTERNS = [
	/\b(viagra|casino|poker|loan|credit|debt)\b/i,
	/\b(click here|free money|make money fast)\b/i,
	/<script|javascript:|data:|vbscript:/i,
	/\b(http:\/\/|https:\/\/).*\b/g, // URLs suspeitas em campos de texto
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Schema de validação para formulário de contato
const contactSchema = z.object({
	fullName: z
		.string()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100, "Nome muito longo"),
	email: z.string().email("Email inválido").max(255, "Email muito longo"),
	subject: z.enum(
		[
			"suporte-tecnico",
			"planos-assinaturas",
			"parcerias-colaboracoes",
			"feedback-sugestoes",
			"reportar-problema",
			"outros",
		],
		{
			errorMap: () => ({ message: "Selecione um assunto válido" }),
		}
	),
	message: z
		.string()
		.min(10, "Mensagem deve ter pelo menos 10 caracteres")
		.max(2000, "Mensagem muito longa"),
	// Honeypot field (campo oculto para detectar bots)
	website: z.string().optional(),
});

// Rate limiter específico para formulário de contato
let _contactRateLimiter: any = null;

function getContactRateLimiter() {
	if (!_contactRateLimiter) {
		const { Ratelimit } = require("@upstash/ratelimit");
		const { Redis } = require("@upstash/redis");

		const redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN,
		});

		_contactRateLimiter = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(3, "10 m"), // 3 tentativas por 10 minutos
			analytics: true,
			prefix: "contact_form",
		});
	}
	return _contactRateLimiter;
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

function sanitizeString(str: string): string {
	return str
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/[<>"'&]/g, "") // Remove caracteres perigosos
		.trim();
}

function detectSuspiciousContent(data: any): boolean {
	const textFields = [data.fullName, data.message];
	return textFields.some((field) =>
		SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(field))
	);
}

function generateCSRFToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		// Rate limiting
		const headersList = await headers();
		const ip = getClientIP(headersList);

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
		const validationResult = contactSchema.safeParse(body);
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

		// Verificação de honeypot
		if (data.website) {
			return NextResponse.json({ error: "Spam detectado" }, { status: 400 });
		}

		// Sanitização dos dados
		const sanitizedData = {
			fullName: sanitizeString(data.fullName),
			email: data.email.toLowerCase().trim(),
			subject: data.subject,
			message: sanitizeString(data.message),
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
		const subjectLabels: Record<string, string> = {
			"suporte-tecnico": "Suporte Técnico (problemas de acesso, bugs)",
			"planos-assinaturas":
				"Planos e Assinaturas (dúvidas sobre upgrade, pagamento, cancelamento)",
			"parcerias-colaboracoes": "Parcerias e Colaborações",
			"feedback-sugestoes": "Feedback e Sugestões",
			"reportar-problema": "Reportar Problema (abuso, links indevidos)",
			outros: "Outros",
		};

		const emailContent = `
			<h2>Nova Mensagem de Contato</h2>
			<p><strong>Nome:</strong> ${sanitizedData.fullName}</p>
			<p><strong>Email:</strong> ${sanitizedData.email}</p>
			<p><strong>Assunto:</strong> ${subjectLabels[sanitizedData.subject]}</p>
			<p><strong>Mensagem:</strong></p>
			<p>${sanitizedData.message.replace(/\n/g, "<br>")}</p>
			<hr>
			<p><small>IP: ${ip} | User-Agent: ${userAgent}</small></p>
		`;

		// Enviar email
		try {
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "contato@bionk.me",
				to: ["contato@bionk.me"], // Email da empresa
				replyTo: sanitizedData.email,
				subject: `Contato: ${subjectLabels[sanitizedData.subject]} - ${sanitizedData.fullName}`,
				html: emailContent,
			});

			// Email de confirmação para o cliente
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "contato@bionk.me",
				to: [sanitizedData.email],
				subject: "Recebemos sua mensagem - Bionk",
				html: `
					<h2>Obrigado por entrar em contato!</h2>
					<p>Olá ${sanitizedData.fullName},</p>
					<p>Recebemos sua mensagem sobre <strong>${subjectLabels[sanitizedData.subject]}</strong>.</p>
					<p>Nossa equipe analisará sua solicitação e responderá em até 2 dias úteis.</p>
					<p>Atenciosamente,<br>Equipe Bionk</p>
				`,
			});

			// Enviar notificação para o Discord
			try {
				await discordWebhook.notifyFormSubmission({
					type: "contact",
					name: sanitizedData.fullName,
					email: sanitizedData.email,
					subject: subjectLabels[sanitizedData.subject],
					message: sanitizedData.message,
					source: "website",
					metadata: {
						ip,
						userAgent,
						timestamp: new Date().toISOString(),
					},
				});
			} catch {

				// Não falha a requisição se o Discord falhar
			}

			return NextResponse.json(
				{
					message: "Mensagem enviada com sucesso! Responderemos em breve.",
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

export function GET(): NextResponse {
	return NextResponse.json(
		{ message: "Endpoint de contato ativo", csrf: generateCSRFToken() },
		{ status: 200 }
	);
}

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

// Sanitização básica (Regra #10)
function sanitizeString(str: string): string {
	return str
		.replace(/<[^>]*>/g, "") // Remove HTML tags
		.replace(/[<>"'&]/g, "") // Remove caracteres perigosos
		.trim();
}

export async function POST(req: NextRequest) {
	try {
		const ip = getClientIP(req) || "127.0.0.1";
		
		// Rate Limiting (Anti-spam): max 3 submits per hora por IP
		const redis = getRedis();
		const rlKey = `ratelimit_profile_contact:${ip}`;
		const count = Number(await redis.incr(rlKey));
		if (count === 1) {
			await redis.expire(rlKey, 3600); // 1 hora
		}
		if (count > 3) {
			return NextResponse.json(
				{ error: "Muitas tentativas. Tente novamente mais tarde." },
				{ status: 429 }
			);
		}

		const body = await req.json();
		const { contactFormId, name, email, phone, trafficSource } = body;

		if (!contactFormId) {
			return NextResponse.json({ error: "Formulário inválido." }, { status: 400 });
		}

		// Validação e Sanitização (#10)
		const sanitizedName = name ? sanitizeString(String(name)).slice(0, 100) : null;
		const sanitizedEmail = email ? sanitizeString(String(email)).toLowerCase().slice(0, 100) : null;
		const sanitizedPhone = phone ? sanitizeString(String(phone)).slice(0, 20) : null;

		// Verificar se o form existe
		const form = await prisma.contactForm.findUnique({
			where: { id: Number(contactFormId) },
		});

		if (!form || !form.active || form.archived) {
			return NextResponse.json({ error: "Formulário não encontrado ou inativo." }, { status: 404 });
		}

		// Validação básica se required
		if (form.collectName && !sanitizedName) {
			return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
		}
		if (form.collectEmail && !sanitizedEmail) {
			return NextResponse.json({ error: "O e-mail é obrigatório." }, { status: 400 });
		}
		if (form.collectPhone && !sanitizedPhone) {
			return NextResponse.json({ error: "O telefone é obrigatório." }, { status: 400 });
		}

		// Validação básica de email
		if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
			return NextResponse.json({ error: "O e-mail informado é inválido." }, { status: 400 });
		}

		// Analytics Tracking
		const cookiePreferences = getCookiePreferencesFromRequest(req as unknown as Request);
		let device = "unknown";
		let userAgentStr: string | null = null;
		let countryCode: string | null = null;
		let referrerUrl: string | null = null;

		if (cookiePreferences.analytics) {
			userAgentStr = getUserAgent(req);
			device = detectDeviceType(userAgentStr);
			try {
				countryCode = await getCountryFromIP(ip);
			} catch {}
			referrerUrl = trafficSource || "direct";
		}

		// Salvar no banco
		await prisma.contactSubmission.create({
			data: {
				contactFormId: form.id,
				name: sanitizedName,
				email: sanitizedEmail,
				phone: sanitizedPhone,
				device,
				userAgent: userAgentStr,
				country: countryCode,
				referrer: referrerUrl,
			},
		});

		// Não notificamos por email neste momento (solicitado pelo usuário)

		return NextResponse.json({ success: true }, { status: 201 });
	} catch (error) {
		console.error("Erro no envio do formulário:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor." },
			{ status: 500 }
		);
	}
}

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import OtpEmail from "@/emails/OtpEmail";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { generateUniqueUsername } from "@/utils/generateUsername";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY_MINUTES = 2;
const MAX_OTP_ATTEMPTS = 5;
const BASE_BLOCK_DURATION_MINUTES = 10;
const PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES = 5;
const OTP_TOKEN_EXPIRY_MINUTES = 10;

// Função para calcular o tempo de bloqueio exponencial
function calculateBlockDuration(attemptCount: number): number {
	return BASE_BLOCK_DURATION_MINUTES * 2 ** Math.min(attemptCount - 1, 2); // 10min → 20min → 40min
}

function generateOtp(): string {
	return crypto.randomInt(100_000, 999_999).toString();
}

function generatePasswordSetupToken(): string {
	return crypto.randomUUID();
}

function generateOtpToken(): string {
	return crypto.randomUUID();
}

export async function POST(req: Request) {
	try {
		const { email, stage, otp, password, token } = await req.json();

		switch (stage) {
			case "request-otp": {
				if (!email || typeof email !== "string") {
					return NextResponse.json(
						{ error: "E-mail inválido" },
						{ status: 400 }
					);
				}
				// --- RATE LIMITER ---
				const headersList = await headers();
				const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
				const { success } = await getAuthRateLimiter().limit(ip);
				if (!success) {
					return NextResponse.json(
						{ error: "Muitas requisições. Tente novamente mais tarde." },
						{ status: 429 }
					);
				}
				return await handleOtpRequest(email);
			}

			case "verify-otp":
				if (!email || typeof email !== "string") {
					return NextResponse.json(
						{ error: "E-mail inválido" },
						{ status: 400 }
					);
				}
				return await handleOtpVerification(email, otp);

			case "create-user":
				if (!token || typeof token !== "string") {
					return NextResponse.json(
						{ error: "Token inválido" },
						{ status: 400 }
					);
				}
				return await handleUserCreation(token, password);

			default:
				return NextResponse.json(
					{ error: "Estágio de registro inválido" },
					{ status: 400 }
				);
		}
	} catch {
		return NextResponse.json(
			{ error: "Erro interno no servidor." },
			{ status: 500 }
		);
	}
}

// Função para lidar com a solicitação do OTP
async function handleOtpRequest(email: string) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (user?.emailVerified) {
		return NextResponse.json(
			{ error: "E-mail já verificado." },
			{ status: 409 }
		);
	}

	// Verificar se o usuário está bloqueado
	if (
		user?.registrationOtpBlockedUntil &&
		user.registrationOtpBlockedUntil > new Date()
	) {
		const remainingTime = Math.ceil(
			(user.registrationOtpBlockedUntil.getTime() - Date.now()) / (1000 * 60)
		);
		return NextResponse.json(
			{
				error: `Você está temporariamente bloqueado. Tente novamente em ${remainingTime} minutos.`,
			},
			{ status: 429 }
		);
	}

	const registrationOtp = generateOtp();
	const registrationOtpExpiry = new Date(
		Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
	);
	const otpToken = generateOtpToken();
	const otpTokenExpiry = new Date(
		Date.now() + OTP_TOKEN_EXPIRY_MINUTES * 60 * 1000
	);

	await prisma.user.upsert({
		where: { email },
		update: {
			registrationOtp,
			registrationOtpExpiry,
			otpToken,
			otpTokenExpiry,
			// Resetar tentativas apenas se não estiver bloqueado
			registrationOtpAttempts: user?.registrationOtpBlockedUntil
				? user.registrationOtpAttempts
				: 0,
			// Manter bloqueio se ainda estiver ativo
			registrationOtpBlockedUntil:
				user?.registrationOtpBlockedUntil &&
				user.registrationOtpBlockedUntil > new Date()
					? user.registrationOtpBlockedUntil
					: null,
		},
		create: {
			email,
			username: `user_${Date.now()}`,
			registrationOtp,
			registrationOtpExpiry,
			otpToken,
			otpTokenExpiry,
			emailVerified: null,
			registrationOtpAttempts: 0,
		},
	});

	try {
		await resend.emails.send({
			from: "Bionk <contato@bionk.me>",
			to: [email],
			subject: "Seu código de verificação Bionk",
			react: OtpEmail({
				otp: registrationOtp,
				expiryMinutes: 2,
			}) as React.ReactElement,
		});
		return NextResponse.json(
			{ message: "Código de verificação enviado.", otpToken },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Erro ao enviar e-mail." },
			{ status: 500 }
		);
	}
}

// Função para verificar o OTP
async function handleOtpVerification(email: string, otp: string) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return NextResponse.json(
			{ error: "Usuário não encontrado." },
			{ status: 404 }
		);
	}
	if (user.emailVerified) {
		return NextResponse.json(
			{ error: "E-mail já verificado." },
			{ status: 400 }
		);
	}

	// Verificar se o usuário está bloqueado
	if (
		user.registrationOtpBlockedUntil &&
		user.registrationOtpBlockedUntil > new Date()
	) {
		const remainingTime = Math.ceil(
			(user.registrationOtpBlockedUntil.getTime() - Date.now()) / (1000 * 60)
		);
		return NextResponse.json(
			{
				error: `Muitas tentativas incorretas. Tente novamente em ${remainingTime} minutos.`,
			},
			{ status: 429 }
		);
	}

	// Verificar se o OTP expirou
	if (!user.registrationOtpExpiry || user.registrationOtpExpiry < new Date()) {
		return NextResponse.json(
			{ error: "Código OTP expirado. Solicite um novo código." },
			{ status: 400 }
		);
	}

	// Verificar se o OTP está correto
	if (user.registrationOtp !== otp) {
		const newAttemptCount = (user.registrationOtpAttempts ?? 0) + 1;

		// Se atingiu o limite de tentativas, bloquear o usuário
		if (newAttemptCount >= MAX_OTP_ATTEMPTS) {
			const blockDuration = calculateBlockDuration(
				Math.floor(newAttemptCount / MAX_OTP_ATTEMPTS)
			);
			const blockedUntil = new Date(Date.now() + blockDuration * 60 * 1000);

			await prisma.user.update({
				where: { email },
				data: {
					registrationOtpAttempts: newAttemptCount,
					registrationOtpBlockedUntil: blockedUntil,
					// Invalidar o OTP atual para forçar solicitação de novo código
					registrationOtp: null,
					registrationOtpExpiry: null,
				},
			});

			return NextResponse.json(
				{
					error: `Muitas tentativas incorretas. Você foi bloqueado por ${blockDuration} minutos.`,
				},
				{ status: 429 }
			);
		}
		// Incrementar contador de tentativas
		await prisma.user.update({
			where: { email },
			data: {
				registrationOtpAttempts: newAttemptCount,
			},
		});

		const remainingAttempts = MAX_OTP_ATTEMPTS - newAttemptCount;
		return NextResponse.json(
			{
				error: `Código OTP inválido. Você tem ${remainingAttempts} tentativa(s) restante(s).`,
			},
			{ status: 400 }
		);
	}

	// OTP correto - gerar token temporário para definição de senha
	const passwordSetupToken = generatePasswordSetupToken();
	const passwordSetupTokenExpiry = new Date(
		Date.now() + PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES * 60 * 1000
	);

	await prisma.user.update({
		where: { email },
		data: {
			emailVerified: new Date(),
			registrationOtp: null,
			registrationOtpExpiry: null,
			registrationOtpAttempts: 0,
			registrationOtpBlockedUntil: null,
			passwordSetupToken,
			passwordSetupTokenExpiry,
		},
	});

	return NextResponse.json(
		{
			message: "Código OTP verificado com sucesso.",
			passwordSetupToken,
		},
		{ status: 200 }
	);
}

// Função para criar o usuário usando token temporário
async function handleUserCreation(token: string, password: string) {
	// Buscar usuário pelo token
	const user = await prisma.user.findUnique({
		where: { passwordSetupToken: token },
	});

	if (!user) {
		return NextResponse.json({ error: "Token inválido." }, { status: 400 });
	}

	// Verificar se o token expirou
	if (
		!user.passwordSetupTokenExpiry ||
		user.passwordSetupTokenExpiry < new Date()
	) {
		return NextResponse.json(
			{ error: "Token expirado. Solicite um novo código OTP." },
			{ status: 400 }
		);
	}

	// Verificar se o email foi verificado
	if (!user.emailVerified) {
		return NextResponse.json(
			{ error: "Email não verificado." },
			{ status: 400 }
		);
	}

	// Verificar se já tem senha definida
	if (user.hashedPassword) {
		return NextResponse.json(
			{ error: "Usuário já possui senha definida." },
			{ status: 400 }
		);
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const username = await generateUniqueUsername(user.email.split("@")[0]);

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			hashedPassword,
			username,
			passwordSetupToken: null,
			passwordSetupTokenExpiry: null,
			subscriptionPlan: "free",
			subscriptionStatus: "active",
		},
	});

	// Notificar Discord sobre novo registro
	try {
		await discordWebhook.notifyRegistration({
			username: updatedUser.username || username,
			email: updatedUser.email,
			name: updatedUser.name || undefined,
			source: "website",
			plan: "free",
			metadata: {
				userId: updatedUser.id,
				timestamp: new Date().toISOString(),
				registrationMethod: "email_verification",
			},
		});
	} catch {
		// Não falha o registro se a notificação Discord falhar
	}

	return NextResponse.json(
		{ message: "Usuário registrado com sucesso!" },
		{ status: 201 }
	);
}

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import OtpEmail from "@/emails/OtpEmail";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY_MINUTES = 2;
const MAX_OTP_ATTEMPTS = 5;
const BASE_BLOCK_DURATION_MINUTES = 10;
const PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES = 5;
const OTP_TOKEN_EXPIRY_MINUTES = 10;
const USERNAME_RESERVATION_EXPIRY_MINUTES = 15;
const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

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

// Função para limpar usernames reservados expirados
async function cleanupExpiredUsernameReservations() {
	try {
		const now = new Date();
		// Deletar usuários não verificados com reserva de username expirada
		await prisma.user.deleteMany({
			where: {
				emailVerified: null,
				usernameReservationExpiry: {
					lt: now,
				},
			},
		});
	} catch {
		//
	}
}

export async function POST(req: Request) {
	try {
		// Executar limpeza de reservas expiradas
		await cleanupExpiredUsernameReservations();

		const { email, username, stage, otp, password, token, name } =
			await req.json();

		switch (stage) {
			case "request-otp": {
				if (!email || typeof email !== "string") {
					return NextResponse.json(
						{ error: "E-mail inválido" },
						{ status: 400 }
					);
				}
				if (!username || typeof username !== "string") {
					return NextResponse.json(
						{ error: "Username é obrigatório" },
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
				return await handleOtpRequest(email, username);
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
				return await handleUserCreation(token, password, name);

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
async function handleOtpRequest(email: string, username: string) {
	// Validar formato do username
	if (!USERNAME_REGEX.test(username)) {
		return NextResponse.json(
			{
				error:
					"Username deve conter apenas letras minúsculas, números, pontos, hífens e underscores (3-30 caracteres)",
			},
			{ status: 400 }
		);
	}

	// Verificar se Username indisponível ou reservado
	const existingUsername = await prisma.user.findUnique({
		where: { username },
	});
	// Se o username está sendo usado pelo mesmo email, permitir (renovar reserva)
	// Verificar se username está em uso por outro email e se está reservado ou verificado
	if (
		existingUsername &&
		existingUsername.email !== email &&
		(existingUsername.emailVerified ||
			(existingUsername.usernameReservationExpiry &&
				existingUsername.usernameReservationExpiry > new Date()))
	) {
		const errorMessage = existingUsername.emailVerified
			? "Username indisponível"
			: "Username temporariamente reservado por outro usuário";

		return NextResponse.json({ error: errorMessage }, { status: 409 });
	}

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
	const usernameReservationExpiry = new Date(
		Date.now() + USERNAME_RESERVATION_EXPIRY_MINUTES * 60 * 1000
	);

	await prisma.user.upsert({
		where: { email },
		update: {
			username, // Atualizar com o username escolhido
			registrationOtp,
			registrationOtpExpiry,
			otpToken,
			otpTokenExpiry,
			usernameReservedAt: new Date(),
			usernameReservationExpiry,
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
			username, // Usar o username escolhido pelo usuário
			registrationOtp,
			registrationOtpExpiry,
			otpToken,
			otpTokenExpiry,
			usernameReservedAt: new Date(),
			usernameReservationExpiry,
			emailVerified: null,
			registrationOtpAttempts: 0,
			name: "Usuário", // Valor padrão temporário
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
async function handleUserCreation(
	token: string,
	password: string,
	name: string
) {
	// Validar se name foi fornecido
	if (!name || typeof name !== "string" || name.trim().length === 0) {
		return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
	}

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

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			name: name.trim(),
			hashedPassword,
			passwordSetupToken: null,
			passwordSetupTokenExpiry: null,
			usernameReservedAt: null,
			usernameReservationExpiry: null,
			subscriptionPlan: "free",
			subscriptionStatus: "active",
		},
	});

	// Notificar Discord sobre novo registro
	try {
		await discordWebhook.notifyRegistration({
			username: updatedUser.username,
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

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import OtpEmail from "@/emails/OtpEmail";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { getDefaultCustomPresets } from "@/utils/templatePresets";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY_MINUTES = 3;
const MAX_OTP_ATTEMPTS = 5;
const BASE_BLOCK_DURATION_MINUTES = 10;
const PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES = 15;
const OTP_TOKEN_EXPIRY_MINUTES = 10;
const USERNAME_RESERVATION_EXPIRY_MINUTES = 15;
const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;
const REJEX_UPPERCASE = /[A-Z]/;
const REJEX_LOWERCASE = /[a-z]/;
const REJEX_DIGIT = /\d/;
const REJEX_REPEAT = /([A-Za-z0-9])\1{3,}/;

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

function validateEmail(email: unknown): NextResponse | null {
	if (!email || typeof email !== "string") {
		return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
	}
	return null;
}

function validateToken(token: unknown): NextResponse | null {
	if (!token || typeof token !== "string") {
		return NextResponse.json({ error: "Token inválido" }, { status: 400 });
	}
	return null;
}

async function applyRateLimit(): Promise<NextResponse | null> {
    const headersList = await headers();
    const ip =
        headersList.get("cf-connecting-ip") ||
        headersList.get("x-real-ip") ||
        headersList.get("x-forwarded-for") ||
        "127.0.0.1";
    try {
        const limiter = getAuthRateLimiter();
        const { success } = await limiter.limit(ip);
        if (!success) {
            return NextResponse.json(
                { error: "Muitas requisições. Tente novamente mais tarde." },
                { status: 429 }
            );
        }
    } catch {
        return null;
    }
    return null;
}

async function handleRequestOtpStage(
	email: unknown,
	username: unknown
): Promise<NextResponse> {
	const emailValidation = validateEmail(email);
	if (emailValidation) {
		return emailValidation;
	}
	const rateLimitResponse = await applyRateLimit();
	if (rateLimitResponse) {
		return rateLimitResponse;
	}

	const providedUsername =
		typeof username === "string" && username.trim()
			? (username as string)
			: null;
	if (providedUsername) {
		return await handleOtpRequest(email as string, providedUsername);
	}

	return await handleOtpRequest(email as string, "");
}

async function handleVerifyOtpStage(
	email: unknown,
	otp: unknown
): Promise<NextResponse> {
	const emailValidation = validateEmail(email);
	if (emailValidation) {
		return emailValidation;
	}
	const cookieStore = await cookies();
	const csrfCookie = cookieStore.get("reg_csrf");
	if (!(csrfCookie && csrfCookie.value)) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	return await handleOtpVerification(email as string, otp as string);
}

async function handleCreateUserStage(
	token: unknown,
	username: unknown,
	password: unknown,
	signature: unknown
): Promise<NextResponse> {
	const tokenValidation = validateToken(token);
	if (tokenValidation) {
		return tokenValidation;
	}
	const cookieStore = await cookies();
	const csrfCookie = cookieStore.get("reg_csrf");
	if (!(csrfCookie && csrfCookie.value)) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	return await handleUserCreation(
		token as string,
		username as string,
		password as string,
		typeof signature === "string" ? signature : undefined
	);
}

async function verifyCaptcha(token: string | undefined): Promise<NextResponse | null> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        return null;
    }
    const headersList = await headers();
    const ip =
        headersList.get("cf-connecting-ip") ||
        headersList.get("x-real-ip") ||
        headersList.get("x-forwarded-for") ||
        null;
    if (!token) {
        return NextResponse.json({ error: "Verificação humana obrigatória." }, { status: 400 });
    }
    try {
        const params = new URLSearchParams({ secret, response: token });
        if (ip) {
            params.append("remoteip", ip);
        }
        const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
        if (!r.ok) {
            return NextResponse.json({ error: "Verificação humana indisponível no momento." }, { status: 400 });
        }
        const data = await r.json();
        if (!(data && data.success)) {
            return NextResponse.json({ error: "Verificação humana falhou." }, { status: 400 });
        }
        return null;
    } catch {
        return NextResponse.json({ error: "Não foi possível verificar a ação humana." }, { status: 400 });
    }
}

export async function POST(req: Request) {
    try {
        await cleanupExpiredUsernameReservations();

        const { email, username, stage, otp, password, token, signature, captchaToken } =
            await req.json();

		switch (stage) {
            case "request-otp":
                {
                    const captchaResponse = await verifyCaptcha(
                        typeof captchaToken === "string" ? captchaToken : undefined
                    );
                    if (captchaResponse) {
                        return captchaResponse;
                    }
                    return await handleRequestOtpStage(email, username);
                }
			case "verify-otp":
				return await handleVerifyOtpStage(email, otp);
			case "create-user":
				return await handleCreateUserStage(
					token,
					username,
					password,
					signature
				);
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
function validateUsernameFormat(
	normalizedUsername: string
): NextResponse | null {
	if (!USERNAME_REGEX.test(normalizedUsername)) {
		return NextResponse.json(
			{
				error:
					"Username deve conter apenas letras minúsculas, números, pontos(.) e underscores(_)",
			},
			{ status: 400 }
		);
	}
	return null;
}

function validateUsernameBlacklist(
	normalizedUsername: string
): NextResponse | null {
	if (BLACKLISTED_USERNAMES.includes(normalizedUsername)) {
		return NextResponse.json(
			{ error: "Username não está disponível" },
			{ status: 400 }
		);
	}
	return null;
}

async function checkBannedUser(
    email: string,
    normalizedUsername: string
): Promise<NextResponse | null> {
    let bannedUser = null as any;
    try {
        bannedUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username: normalizedUsername }],
                isBanned: true,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Serviço indisponível no momento." },
            { status: 400 }
        );
    }

	if (bannedUser) {
		return NextResponse.json(
			{ error: "Não é possível criar conta com estes dados" },
			{ status: 403 }
		);
	}
	return null;
}

async function checkUsernameAvailability(
    email: string,
    normalizedUsername: string
): Promise<NextResponse | null> {
    let existingUsername = null as any;
    try {
        existingUsername = await prisma.user.findUnique({
            where: { username: normalizedUsername },
        });
    } catch {
        return NextResponse.json(
            { error: "Serviço indisponível no momento." },
            { status: 400 }
        );
    }

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
	return null;
}

async function checkEmailVerification(
    email: string
): Promise<NextResponse | null> {
    let user = null as any;
    try {
        user = await prisma.user.findUnique({ where: { email } });
    } catch {
        return NextResponse.json(
            { error: "Serviço indisponível no momento." },
            { status: 400 }
        );
    }
	if (user?.emailVerified) {
		return NextResponse.json(
			{ error: "E-mail já verificado." },
			{ status: 409 }
		);
	}
	return null;
}

async function checkUserBlocked(
    email: string
): Promise<{ response: NextResponse | null; user: any }> {
    let user = null as any;
    try {
        user = await prisma.user.findUnique({ where: { email } });
    } catch {
        return { response: NextResponse.json({ error: "Serviço indisponível no momento." }, { status: 400 }), user };
    }

	if (
		user?.registrationOtpBlockedUntil &&
		user.registrationOtpBlockedUntil > new Date()
	) {
		const remainingTime = Math.ceil(
			(user.registrationOtpBlockedUntil.getTime() - Date.now()) / (1000 * 60)
		);
		return {
			response: NextResponse.json(
				{
					error: `Você está temporariamente bloqueado. Tente novamente em ${remainingTime} minutos.`,
				},
				{ status: 429 }
			),
			user,
		};
	}
	return { response: null, user };
}

function generateOtpData() {
	return {
		registrationOtp: generateOtp(),
		registrationOtpExpiry: new Date(
			Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
		),
		otpToken: generateOtpToken(),
		otpTokenExpiry: new Date(Date.now() + OTP_TOKEN_EXPIRY_MINUTES * 60 * 1000),
		usernameReservationExpiry: new Date(
			Date.now() + USERNAME_RESERVATION_EXPIRY_MINUTES * 60 * 1000
		),
	};
}

async function sendOtpEmail(
    email: string,
    otp: string,
    otpToken: string
): Promise<NextResponse> {
	const hasApiKey =
		typeof process.env.RESEND_API_KEY === "string" &&
		process.env.RESEND_API_KEY.trim().length > 0;
	if (!hasApiKey) {
		return NextResponse.json(
			{ message: "Envio de e-mail indisponível no ambiente.", otpToken },
			{ status: 200 }
		);
	}
    try {
        await resend.emails.send({
            from: "Bionk <contato@bionk.me>",
            to: [email],
            subject: "Código de verificação",
            react: OtpEmail({
                otp,
                expiryMinutes: OTP_EXPIRY_MINUTES,
            }) as React.ReactElement,
        });
		return NextResponse.json(
			{ message: "Código de verificação enviado.", otpToken },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ message: "Não foi possível enviar o e-mail agora.", otpToken },
			{ status: 200 }
		);
	}
}

async function handleOtpRequest(email: string, username: string) {
	const normalizedUsername = (username || "").toLowerCase().trim();

	if (normalizedUsername) {
		const formatValidation = validateUsernameFormat(normalizedUsername);
		if (formatValidation) {
			return formatValidation;
		}

		const blacklistValidation = validateUsernameBlacklist(normalizedUsername);
		if (blacklistValidation) {
			return blacklistValidation;
		}

		const bannedUserCheck = await checkBannedUser(email, normalizedUsername);
		if (bannedUserCheck) {
			return bannedUserCheck;
		}

		const usernameAvailabilityCheck = await checkUsernameAvailability(
			email,
			normalizedUsername
		);
		if (usernameAvailabilityCheck) {
			return usernameAvailabilityCheck;
		}
	}

	const emailVerificationCheck = await checkEmailVerification(email);
	if (emailVerificationCheck) {
		return emailVerificationCheck;
	}

	const { response: blockedResponse, user } = await checkUserBlocked(email);
	if (blockedResponse) {
		return blockedResponse;
	}

	const otpData = generateOtpData();
	const csrfState = crypto.randomBytes(32).toString("hex");
	const tempUsername = normalizedUsername
		? normalizedUsername
		: `u_${crypto.randomBytes(12).toString("hex")}`;

    try {
        await prisma.user.upsert({
            where: { email },
            update: {
                username: normalizedUsername || undefined,
                ...otpData,
                usernameReservedAt: normalizedUsername ? new Date() : null,
                registrationOtpAttempts: user?.registrationOtpBlockedUntil
                    ? user.registrationOtpAttempts
                    : 0,
                registrationOtpBlockedUntil:
                    user?.registrationOtpBlockedUntil &&
                    user.registrationOtpBlockedUntil > new Date()
                        ? user.registrationOtpBlockedUntil
                        : null,
                registrationCsrfState: csrfState,
                registrationCsrfExpiry: new Date(
                    Date.now() + PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES * 60 * 1000
                ),
            },
            create: {
                email,
                username: tempUsername,
                ...otpData,
                usernameReservedAt: normalizedUsername ? new Date() : null,
                emailVerified: null,
                registrationOtpAttempts: 0,
                name: "Usuário",
                registrationCsrfState: csrfState,
                registrationCsrfExpiry: new Date(
                    Date.now() + PASSWORD_SETUP_TOKEN_EXPIRY_MINUTES * 60 * 1000
                ),
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Não foi possível iniciar a verificação agora." },
            { status: 400 }
        );
    }

	const res = await sendOtpEmail(
		email,
		otpData.registrationOtp,
		otpData.otpToken
	);
	try {
		res.cookies.set("reg_csrf", csrfState, {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 15 * 60,
		});
	} catch {}
	return res;
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

	const cookieStore = await cookies();
	const csrfCookie = cookieStore.get("reg_csrf");
	if (!(csrfCookie && csrfCookie.value)) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	if (
		!user.registrationCsrfState ||
		user.registrationCsrfState !== csrfCookie.value
	) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	if (
		!user.registrationCsrfExpiry ||
		user.registrationCsrfExpiry < new Date()
	) {
		return NextResponse.json({ error: "CSRF expirado." }, { status: 410 });
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

		return NextResponse.json(
			{
				error: "Código OTP inválido.",
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

	function computeHmac(data: string): string | null {
		const secret = process.env.TOKEN_HMAC_SECRET;
		if (!secret) {
			return null;
		}
		const h = crypto.createHmac("sha256", secret);
		h.update(data);
		return h.digest("hex");
	}
    const signature = computeHmac(`${user.email}:${passwordSetupToken}`);
    if (!signature) {
        return NextResponse.json({ error: "Configuração de segurança ausente." }, { status: 500 });
    }
	const res = NextResponse.json(
		{
			message: "Código OTP verificado com sucesso.",
			passwordSetupToken,
			signature,
			nextPath: "/registro/completar",
		},
		{ status: 200 }
	);
	return res;
}

// Função para criar o usuário usando token temporário
async function handleUserCreation(
  token: string,
  username: string,
  password: string,
  providedSignature?: string
) {
	const passwordErrors: string[] = [];
	if (!(password && typeof password === "string")) {
		return NextResponse.json({ error: "Senha inválida." }, { status: 400 });
	}
	if (password.length < 9) {
		passwordErrors.push("A senha deve ter pelo menos 9 caracteres.");
	}
	if (password.length > 64) {
		passwordErrors.push("A senha deve ter no máximo 64 caracteres.");
	}
	if (!REJEX_UPPERCASE.test(password)) {
		passwordErrors.push("Inclua pelo menos 1 letra maiúscula.");
	}
	if (!REJEX_LOWERCASE.test(password)) {
		passwordErrors.push("Inclua pelo menos 1 letra minúscula.");
	}
	if (!REJEX_DIGIT.test(password)) {
		passwordErrors.push("Inclua pelo menos 1 número.");
	}
	const lowerPwd = password.toLowerCase();
	const seqs = [
		"123456",
		"234567",
		"345678",
		"456789",
		"012345",
		"abcdef",
		"bcdefg",
		"cdefgh",
		"defghi",
		"uvwxyz",
		"qwerty",
		"asdfgh",
		"zxcvbn",
	];
	if (seqs.some((s) => lowerPwd.includes(s))) {
		passwordErrors.push("Evite sequências óbvias (ex.: 123456, abcdef).");
	}
	if (REJEX_REPEAT.test(password)) {
		passwordErrors.push("Evite repetição excessiva de caracteres.");
	}
	if (passwordErrors.length > 0) {
		return NextResponse.json(
			{ error: passwordErrors.join(" ") },
			{ status: 400 }
		);
	}
	if (!username || typeof username !== "string") {
		return NextResponse.json(
			{ error: "Username é obrigatório" },
			{ status: 400 }
		);
	}
	const normalizedUsername = username.toLowerCase().trim();
	const formatValidation = validateUsernameFormat(normalizedUsername);
	if (formatValidation) {
		return formatValidation;
	}
	const blacklistValidation = validateUsernameBlacklist(normalizedUsername);
	if (blacklistValidation) {
		return blacklistValidation;
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

    const expectedSignature = (function computeHmac(data: string): string | null {
        const secret = process.env.TOKEN_HMAC_SECRET;
        if (!secret) {
            return null;
        }
        const h = crypto.createHmac("sha256", secret);
        h.update(data);
        return h.digest("hex");
    })(`${user.email}:${token}`);
    if (!expectedSignature) {
        return NextResponse.json({ error: "Configuração de segurança ausente." }, { status: 500 });
    }
    if (providedSignature !== expectedSignature) {
        return NextResponse.json(
          { error: "Assinatura inválida." },
          { status: 400 }
        );
    }

	const cookieStore = await cookies();
	const csrfCookie = cookieStore.get("reg_csrf");
	if (!(csrfCookie && csrfCookie.value)) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	if (
		!user.registrationCsrfState ||
		user.registrationCsrfState !== csrfCookie.value
	) {
		return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
	}
	if (
		!user.registrationCsrfExpiry ||
		user.registrationCsrfExpiry < new Date()
	) {
		return NextResponse.json({ error: "CSRF expirado." }, { status: 410 });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const normalized = normalizedUsername;

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			username: normalized,
			name: normalized,
			hashedPassword,
			status: "active",
			onboardingCompleted: false,
			provider: "credentials",
			passwordSetupToken: null,
			passwordSetupTokenExpiry: null,
			usernameReservedAt: null,
			usernameReservationExpiry: null,
			registrationCsrfState: null,
			registrationCsrfExpiry: null,
			subscriptionPlan: "free",
			subscriptionStatus: "active",
			CustomPresets: {
				create: getDefaultCustomPresets(),
			},
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

	const res = NextResponse.json(
		{ message: "Usuário registrado com sucesso!" },
		{ status: 201 }
	);
	try {
		res.cookies.set("reg_csrf", "", {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 0,
		});
	} catch {}
	return res;
}

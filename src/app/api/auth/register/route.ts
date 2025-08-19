import OtpEmail from "@/emails/OtpEmail";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { generateUniqueUsername } from "@/utils/generateUsername";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY_MINUTES = 5;
const _MAX_OTP_ATTEMPTS = 3;
const _OTP_BLOCK_DURATION_MINUTES = 1;

function generateOtp(): string {
	return crypto.randomInt(100_000, 999_999).toString();
}

export async function POST(req: Request) {
	try {
		const { email, stage, otp, password } = await req.json();

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
		}

		switch (stage) {
			case "request-otp": {
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
				return await handleOtpVerification(email, otp);

			case "create-user":
				return await handleUserCreation(email, password);

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

	const registrationOtp = generateOtp();
	const registrationOtpExpiry = new Date(
		Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
	);

	await prisma.user.upsert({
		where: { email },
		update: {
			registrationOtp,
			registrationOtpExpiry,
			registrationOtpAttempts: 0,
			registrationOtpBlockedUntil: null,
		},
		create: {
			email,
			username: `user_${Date.now()}`,
			registrationOtp,
			registrationOtpExpiry,
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
				expiryMinutes: OTP_EXPIRY_MINUTES,
			}) as React.ReactElement,
		});
		return NextResponse.json(
			{ message: "Código de verificação enviado." },
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

	if (user.registrationOtp !== otp) {
		await prisma.user.update({
			where: { email },
			data: {
				registrationOtpAttempts: (user.registrationOtpAttempts ?? 0) + 1,
			},
		});
		return NextResponse.json(
			{ error: "Código OTP inválido." },
			{ status: 400 }
		);
	}

	await prisma.user.update({
		where: { email },
		data: {
			emailVerified: new Date(),
			registrationOtp: null,
			registrationOtpExpiry: null,
		},
	});
	return NextResponse.json(
		{ message: "Código OTP verificado com sucesso." },
		{ status: 200 }
	);
}

// Função para criar o usuário
async function handleUserCreation(email: string, password: string) {
	const hashedPassword = await bcrypt.hash(password, 10);
	const username = await generateUniqueUsername(email.split("@")[0]);

	await prisma.user.update({
		where: { email },
		data: { hashedPassword, username, emailVerified: new Date() },
	});

	return NextResponse.json(
		{ message: "Usuário registrado com sucesso!" },
		{ status: 201 }
	);
}

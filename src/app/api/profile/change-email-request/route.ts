import ChangeEmailVerificationEmail from "@/emails/change-email-verification-email";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request): Promise<NextResponse> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		if (session.user.banido) {
			return NextResponse.json(
				{ 
					error: "Conta suspensa", 
					message: "Sua conta foi suspensa e não pode realizar esta ação." 
				},
				{ status: 403 }
			);
		}

		// --- RATE LIMITER ---
		const identifier = session.user.id;
		const { success } = await getAuthRateLimiter().limit(identifier);
		if (!success) {
			return NextResponse.json(
				{ error: "Muitas requisições. Tente novamente mais tarde." },
				{ status: 429 }
			);
		}
		// --- FIM RATE LIMITER ---

		if (!(session.user as any).isCredentialsUser) {
			return NextResponse.json(
				{ error: "Operação não permitida para este tipo de conta." },
				{ status: 403 }
			);
		}

		const { newEmail, currentPassword } = await req.json();
		if (!(newEmail && currentPassword)) {
			return NextResponse.json(
				{ error: "Novo e-mail e senha atual são obrigatórios" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});
		if (!user?.hashedPassword) {
			return NextResponse.json(
				{ error: "Usuário não encontrado ou senha não configurada" },
				{ status: 404 }
			);
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.hashedPassword
		);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Senha atual incorreta" },
				{ status: 403 }
			);
		}

		if (newEmail === user.email) {
			return NextResponse.json(
				{ error: "O novo e-mail não pode ser igual ao atual" },
				{ status: 400 }
			);
		}

		const existingUserWithNewEmail = await prisma.user.findUnique({
			where: { email: newEmail },
		});
		if (existingUserWithNewEmail && existingUserWithNewEmail.id !== user.id) {
			return NextResponse.json(
				{ error: "Este e-mail já está em uso por outra conta." },
				{ status: 409 }
			);
		}

		const emailVerificationToken = crypto.randomBytes(32).toString("hex");
		const emailVerificationTokenExpires = new Date(Date.now() + 3_600_000); // 1h

		await prisma.user.update({
			where: { id: user.id },
			data: {
				newEmailPending: newEmail,
				emailVerificationToken,
				emailVerificationTokenExpires,
			},
		});

		const verificationUrl = `${process.env.NEXTAUTH_URL}/profile/verify-new-email?token=${emailVerificationToken}`;

		try {
			await resend.emails.send({
				from: process.env.RESEND_FROM_EMAIL || "suporte@bionk.me",
				to: newEmail,
				subject: "Confirme seu novo endereço de e-mail - Bionk",
				react: ChangeEmailVerificationEmail({
					username: user.name || "Usuário",
					verificationUrl,
				}) as React.ReactElement,
			});
		} catch {
			return NextResponse.json(
				{
					error:
						"Falha ao enviar e-mail de verificação. Tente novamente mais tarde.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: "E-mail de verificação enviado para o novo endereço." },
			{ status: 200 }
		);
	} catch  {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno." },
			{ status: 500 }
		);
	}
}

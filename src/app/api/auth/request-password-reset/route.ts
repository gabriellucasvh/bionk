// src/app/api/auth/request-password-reset/route.ts

import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
	throw new Error("RESEND_API_KEY não está definido no ambiente.");
}
const resend = new Resend(resendApiKey);

export async function POST(req: NextRequest): Promise<NextResponse> {
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

	try {
		const { email } = await req.json();

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Email inválido" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return NextResponse.json(
				{
					message:
						"Se o e-mail estiver cadastrado, um link de redefinição será enviado.",
				},
				{ status: 200 }
			);
		}

		const resetToken = crypto.randomBytes(32).toString("hex");
		const passwordResetToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		const passwordResetExpires = new Date(Date.now() + 3_600_000); // 1h

		await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetToken,
				passwordResetExpires,
			},
		});

		const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.bionk.me";
		const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

		try {
			const emailResponse = await resend.emails.send({
				from: "Bionk <contato@bionk.me>",
				to: [email],
				subject: "Redefinição de Senha - Bionk",
				html: `<p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este link expira em 1 hora.</p><p>Se você não solicitou isso, ignore este e-mail.</p>`,
			});

			if (emailResponse.error) {
				throw new Error(
					typeof emailResponse.error === "string"
						? emailResponse.error
						: String(emailResponse.error)
				);
			}

			return NextResponse.json(
				{
					message:
						"Se o e-mail estiver cadastrado, um link de redefinição será enviado.",
				},
				{ status: 200 }
			);
		} catch (emailError) {
			await prisma.user.update({
				where: { id: user.id },
				data: {
					passwordResetToken: null,
					passwordResetExpires: null,
				},
			});

			return NextResponse.json(
				{
					error: "Erro ao enviar e-mail de redefinição.",
					detalhes: String(emailError),
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno.", detalhes: String(error) },
			{ status: 500 }
		);
	}
}

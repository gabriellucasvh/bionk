// src/app/api/profile/verify-new-email/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function POST(req: Request) {
	try {
		const { token } = await req.json();

		if (!token) {
			return NextResponse.json(
				{ error: "Token de verificação é obrigatório" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findFirst({
			where: {
				emailVerificationToken: token as string,
				emailVerificationTokenExpires: { gt: new Date() },
			},
		});

		if (!user?.newEmailPending) {
			return NextResponse.json(
				{ error: "Token inválido, expirado ou solicitação não encontrada." },
				{ status: 400 }
			);
		}

		// Agora sabemos que user.newEmailPending não é null
		const newEmail = user.newEmailPending;

		await prisma.user.update({
			where: { id: user.id },
			data: {
				email: newEmail,
				emailVerified: new Date(),
				newEmailPending: null,
				emailVerificationToken: null,
				emailVerificationTokenExpires: null,
			},
		});

		return NextResponse.json(
			{ message: "Seu novo e-mail foi verificado e atualizado com sucesso!" },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno ao verificar seu e-mail." },
			{ status: 500 }
		);
	}
}

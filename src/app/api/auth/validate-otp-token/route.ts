import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { token } = await req.json();

		if (!token) {
			return NextResponse.json(
				{ error: "Token é obrigatório." },
				{ status: 400 }
			);
		}

		// Buscar usuário pelo token OTP
		const user = await prisma.user.findUnique({
			where: { otpToken: token },
		});

		if (!user) {
			return NextResponse.json({ error: "Token inválido." }, { status: 404 });
		}

		// Verificar se o token expirou
		if (!user.otpTokenExpiry || user.otpTokenExpiry < new Date()) {
			return NextResponse.json({ error: "Token expirado." }, { status: 410 });
		}

		// Verificar se o e-mail já foi verificado
		if (user.emailVerified) {
			return NextResponse.json(
				{ error: "E-mail já verificado." },
				{ status: 409 }
			);
		}

		// Verificar se já existe um OTP válido
		if (
			!(user.registrationOtp && user.registrationOtpExpiry) ||
			user.registrationOtpExpiry < new Date()
		) {
			return NextResponse.json(
				{ error: "Nenhum OTP válido encontrado. Solicite um novo código." },
				{ status: 410 }
			);
		}

		return NextResponse.json(
			{
				message: "Token válido.",
				userEmail: user.email,
				otpExpiry: user.registrationOtpExpiry,
			},
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor." },
			{ status: 500 }
		);
	}
}

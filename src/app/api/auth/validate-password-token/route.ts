import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const regCsrfCookie = cookieStore.get("reg_csrf");
        if (!(regCsrfCookie && regCsrfCookie.value)) {
            return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
        }
        const { token } = await req.json();

		if (!token) {
			return NextResponse.json(
				{ error: "Token é obrigatório." },
				{ status: 400 }
			);
		}

		// Buscar usuário pelo token
		const user = await prisma.user.findUnique({
			where: { passwordSetupToken: token },
		});

		if (!user) {
			return NextResponse.json({ error: "Token inválido." }, { status: 400 });
		}

        if (
            !user.registrationCsrfState ||
            user.registrationCsrfState !== regCsrfCookie.value
        ) {
            return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
        }
		if (
			!user.registrationCsrfExpiry ||
			user.registrationCsrfExpiry < new Date()
		) {
			return NextResponse.json({ error: "CSRF expirado." }, { status: 410 });
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

		return NextResponse.json(
			{
				valid: true,
				email: user.email,
				message: "Token válido.",
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

import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email || typeof email !== "string") {
			return NextResponse.json(
				{ error: "Email é obrigatório." },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				emailVerified: true,
				status: true,
				registrationOtp: true,
				registrationOtpExpiry: true,
				registrationOtpAttempts: true,
				registrationOtpBlockedUntil: true,
				registrationCsrfState: true,
				registrationCsrfExpiry: true,
				passwordSetupToken: true,
				passwordSetupTokenExpiry: true,
				otpToken: true,
				otpTokenExpiry: true,
				verificationToken: true,
				verificationTokenExpiry: true,
				usernameReservedAt: true,
				usernameReservationExpiry: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ success: true, message: "Nenhum dado para limpar." },
				{ status: 200 }
			);
		}

		if (user.emailVerified || user.status !== "pending") {
			return NextResponse.json(
				{ error: "Usuário já possui conta ativa." },
				{ status: 400 }
			);
		}

		const cookieStore = await cookies();
		const csrfCookie = cookieStore.get("reg_csrf");
		if (!(csrfCookie && csrfCookie.value)) {
			return NextResponse.json(
				{ error: "Sessão inválida para limpeza." },
				{ status: 400 }
			);
		}
		if (
			!user.registrationCsrfState ||
			user.registrationCsrfState !== csrfCookie.value
		) {
			return NextResponse.json(
				{ error: "Sessão inválida para limpeza." },
				{ status: 400 }
			);
		}
		if (
			!user.registrationCsrfExpiry ||
			user.registrationCsrfExpiry < new Date()
		) {
			return NextResponse.json(
				{ error: "Sessão expirada para limpeza." },
				{ status: 410 }
			);
		}

		await prisma.user.delete({
			where: { email },
		});

		const response = NextResponse.json(
			{ success: true, message: "Dados de registro limpos com sucesso." },
			{ status: 200 }
		);

		try {
			response.cookies.set("reg_csrf", "", {
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
				path: "/",
				maxAge: 0,
			});
		} catch {}

		return response;
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor." },
			{ status: 500 }
		);
	}
}

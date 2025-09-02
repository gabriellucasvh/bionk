import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({ 
			where: { email },
			select: {
				registrationOtpExpiry: true,
				registrationOtpBlockedUntil: true,
				registrationOtpAttempts: true,
				emailVerified: true
			}
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado." },
				{ status: 404 }
			);
		}

		if (user.emailVerified) {
			return NextResponse.json(
				{ error: "E-mail já verificado." },
				{ status: 409 }
			);
		}

		const now = new Date();
		const response: any = {
			remainingAttempts: Math.max(0, 5 - (user.registrationOtpAttempts ?? 0))
		};

		// Verificar se está bloqueado
		if (user.registrationOtpBlockedUntil && user.registrationOtpBlockedUntil > now) {
			const remainingBlockTime = Math.ceil(
				(user.registrationOtpBlockedUntil.getTime() - now.getTime()) / (1000 * 60)
			);
			response.isBlocked = true;
			response.blockTimeRemaining = remainingBlockTime;
			response.canRequestNewOtp = false;
		} else {
			response.isBlocked = false;
			response.blockTimeRemaining = 0;
			
			// Verificar se o OTP expirou
			if (user.registrationOtpExpiry && user.registrationOtpExpiry > now) {
				const remainingOtpTime = Math.ceil(
					(user.registrationOtpExpiry.getTime() - now.getTime()) / 1000
				);
				response.otpTimeRemaining = remainingOtpTime;
				response.isOtpExpired = false;
				response.canRequestNewOtp = false;
			} else {
				response.otpTimeRemaining = 0;
				response.isOtpExpired = true;
				response.canRequestNewOtp = true;
			}
		}

		return NextResponse.json(response, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno no servidor." },
			{ status: 500 }
		);
	}
}
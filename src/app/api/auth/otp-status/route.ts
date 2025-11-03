import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";

export async function GET(req: Request) {
	try {
		const headersList = await headers();
		const ip =
			headersList.get("cf-connecting-ip") ||
			headersList.get("x-real-ip") ||
			headersList.get("x-forwarded-for") ||
			"127.0.0.1";
		const { success } = await getAuthRateLimiter().limit(ip);
		if (!success) {
			return NextResponse.json(
				{ error: "Muitas requisições. Tente novamente mais tarde." },
				{ status: 429 }
			);
		}

		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		const cookieStore = await cookies();
		const regCsrfCookie = cookieStore.get("reg_csrf");
		if (!(regCsrfCookie && regCsrfCookie.value)) {
			return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: { registrationCsrfState: regCsrfCookie.value },
			select: {
				registrationOtpExpiry: true,
				registrationOtpBlockedUntil: true,
				registrationOtpAttempts: true,
				emailVerified: true,
				registrationCsrfState: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{
					remainingAttempts: 5,
					isBlocked: false,
					blockTimeRemaining: 0,
					otpTimeRemaining: 0,
					isOtpExpired: true,
					canRequestNewOtp: true,
				},
				{ status: 200 }
			);
		}

		if (
			!user.registrationCsrfState ||
			user.registrationCsrfState !== regCsrfCookie.value
		) {
			return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
		}

		if (user.emailVerified) {
			return NextResponse.json(
				{ error: "E-mail já verificado." },
				{ status: 409 }
			);
		}

		const now = new Date();
		const response: any = {
			remainingAttempts: Math.max(0, 5 - (user.registrationOtpAttempts ?? 0)),
		};

		// Verificar se está bloqueado
		if (
			user.registrationOtpBlockedUntil &&
			user.registrationOtpBlockedUntil > now
		) {
			const remainingBlockTime = Math.ceil(
				(user.registrationOtpBlockedUntil.getTime() - now.getTime()) /
					(1000 * 60)
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

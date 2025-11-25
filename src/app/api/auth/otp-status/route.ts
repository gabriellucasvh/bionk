export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const cookieHeader = req.headers.get("cookie") || "";
		let regCsrfCookieValue: string | null = null;
		for (const part of cookieHeader.split(";")) {
			const [k, v] = part.trim().split("=");
			if (k === "reg_csrf") {
				regCsrfCookieValue = v ? decodeURIComponent(v) : null;
				break;
			}
		}
		const regCsrfCookie = regCsrfCookieValue
			? { value: regCsrfCookieValue }
			: null;
		if (!(regCsrfCookie && regCsrfCookie.value)) {
			return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
		}

		const prisma = (await import("@/lib/prisma")).default;
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

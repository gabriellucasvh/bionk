export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const { token } = await req.json();
		if (!token || typeof token !== "string") {
			return NextResponse.json({ error: "Token inválido" }, { status: 400 });
		}
		const cookieHeader = req.headers.get("cookie") || "";
		let csrfCookieValue: string | null = null;
		for (const part of cookieHeader.split(";")) {
			const [k, v] = part.trim().split("=");
			if (k === "reg_csrf") {
				csrfCookieValue = v ? decodeURIComponent(v) : null;
				break;
			}
		}
		const csrfCookie = csrfCookieValue ? { value: csrfCookieValue } : null;
		if (!(csrfCookie && csrfCookie.value)) {
			return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
		}
		const user = await prisma.user.findFirst({
			where: { otpToken: token },
			select: {
				registrationCsrfState: true,
				registrationCsrfExpiry: true,
				otpTokenExpiry: true,
				emailVerified: true,
			},
		});
		if (!user) {
			return NextResponse.json(
				{ error: "Token inválido ou expirado." },
				{ status: 400 }
			);
		}
		if (
			!user.registrationCsrfState ||
			user.registrationCsrfState !== csrfCookie.value
		) {
			return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
		}
		if (
			!user.registrationCsrfExpiry ||
			user.registrationCsrfExpiry < new Date()
		) {
			return NextResponse.json({ error: "CSRF expirado." }, { status: 410 });
		}
		if (!user.otpTokenExpiry || user.otpTokenExpiry < new Date()) {
			return NextResponse.json(
				{ error: "Token inválido ou expirado." },
				{ status: 400 }
			);
		}
		if (user.emailVerified) {
			return NextResponse.json(
				{ error: "E-mail já verificado." },
				{ status: 409 }
			);
		}
		const remaining = Math.max(
			0,
			Math.ceil((user.otpTokenExpiry.getTime() - Date.now()) / 1000)
		);
		return NextResponse.json(
			{ message: "Token válido", otpExpiry: remaining },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno no servidor." },
			{ status: 500 }
		);
	}
}

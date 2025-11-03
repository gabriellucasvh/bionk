import crypto from "node:crypto";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import React from "react";
import { Resend } from "resend";
import OtpPasswordRecover from "@/emails/OtpPasswordRecover";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";

function getRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!(url && token)) {
		throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
	}
	return new Redis({ url, token });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;

export async function POST(req: NextRequest) {
	const headersList = await headers();
	const ip =
		headersList.get("cf-connecting-ip") ||
		headersList.get("x-real-ip") ||
		headersList.get("x-forwarded-for") ||
		"127.0.0.1";
	const limiter = getAuthRateLimiter();
	const { success } = await limiter.limit(ip);
	if (!success) {
		return NextResponse.json(
			{ error: "Muitas requisições. Tente novamente mais tarde." },
			{ status: 429 }
		);
	}

	try {
		const body = await req.json();
		const login = typeof body?.login === "string" ? body.login.trim() : "";
		if (!login) {
			return NextResponse.json({ error: "Login inválido" }, { status: 400 });
		}
		const isEmail = login.includes("@");
		if (isEmail && !EMAIL_REGEX.test(login)) {
			return NextResponse.json({ error: "Email inválido" }, { status: 400 });
		}
		if (!(isEmail || USERNAME_REGEX.test(login))) {
			return NextResponse.json({ error: "Username inválido" }, { status: 400 });
		}

		const normalizedLogin = login.toLowerCase();
		{
			const redis = getRedis();
			const rlKey = `fp:rl:start:${normalizedLogin}`;
			const count = await redis.incr(rlKey);
			if (count === 1) {
				await redis.expire(rlKey, 10 * 60);
			}
			if (count > 5) {
				return NextResponse.json(
					{ error: "Muitas requisições. Tente novamente mais tarde." },
					{ status: 429 }
				);
			}
		}

		const user = await prisma.user.findUnique({
			where: isEmail ? { email: login } : { username: login },
			select: { id: true, email: true },
		});

		if (!user?.email) {
			const res = NextResponse.json(
				{ message: "Se existir uma conta, um código foi enviado." },
				{ status: 200 }
			);
			res.cookies.set("fp_req", "1", {
				httpOnly: true,
				sameSite: "lax",
				path: "/esqueci-senha",
				maxAge: 10 * 60,
				secure: process.env.NODE_ENV === "production",
			});
			return res;
		}

		{
			const redis = getRedis();
			const otp = String(Math.floor(100_000 + Math.random() * 900_000));
			const tokenPlain = crypto.randomBytes(32).toString("hex");
			const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
			const tokenHash = crypto
				.createHash("sha256")
				.update(tokenPlain)
				.digest("hex");

			await redis.set(`fp:otp:${user.id}`, otpHash, { ex: 10 * 60 });
			await redis.set(`fp:otp_attempts:${user.id}`, 0, { ex: 10 * 60 });
			await redis.set(`fp:token_hash:${user.id}`, tokenHash, { ex: 20 * 60 });
			await redis.set(`fp:token_plain:${user.id}`, tokenPlain, { ex: 20 * 60 });
			await redis.set(`fp:lookup:${tokenHash}`, String(user.id), {
				ex: 20 * 60,
			});

			const resendApiKey = process.env.RESEND_API_KEY;
			if (resendApiKey) {
				const resend = new Resend(resendApiKey);
				await resend.emails.send({
					from: "Bionk <contato@bionk.me>",
					to: [user.email],
					subject: `Recuperação de senha – seu código é ${otp}`,
					react: React.createElement(OtpPasswordRecover, {
						otp,
						expiryMinutes: 10,
					}),
				});
			}
		}

		const res = NextResponse.json(
			{ message: "Código reenviado. Verifique seu e-mail." },
			{ status: 200 }
		);
		res.cookies.set("fp_req", "1", {
			httpOnly: true,
			sameSite: "lax",
			path: "/esqueci-senha",
			maxAge: 10 * 60,
			secure: process.env.NODE_ENV === "production",
		});
		return res;
	} catch {
		return NextResponse.json(
			{ error: "Erro interno no servidor." },
			{ status: 500 }
		);
	}
}

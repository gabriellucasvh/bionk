import crypto from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
function ensureRedisEnv() {
	if (!(REDIS_URL && REDIS_TOKEN)) {
		throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
	}
}
async function redisCmd(cmd: (string | number)[]) {
	ensureRedisEnv();
	const res = await fetch(REDIS_URL as string, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${REDIS_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(cmd),
	});
	const data = await res.json();
	return data?.result ?? null;
}
function getRedis() {
	return {
		incr: async (key: string) => Number(await redisCmd(["INCR", key])),
		expire: async (key: string, seconds: number) => {
			await redisCmd(["EXPIRE", key, seconds]);
		},
		set: async (
			key: string,
			value: string | number,
			opts?: { ex?: number }
		) => {
			const v = String(value);
			if (opts?.ex && opts.ex > 0) {
				await redisCmd(["SET", key, v, "EX", opts.ex]);
				return;
			}
			await redisCmd(["SET", key, v]);
		},
	} as const;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;

export async function POST(req: NextRequest) {
	const ip =
		req.headers.get("cf-connecting-ip") ||
		req.headers.get("x-real-ip") ||
		req.headers.get("x-forwarded-for") ||
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
				const { Resend } = await import("resend");
				const resend = new Resend(resendApiKey);
				const html = `<!doctype html><html lang="pt-BR"><head><meta charSet="utf-8" /><title>Bionk</title></head><body style="background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif;padding:20px 0"><div style="background:#ffffff;margin:0 auto;padding:20px;border:1px solid #dfe1e6;border-radius:8px;max-width:465px"><h1 style="color:#1a1a1a;font-size:28px;font-weight:bold;text-align:center;margin-bottom:20px">Código para Redefinir Senha</h1><p style="color:#525f7f;font-size:16px;line-height:24px;margin-bottom:15px">Recebemos uma solicitação para redefinir sua senha no Bionk. Use o código abaixo para continuar o processo:</p><div style="background:#f0f0f0;border-radius:4px;margin:20px 0;padding:10px;text-align:center"><div style="color:#0a0a0a;font-size:32px;font-weight:bold;letter-spacing:2px">${otp}</div></div><p style="color:#525f7f;font-size:16px;line-height:24px;margin-bottom:15px">Este código é válido por 10 minutos. Se você não solicitou a redefinição, ignore este e-mail.</p><hr style="border-color:#dfe1e6;margin:20px 0" /><p style="color:#8898aa;font-size:12px;line-height:16px;text-align:center">Bionk - Conectando suas ideias.</p><p style="text-align:center;margin-top:10px"><a href="${process.env.NEXTAUTH_URL || "https://bionk.me"}" style="color:#007bff;text-decoration:none;font-size:12px">Acessar Bionk</a></p></div></body></html>`;
				await resend.emails.send({
					from: "Bionk <contato@bionk.me>",
					to: [user.email],
					subject: `Recuperação de senha – seu código é ${otp}`,
					html,
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

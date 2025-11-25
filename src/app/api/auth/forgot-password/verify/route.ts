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
async function redisGet(key: string) {
	return (await redisCmd(["GET", key])) as any;
}
async function redisIncr(key: string) {
	return Number(await redisCmd(["INCR", key]));
}
async function redisExpire(key: string, seconds: number) {
	await redisCmd(["EXPIRE", key, seconds]);
}
async function redisDel(key: string) {
	await redisCmd(["DEL", key]);
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
		const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
		if (!(login && otp)) {
			return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
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
			const rlKey = `fp:rl:verify:${normalizedLogin}`;
			const count = await redisIncr(rlKey);
			if (count === 1) {
				await redisExpire(rlKey, 10 * 60);
			}
			if (count > 5) {
				return NextResponse.json(
					{ error: "Muitas tentativas. Tente novamente mais tarde." },
					{ status: 429 }
				);
			}
		}

		const user = await prisma.user.findUnique({
			where: isEmail ? { email: login } : { username: login },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Código inválido ou expirado." },
				{ status: 400 }
			);
		}

		const attemptsKey = `fp:otp_attempts:${user.id}`;
		const hashedKey = `fp:otp:${user.id}`;
		const tokenPlainKey = `fp:token_plain:${user.id}`;

		const attemptsRaw = await redisGet(attemptsKey);
		const attempts = typeof attemptsRaw === "number" ? attemptsRaw : 0;
		if (attempts >= 5) {
			return NextResponse.json(
				{ error: "Muitas tentativas. Tente novamente mais tarde." },
				{ status: 429 }
			);
		}

		const storedHash = (await redisGet(hashedKey)) as string | null;
		if (!storedHash) {
			await redisIncr(attemptsKey);
			return NextResponse.json(
				{ error: "Código inválido ou expirado." },
				{ status: 400 }
			);
		}

		const providedHash = crypto.createHash("sha256").update(otp).digest("hex");
		if (storedHash !== providedHash) {
			await redisIncr(attemptsKey);
			return NextResponse.json(
				{ error: "Código inválido ou expirado." },
				{ status: 400 }
			);
		}

		const plainToken = (await redisGet(tokenPlainKey)) as string | null;
		if (!plainToken) {
			return NextResponse.json(
				{ error: "Código inválido ou expirado." },
				{ status: 400 }
			);
		}

		await redisDel(hashedKey);
		await redisDel(attemptsKey);

		const res = NextResponse.json(
			{ message: "Código verificado" },
			{ status: 200 }
		);
		const tokenHash = crypto
			.createHash("sha256")
			.update(plainToken)
			.digest("hex");
		res.cookies.set("fp_verified", "1", {
			httpOnly: true,
			sameSite: "lax",
			path: "/esqueci-senha",
			maxAge: 20 * 60,
			secure: process.env.NODE_ENV === "production",
		});
		res.cookies.set("fp_th", tokenHash, {
			httpOnly: true,
			sameSite: "lax",
			path: "/esqueci-senha",
			maxAge: 20 * 60,
			secure: process.env.NODE_ENV === "production",
		});
		res.cookies.delete("fp_req");
		return res;
	} catch {
		return NextResponse.json(
			{ error: "Erro interno no servidor." },
			{ status: 500 }
		);
	}
}

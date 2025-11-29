import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { clearUserTokenCache } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// Redis via SDK padronizado

const REJEX_UPPERCASE = /[A-Z]/;
const REJEX_LOWERCASE = /[a-z]/;
const REJEX_DIGIT = /\d/;
const REJEX_REPEAT = /([A-Za-z0-9])\1{3,}/;

export async function POST(req: NextRequest) {
	const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
	const { success } = await getAuthRateLimiter().limit(ip);
	if (!success) {
		return NextResponse.json(
			{ error: "Muitas requisições. Tente novamente mais tarde." },
			{ status: 429 }
		);
	}

	try {
		const { token, password } = await req.json();
		if (!password || typeof password !== "string") {
			return NextResponse.json(
				{ error: "Token ou senha inválidos." },
				{ status: 400 }
			);
		}

		const errs: string[] = [];
		if (password.length < 9) {
			errs.push("A senha deve ter pelo menos 9 caracteres.");
		}
		if (password.length > 64) {
			errs.push("A senha deve ter no máximo 64 caracteres.");
		}
		if (!REJEX_UPPERCASE.test(password)) {
			errs.push("Inclua pelo menos 1 letra maiúscula.");
		}
		if (!REJEX_LOWERCASE.test(password)) {
			errs.push("Inclua pelo menos 1 letra minúscula.");
		}
		if (!REJEX_DIGIT.test(password)) {
			errs.push("Inclua pelo menos 1 número.");
		}
		const lowerPwd = password.toLowerCase();
		const seqs = [
			"123456",
			"234567",
			"345678",
			"456789",
			"012345",
			"abcdef",
			"bcdefg",
			"cdefgh",
			"defghi",
			"uvwxyz",
			"qwerty",
			"asdfgh",
			"zxcvbn",
		];
		if (seqs.some((s) => lowerPwd.includes(s))) {
			errs.push("Evite sequências óbvias (ex.: 123456, abcdef).");
		}
		if (REJEX_REPEAT.test(password)) {
			errs.push("Evite repetição excessiva de caracteres.");
		}
		if (errs.length > 0) {
			return NextResponse.json({ error: errs.join(" ") }, { status: 400 });
		}

		let hashedToken: string | null = null;
		if (token && typeof token === "string") {
			hashedToken = crypto.createHash("sha256").update(token).digest("hex");
		} else {
			const cookieHeader = req.headers.get("cookie") || "";
			let fpTh: string | null = null;
			for (const part of cookieHeader.split(";")) {
				const [k, v] = part.trim().split("=");
				if (k === "fp_th") {
					fpTh = v ? decodeURIComponent(v) : null;
					break;
				}
			}
			if (fpTh) {
				hashedToken = fpTh;
			}
		}
		if (!hashedToken) {
			return NextResponse.json(
				{ error: "Token inválido ou ausente." },
				{ status: 400 }
			);
		}
        const redis = getRedis();
        const userIdFromLookup = (await redis.get<string | null>(`fp:lookup:${hashedToken}`)) as
            | string
            | null;

		let userId = userIdFromLookup || null;
		if (!userId) {
			const userByPrismaToken = await prisma.user.findFirst({
				where: {
					passwordResetToken: hashedToken,
					passwordResetExpires: { gt: new Date() },
				},
				select: { id: true },
			});
			if (userByPrismaToken?.id) {
				userId = userByPrismaToken.id;
			}
		}

		if (!userId) {
			return NextResponse.json(
				{ error: "Token inválido ou expirado." },
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.$transaction([
			prisma.user.update({
				where: { id: userId },
				data: {
					hashedPassword,
					passwordResetToken: null,
					passwordResetExpires: null,
				},
			}),
			prisma.session.deleteMany({ where: { userId } }),
			prisma.account.updateMany({
				where: { userId },
				data: { refresh_token: null, access_token: null },
			}),
		]);

        try {
            await redis.del(`fp:token_hash:${userId}`);
            await redis.del(`fp:token_plain:${userId}`);
            await redis.del(`fp:lookup:${hashedToken}`);
        } catch {}

		try {
			clearUserTokenCache(userId);
		} catch {}

		const res = NextResponse.json(
			{ message: "Senha redefinida com sucesso!" },
			{ status: 200 }
		);
		try {
			res.cookies.delete("fp_verified");
			res.cookies.delete("fp_th");
		} catch {}
		return res;
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno ao redefinir a senha." },
			{ status: 500 }
		);
	}
}

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import { Redis } from "@upstash/redis";
import { clearUserTokenCache } from "@/lib/auth";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!(url && token)) {
    throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
  }
  return new Redis({ url, token });
}

const REJEX_UPPERCASE = /[A-Z]/;
const REJEX_LOWERCASE = /[a-z]/;
const REJEX_DIGIT = /\d/;
const REJEX_REPEAT = /([A-Za-z0-9])\1{3,}/;

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await getAuthRateLimiter().limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  try {
    const { token, password } = await req.json();
    if (!token || typeof token !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Token ou senha inválidos." }, { status: 400 });
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

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const redis = getRedis();
    const userIdFromLookup = await redis.get<string>(`fp:lookup:${hashedToken}`);

    let userId = userIdFromLookup || null;
    if (!userId) {
      const userByPrismaToken = await prisma.user.findFirst({
        where: { passwordResetToken: hashedToken, passwordResetExpires: { gt: new Date() } },
        select: { id: true },
      });
      if (userByPrismaToken?.id) {
        userId = userByPrismaToken.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { hashedPassword, passwordResetToken: null, passwordResetExpires: null },
      }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.account.updateMany({ where: { userId }, data: { refresh_token: null, access_token: null } }),
    ]);

    try {
      await redis.del(`fp:token_hash:${userId}`);
      await redis.del(`fp:token_plain:${userId}`);
      await redis.del(`fp:lookup:${hashedToken}`);
    } catch {}

    try {
      clearUserTokenCache(userId);
    } catch {}

    return NextResponse.json({ message: "Senha redefinida com sucesso!" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao redefinir a senha." },
      { status: 500 }
    );
  }
}
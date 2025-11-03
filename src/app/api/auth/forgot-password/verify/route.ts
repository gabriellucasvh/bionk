import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import prisma from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!(url && token)) {
    throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
  }
  return new Redis({ url, token });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;

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
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    if (!(login && otp)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const isEmail = login.includes("@");
    if (isEmail && !EMAIL_REGEX.test(login)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (!isEmail && !USERNAME_REGEX.test(login)) {
      return NextResponse.json({ error: "Username inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: isEmail ? { email: login } : { username: login },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    const redis = getRedis();
    const attemptsKey = `fp:otp_attempts:${user.id}`;
    const hashedKey = `fp:otp:${user.id}`;
    const tokenPlainKey = `fp:token_plain:${user.id}`;
    const tokenHashKey = `fp:token_hash:${user.id}`;

    const attemptsRaw = await redis.get<number>(attemptsKey);
    const attempts = typeof attemptsRaw === "number" ? attemptsRaw : 0;
    if (attempts >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const storedHash = await redis.get<string>(hashedKey);
    if (!storedHash) {
      await redis.incr(attemptsKey);
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    const providedHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (storedHash !== providedHash) {
      await redis.incr(attemptsKey);
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    const plainToken = await redis.get<string>(tokenPlainKey);
    if (!plainToken) {
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    await redis.del(hashedKey);
    await redis.del(attemptsKey);

    return NextResponse.json({ token: plainToken }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientIP } from "@/utils/geolocation";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 5; // 5 tentativas
const WINDOW_SECONDS = 3 * 60 * 60; // janela de 3 horas

// Redis via SDK padronizado

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { linkId, password } = body || {};

		if (
			!linkId ||
			(typeof linkId !== "number" && typeof linkId !== "string") ||
			!password ||
			typeof password !== "string"
		) {
			return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
		}

		const normalizedLinkId = Number(linkId);
		if (Number.isNaN(normalizedLinkId)) {
			return NextResponse.json(
				{ error: "ID do link inválido" },
				{ status: 400 }
			);
		}

        const redis = getRedis();

		const ip = getClientIP(req) || "127.0.0.1";
		const key = `link_password_attempts:${normalizedLinkId}:${ip}`;

		// Checar se o IP está bloqueado (5 ou mais tentativas na janela)
        const currentCountRaw = (await redis.get<number | null>(key)) as number | null;
		const currentCount = Number(currentCountRaw ?? 0);

		if (currentCount >= MAX_ATTEMPTS) {
			return NextResponse.json(
				{
					error: "Muitas tentativas. Tente novamente mais tarde.",
					remainingAttempts: 0,
				},
				{ status: 429 }
			);
		}

		// Buscar senha do link
		const link = await prisma.link.findUnique({
			where: { id: normalizedLinkId },
			select: { id: true, password: true, active: true },
		});

		if (!link?.active) {
			return NextResponse.json(
				{ error: "Link inválido ou inativo" },
				{ status: 404 }
			);
		}

		const isCorrect = !!link.password && password === link.password;

		// Se correto e não bloqueado, sucesso
		if (isCorrect) {
			return NextResponse.json({ success: true }, { status: 200 });
		}

		// Senha incorreta: incrementar contador e definir TTL de 3h
        const newCount = await redis.incr(key);
        if (newCount === 1) {
            await redis.expire(key, WINDOW_SECONDS);
        }

		const remaining = Math.max(0, MAX_ATTEMPTS - newCount);

		if (newCount >= MAX_ATTEMPTS) {
			return NextResponse.json(
				{
					error: "Muitas tentativas. Tente novamente mais tarde.",
					remainingAttempts: 0,
				},
				{ status: 429 }
			);
		}

		return NextResponse.json(
			{ error: "Senha incorreta", remainingAttempts: remaining },
			{ status: 401 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	// --- RATE LIMITER ---
  const headersList = await headers()
	const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
	const { success } = await getAuthRateLimiter().limit(ip);
	if (!success) {
		return NextResponse.json(
			{ error: "Muitas requisições. Tente novamente mais tarde." },
			{ status: 429 }
		);
	}
	// --- FIM RATE LIMITER ---

	try {
		const { token, password } = await req.json();

		if (
			!token ||
			typeof token !== "string" ||
			!password ||
			typeof password !== "string"
		) {
			return NextResponse.json(
				{ error: "Token ou senha inválidos." },
				{ status: 400 }
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: "A senha deve ter pelo menos 6 caracteres." },
				{ status: 400 }
			);
		}

		const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

		const user = await prisma.user.findFirst({
			where: {
				passwordResetToken: hashedToken,
				passwordResetExpires: { gt: new Date() },
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Token inválido ou expirado." },
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				hashedPassword,
				passwordResetToken: null,
				passwordResetExpires: null,
			},
		});

		return NextResponse.json(
			{ message: "Senha redefinida com sucesso!" },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno ao redefinir a senha." },
			{ status: 500 }
		);
	}
}

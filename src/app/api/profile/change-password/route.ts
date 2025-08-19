import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		// --- RATE LIMITER ---
		const identifier = session.user.id; // identificador por usuário
		const { success } = await getAuthRateLimiter().limit(identifier);
		if (!success) {
			return NextResponse.json(
				{ error: "Muitas requisições. Tente novamente mais tarde." },
				{ status: 429 }
			);
		}
		// --- FIM RATE LIMITER ---

		if (!(session.user as any).isCredentialsUser) {
			return NextResponse.json(
				{ error: "Operação não permitida para este tipo de conta." },
				{ status: 403 }
			);
		}

		const { currentPassword, newPassword } = await req.json();

		if (!(currentPassword && newPassword)) {
			return NextResponse.json(
				{ error: "Senha atual e nova senha são obrigatórias" },
				{ status: 400 }
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: "A nova senha deve ter pelo menos 6 caracteres" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});
		if (!user?.hashedPassword) {
			return NextResponse.json(
				{ error: "Usuário não encontrado ou senha não configurada" },
				{ status: 404 }
			);
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.hashedPassword
		);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Senha atual incorreta" },
				{ status: 403 }
			);
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: user.id },
			data: { hashedPassword: hashedNewPassword },
		});

		return NextResponse.json(
			{ message: "Senha alterada com sucesso!" },
			{ status: 200 }
		);
	} catch  {
		return NextResponse.json(
			{ error: "Ocorreu um erro interno ao alterar a senha." },
			{ status: 500 }
		);
	}
}

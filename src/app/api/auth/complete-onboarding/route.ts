import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { name, username, bio } = await request.json();

		// Validações
		if (!name || name.trim().length === 0) {
			return NextResponse.json(
				{ error: "Nome é obrigatório" },
				{ status: 400 }
			);
		}

		if (name.length > 44) {
			return NextResponse.json(
				{ error: "Nome deve ter no máximo 44 caracteres" },
				{ status: 400 }
			);
		}

		if (!username || username.trim().length === 0) {
			return NextResponse.json(
				{ error: "Username é obrigatório" },
				{ status: 400 }
			);
		}

		if (username.length > 30) {
			return NextResponse.json(
				{ error: "Username deve ter no máximo 30 caracteres" },
				{ status: 400 }
			);
		}

		// Verificar se username está na blacklist
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			return NextResponse.json(
				{ error: "Username não disponível" },
				{ status: 400 }
			);
		}

		// Verificar se username já está em uso
		const existingUser = await prisma.user.findFirst({
			where: {
				username: username.toLowerCase(),
				NOT: {
					id: session.user.id,
				},
			},
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Username já está em uso" },
				{ status: 400 }
			);
		}

		// Atualizar usuário
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: name.trim(),
				username: username.toLowerCase().trim(),
				bio: bio?.trim() || null,
				onboardingCompleted: true,
			},
		});

		return NextResponse.json(
			{
				success: true,
				user: {
					id: updatedUser.id,
					name: updatedUser.name,
					username: updatedUser.username,
					bio: updatedUser.bio,
					image: updatedUser.image,
				},
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Erro ao completar onboarding:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

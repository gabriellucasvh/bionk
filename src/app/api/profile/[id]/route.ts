// src/app/api/profile/[id]/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// FUNÇÃO GET ADICIONADA
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;

	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				name: true,
				username: true,
				bio: true,
				image: true,
				email: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		return NextResponse.json(user);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;
	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name, username, bio, bannerUrl } = body;

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name,
				username,
				bio,
				bannerUrl,
			},
		});

		// Revalida a página do perfil do usuário
		if (updatedUser.username) {
			revalidatePath(`/${updatedUser.username}`);
		}

		return NextResponse.json(updatedUser);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

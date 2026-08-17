import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
	// Sempre usa getServerSession aqui, pois queremos o usuário logado real,
	// ignorando o cookie de perfil ativo (queremos listar todos os perfis do dono).
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const ownerId = session.user.id;

		const profiles = await prisma.user.findMany({
			where: {
				OR: [{ id: ownerId }, { ownerId }],
			},
			select: {
				id: true,
				name: true,
				username: true,
				image: true,
				bio: true,
				ownerId: true,
				CustomPresets: true,
				Link: true,
				Text: true,
				Video: true,
				Image: true,
				Music: true,
				Event: true,
				ContactForm: true,
				SocialLink: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return NextResponse.json({ profiles });
	} catch (error) {
		console.error("Erro ao buscar perfis:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

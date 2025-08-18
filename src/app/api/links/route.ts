// api/links/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache"; // IMPORTADO
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	const status = searchParams.get("status");

	if (!userId) {
		return NextResponse.json(
			{ error: "Parâmetro 'userId' ausente." },
			{ status: 400 }
		);
	}

	try {
		const links = await prisma.link.findMany({
			where: { userId, archived: status === "archived" },
			orderBy: { order: "asc" },
		});
		return NextResponse.json({ links });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao buscar links." },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	if (!userExists) {
		return NextResponse.json(
			{
				error:
					"Usuário da sessão não encontrado no banco de dados. Por favor, faça login novamente.",
			},
			{ status: 404 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			url,
			sectionTitle,
			badge,
			password,
			expiresAt,
			deleteOnClicks,
			launchesAt,
			isProduct,
			price,
			productImageUrl, // Manteremos o campo para receber a URL após o upload
		} = body;

		if (!(title && url)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios não informados." },
				{ status: 400 }
			);
		}

		// --- NOVA LÓGICA DE ORDENAÇÃO ---
		// 1. "Empurra" todos os links existentes para baixo (incrementa a ordem)
		await prisma.link.updateMany({
			where: { userId: session.user.id },
			data: {
				order: {
					increment: 1,
				},
			},
		});

		// 2. Cria o novo link na posição 0 (topo)
		const newLink = await prisma.link.create({
			data: {
				userId: session.user.id,
				title,
				url,
				order: 0, // Novo link sempre no topo
				active: true,
				sectionTitle,
				badge: badge || null,
				password,
				expiresAt,
				deleteOnClicks,
				launchesAt,
				isProduct,
				price,
				productImageUrl,
			},
		});

		// NOVO: Força a revalidação da página do usuário
		if (userExists.username) {
			revalidatePath(`/${userExists.username}`);
		}

		return NextResponse.json(newLink, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar link." },
			{ status: 500 }
		);
	}
}

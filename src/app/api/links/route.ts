// src/app/api/links/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
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

export async function POST(request: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado - Faça login para criar links" }, { status: 401 });
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
		} = body;

		if (!(title && url)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios não informados." },
				{ status: 400 }
			);
		}

		let sectionId: number | null = null;

		// Se um título de seção for fornecido, encontre ou crie a seção
		if (
			sectionTitle &&
			typeof sectionTitle === "string" &&
			sectionTitle.trim() !== ""
		) {
			const lastSection = await prisma.section.findFirst({
				where: { userId: session.user.id },
				orderBy: { order: "desc" },
			});

			// Usamos 'upsert' para criar a seção se ela não existir, ou encontrá-la se já existir
			const section = await prisma.section.upsert({
				where: {
					userId_title: {
						// Assumindo que você tem uma constraint única para userId e title na sua tabela Section
						userId: session.user.id,
						title: sectionTitle.trim(),
					},
				},
				update: {}, // Não é necessário atualizar nada se a seção já existir
				create: {
					userId: session.user.id,
					title: sectionTitle.trim(),
					order: lastSection ? lastSection.order + 1 : 0,
				},
			});
			sectionId = section.id;
		}

		await prisma.link.updateMany({
			where: { userId: session.user.id, sectionId },
			data: {
				order: {
					increment: 1,
				},
			},
		});

		const newLink = await prisma.link.create({
			data: {
				userId: session.user.id,
				title,
				url,
				order: 0,
				active: true,
				sectionId, // Associa o link com a seção correta
				sectionTitle,
				badge: badge || null,
				password,
				expiresAt,
				deleteOnClicks,
				launchesAt,
			},
		});

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

// src/app/api/links/route.ts

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
			include: {
				section: {
					select: {
						id: true,
						title: true,
						active: true,
						order: true,
					},
				},
			},
		});

		// Transform the data to include section information directly in the link
		const transformedLinks = links.map((link) => ({
			...link,
			sectionId: link.section?.id || link.sectionId,
			section: link.section ? {
				id: link.section.id,
				title: link.section.title,
			} : null,
		}));

		return NextResponse.json({ links: transformedLinks });
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
		return NextResponse.json(
			{ error: "Não autorizado - Faça login para criar links" },
			{ status: 401 }
		);
	}

	if (session.user.banido) {
		return NextResponse.json(
			{ 
				error: "Conta suspensa", 
				message: "Sua conta foi suspensa e não pode realizar esta ação." 
			},
			{ status: 403 }
		);
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
			sectionId,
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

		// Validar se sectionId existe se fornecido
		if (sectionId) {
			const section = await prisma.section.findFirst({
				where: {
					id: sectionId,
					userId: session.user.id,
				},
			});
			if (!section) {
				return NextResponse.json(
					{ error: "Seção não encontrada." },
					{ status: 404 }
				);
			}
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
				sectionId: sectionId || null,
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

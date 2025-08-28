// src/app/api/links/reorder/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const reorderSchema = z.object({
	links: z.array(
		z.object({
			id: z.number(),
			sectionTitle: z.string().nullable(),
		})
	),
});

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}
	const userId = session.user.id;

	try {
		const body = await req.json();
		const validation = reorderSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Dados da requisição inválidos.",
					details: validation.error.flatten(),
				},
				{ status: 400 }
			);
		}

		const { links } = validation.data;

		// Busca todas as seções do usuário de uma vez para otimizar
		const userSections = await prisma.section.findMany({
			where: { userId },
		});
		const sectionTitleToIdMap = new Map(
			userSections.map((s) => [s.title, s.id])
		);

		// CORREÇÃO: Removido o 'async' desnecessário
		const updateTransactions = links.map((link, index) => {
			let sectionId: number | null = null;
			if (link.sectionTitle) {
				sectionId = sectionTitleToIdMap.get(link.sectionTitle) ?? null;
			}

			// Retorna a promessa do Prisma, sem 'await'
			return prisma.link.update({
				where: {
					id: link.id,
					userId,
				},
				data: {
					order: index,
					sectionTitle: link.sectionTitle,
					sectionId, // Atualiza o ID da seção
				},
			});
		});

		// CORREÇÃO: Passa o array de promessas diretamente para a transação
		await prisma.$transaction(updateTransactions);

		return NextResponse.json({ message: "Ordem atualizada com sucesso!" });
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro inesperado no servidor." },
			{ status: 500 }
		);
	}
}

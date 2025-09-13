// src/app/api/links/reorder/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const reorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.number(),
			order: z.number(),
			type: z.enum(["link", "section"]),
			sectionId: z.number().nullable().optional(),
		})
	),
});

export async function PUT(req: Request): Promise<NextResponse> {
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

		const { items } = validation.data;

		// Separar links e seções
		const linkItems = items.filter((item) => item.type === "link");
		const sectionItems = items.filter((item) => item.type === "section");

		// Validar se todas as seções referenciadas existem
		const referencedSectionIds = linkItems
			.map(item => item.sectionId)
			.filter(id => id !== null && id !== undefined);
		
		if (referencedSectionIds.length > 0) {
			const existingSections = await prisma.section.findMany({
				where: {
					id: { in: referencedSectionIds },
					userId,
				},
			});
			const existingSectionIds = new Set(existingSections.map(s => s.id));
			const invalidSectionIds = referencedSectionIds.filter(id => !existingSectionIds.has(id));
			
			if (invalidSectionIds.length > 0) {
				return NextResponse.json(
					{ error: `Seções não encontradas: ${invalidSectionIds.join(', ')}` },
					{ status: 404 }
				);
			}
		}

		const updateTransactions: any[] = [];

		// Atualizar links normais
		for (const item of linkItems) {
			updateTransactions.push(
				prisma.link.update({
					where: {
						id: item.id,
						userId,
					},
					data: {
						order: item.order,
						sectionId: item.sectionId || null,
					},
				})
			);
		}

		// Buscar todas as seções existentes como links primeiro
		const existingLinks = await prisma.link.findMany({
			where: {
				id: { in: sectionItems.map(item => item.id) },
				userId,
				type: "section",
			},
			select: { id: true },
		});
		const existingLinkIds = new Set(existingLinks.map(link => link.id));

		// Atualizar seções (tratadas como links especiais)
		for (const item of sectionItems) {
			if (existingLinkIds.has(item.id)) {
				// Atualizar link existente que representa a seção
				updateTransactions.push(
					prisma.link.update({
						where: {
							id: item.id,
							userId,
						},
						data: {
							order: item.order,
						},
					})
				);
			} else {
				// Atualizar a seção na tabela Section (manter compatibilidade)
				updateTransactions.push(
					prisma.section.update({
						where: {
							id: item.id,
							userId,
						},
						data: {
							order: item.order,
						},
					})
				);
			}
		}

		await prisma.$transaction(updateTransactions);

		return NextResponse.json({ message: "Ordem atualizada com sucesso!" });
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro inesperado no servidor." },
			{ status: 500 }
		);
	}
}

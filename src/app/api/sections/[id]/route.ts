// src/app/api/sections/[id]/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const sectionId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(sectionId)) {
		return NextResponse.json(
			{ error: "ID da seção é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { title, links, active } = body;

		// Inicia uma transação para garantir a consistência dos dados
        const result = await prisma.$transaction(async (tx: any) => {
			// Se o status 'active' está sendo atualizado, atualiza também todos os links associados
			if (typeof active === "boolean") {
				await tx.link.updateMany({
					where: { sectionId },
					data: { active },
				});
			}

			// Atualiza a seção
			const updatedSection = await tx.section.update({
				where: { id: sectionId, userId: session.user.id },
				data: {
					title,
					links: links
						? {
								set: links.map((linkId: string) => ({
									id: Number.parseInt(linkId, 10),
								})),
							}
						: undefined,
					active,
				},
			});

			return updatedSection;
		});

		// Revalida os caches para que as alterações apareçam imediatamente
		revalidatePath("/studio/links");
		if (session.user.username) {
			revalidatePath(`/${session.user.username}`);
		}

		return NextResponse.json(result);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID da seção é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		// Arquiva os links antes de deletar a seção
		await prisma.link.updateMany({
			where: { sectionId: Number.parseInt(id, 10) },
			data: { archived: true },
		});

		await prisma.section.delete({
			where: { id: Number.parseInt(id, 10) },
		});

		revalidatePath("/studio/links");

		return NextResponse.json({ message: "Seção excluída com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

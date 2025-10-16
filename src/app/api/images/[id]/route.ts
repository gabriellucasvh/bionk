import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const imageId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(imageId)) {
		return NextResponse.json(
			{ error: "ID da imagem é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			description,
			layout,
			ratio,
			sizePercent,
			items,
			active,
			archived,
			sectionId,
		} = body;

		const image = await prisma.image.findFirst({
			where: { id: imageId, userId: session.user.id },
		});

		if (!image) {
			return NextResponse.json(
				{ error: "Imagem não encontrada" },
				{ status: 404 }
			);
		}

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		if (description && description.length > 200) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 200 caracteres" },
				{ status: 400 }
			);
		}

		if (layout && !["single", "column", "carousel"].includes(layout)) {
			return NextResponse.json(
				{ error: "Layout inválido. Use: single, column ou carousel" },
				{ status: 400 }
			);
		}

		const updateData: any = {
			...(title !== undefined && { title: title?.trim() || null }),
			...(description !== undefined && {
				description: description?.trim() || null,
			}),
			...(layout !== undefined && { layout }),
			...(ratio !== undefined && { ratio }),
			...(sizePercent !== undefined && { sizePercent }),
			...(items !== undefined && { items }),
			...(active !== undefined && { active }),
			...(archived !== undefined && { archived }),
			...(sectionId !== undefined && { sectionId: sectionId || null }),
		};

		const updatedImage = await prisma.image.update({
			where: { id: imageId },
			data: updateData,
		});

		return NextResponse.json(updatedImage);
	} catch (error) {
		console.error("Erro ao atualizar imagem:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const imageId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(imageId)) {
		return NextResponse.json(
			{ error: "ID da imagem é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const image = await prisma.image.findFirst({
			where: { id: imageId, userId: session.user.id },
		});

		if (!image) {
			return NextResponse.json(
				{ error: "Imagem não encontrada" },
				{ status: 404 }
			);
		}

		await prisma.image.delete({
			where: { id: imageId },
		});

		return NextResponse.json({ message: "Imagem excluída com sucesso" });
	} catch (error) {
		console.error("Erro ao excluir imagem:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

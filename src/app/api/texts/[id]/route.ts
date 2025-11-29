import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileTextsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const textId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(textId)) {
		return NextResponse.json(
			{ error: "ID do texto é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			description,
			position,
			hasBackground,
			isCompact,
			active,
			archived,
		} = body;

		const text = await prisma.text.findFirst({
			where: { id: textId, userId: session.user.id },
		});

		if (!text) {
			return NextResponse.json(
				{ error: "Texto não encontrado" },
				{ status: 404 }
			);
		}

		if (description && description.length > 1500) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 1500 caracteres" },
				{ status: 400 }
			);
		}

		const updatedText = await prisma.text.update({
			where: { id: textId },
			data: {
				...(title !== undefined && { title: title.trim() }),
				...(description !== undefined && { description: description.trim() }),
				...(position !== undefined && { position }),
				...(hasBackground !== undefined && { hasBackground }),
				...(isCompact !== undefined && { isCompact }),
				...(active !== undefined && { active }),
				...(archived !== undefined && { archived }),
			},
		});

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileTextsTag(user.username));
			}
		} catch {}

		return NextResponse.json(updatedText);
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
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const textId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(textId)) {
		return NextResponse.json(
			{ error: "ID do texto é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const text = await prisma.text.findFirst({
			where: { id: textId, userId: session.user.id },
		});

		if (!text) {
			return NextResponse.json(
				{ error: "Texto não encontrado" },
				{ status: 404 }
			);
		}

		await prisma.text.delete({
			where: { id: textId },
		});

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileTextsTag(user.username));
			}
		} catch {}

		return NextResponse.json({ message: "Texto excluído com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

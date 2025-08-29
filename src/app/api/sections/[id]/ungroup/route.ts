// src/app/api/sections/[id]/ungroup/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
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
		await prisma.link.updateMany({
			where: { sectionId: Number.parseInt(id, 10) },
			data: { sectionId: null, sectionTitle: null },
		});

		await prisma.section.delete({
			where: { id: Number.parseInt(id, 10) },
		});

		revalidatePath("/studio/links");

		return NextResponse.json({
			message: "Links desagrupados e seção excluída com sucesso",
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

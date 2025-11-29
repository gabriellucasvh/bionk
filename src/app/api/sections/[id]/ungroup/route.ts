// src/app/api/sections/[id]/ungroup/route.ts

import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileLinksTag, profileSectionsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

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
			data: { sectionId: null },
		});

		await prisma.section.delete({
			where: { id: Number.parseInt(id, 10) },
		});

		revalidatePath("/studio/links");

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileSectionsTag(user.username));
				revalidateTag(profileLinksTag(user.username));
			}
		} catch {}

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

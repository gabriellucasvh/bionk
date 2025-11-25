import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function POST(
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
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		// Buscar o link atual para verificar se pertence ao usuário
		const currentLink = await prisma.link.findFirst({
			where: {
				id: Number.parseInt(id, 10),
				userId: session.user.id,
			},
			select: { animated: true },
		});

		if (!currentLink) {
			return NextResponse.json(
				{ error: "Link não encontrado" },
				{ status: 404 }
			);
		}

		// Alternar o estado de animação
		const updatedLink = await prisma.link.update({
			where: { id: Number.parseInt(id, 10) },
			data: {
				animated: !currentLink.animated,
			},
		});

		// Revalida tanto o studio quanto a página do perfil
		revalidatePath("/studio/links");

		// Busca o username do usuário para revalidar sua página
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
		}

		return NextResponse.json({
			message: "Estado de animação atualizado com sucesso",
			animated: updatedLink.animated,
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

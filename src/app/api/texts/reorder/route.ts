import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const reorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.number(),
			order: z.number(),
		})
	),
});

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const validation = reorderSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: "Dados inválidos", details: validation.error.flatten() },
				{ status: 400 }
			);
		}

		const { items } = validation.data;

		const transactions = items.map((item) =>
			prisma.text.update({
				where: {
					id: item.id,
					userId: session.user.id,
				},
				data: {
					order: item.order,
				},
			})
		);

		await prisma.$transaction(transactions);

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
			message: "Ordem dos textos atualizada com sucesso",
		});
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro ao reordenar os textos." },
			{ status: 500 }
		);
	}
}

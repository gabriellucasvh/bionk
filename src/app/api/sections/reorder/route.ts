import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { profileSectionsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

// A API espera um array de objetos com id e order
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

		// Cria uma transação para atualizar o campo 'order' de cada seção
		const transactions = items.map((item) =>
			prisma.section.update({
				where: {
					id: item.id,
					userId: session.user.id, // Garante que o usuário só pode atualizar suas próprias seções
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
			revalidateTag(profileSectionsTag(user.username));
		}

		return NextResponse.json({ message: "Seções reordenadas com sucesso!" });
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro ao reordenar as seções." },
			{ status: 500 }
		);
	}
}

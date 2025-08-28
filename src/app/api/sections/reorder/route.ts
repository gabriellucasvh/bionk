import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// A API espera um array de IDs (números) que representam a nova ordem das seções
const reorderSchema = z.object({
	order: z.array(z.number()),
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

		const { order } = validation.data;

		// Cria uma transação para atualizar o campo 'order' de cada seção
		const transactions = order.map((id, index) =>
			prisma.section.update({
				where: {
					id,
					userId: session.user.id, // Garante que o usuário só pode atualizar suas próprias seções
				},
				data: {
					order: index,
				},
			})
		);

		await prisma.$transaction(transactions);

		return NextResponse.json({ message: "Seções reordenadas com sucesso!" });
	} catch  {
		return NextResponse.json(
			{ error: "Ocorreu um erro ao reordenar as seções." },
			{ status: 500 }
		);
	}
}

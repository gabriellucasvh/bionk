import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppSession } from "@/lib/auth-session";
import { evictProfilePageCache, profileLinksTag } from "@/lib/cache-tags";
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
	const session = await getAppSession();
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
			prisma.contactForm.update({
				where: { id: item.id, userId: session.user.id },
				data: { order: item.order },
			})
		);

		await prisma.$transaction(transactions);

		revalidatePath("/studio/links");
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileLinksTag(user.username));
			await evictProfilePageCache(user.username);
		}

		return NextResponse.json({
			message: "Ordem dos formulários de contato atualizada",
		});
	} catch {
		return NextResponse.json(
			{ error: "Ocorreu um erro ao reordenar os formulários de contato." },
			{ status: 500 }
		);
	}
}

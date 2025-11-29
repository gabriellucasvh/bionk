import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileVideosTag, evictProfilePageCache } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function PUT(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const { items } = await request.json();

		if (!Array.isArray(items)) {
			return NextResponse.json(
				{ error: "Items deve ser um array" },
				{ status: 400 }
			);
		}

		const updatePromises = items.map((item) =>
			prisma.video.update({
				where: {
					id: item.id,
					userId: session.user.id,
				},
				data: {
					order: item.order,
				},
			})
		);

		await Promise.all(updatePromises);

		revalidatePath("/studio/links");
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileVideosTag(user.username));
			await evictProfilePageCache(user.username);
		}

		return NextResponse.json({ message: "Ordem dos vídeos atualizada com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

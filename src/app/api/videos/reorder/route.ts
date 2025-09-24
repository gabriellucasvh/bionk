import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const { videoIds } = await request.json();

		if (!Array.isArray(videoIds)) {
			return NextResponse.json(
				{ error: "videoIds deve ser um array" },
				{ status: 400 }
			);
		}

		const videos = await prisma.video.findMany({
			where: {
				id: { in: videoIds },
				userId: session.user.id,
			},
		});

		if (videos.length !== videoIds.length) {
			return NextResponse.json(
				{ error: "Alguns vídeos não foram encontrados" },
				{ status: 404 }
			);
		}

		const updatePromises = videoIds.map((id: number, index: number) =>
			prisma.video.update({
				where: { id },
				data: { order: index },
			})
		);

		await Promise.all(updatePromises);

		return NextResponse.json({ message: "Ordem dos vídeos atualizada com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
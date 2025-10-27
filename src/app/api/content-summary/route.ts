// src/app/api/content-summary/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json(
			{ error: "Parâmetro 'userId' ausente." },
			{ status: 400 }
		);
	}

	try {
		const [
			linksCount,
			textsCount,
			videosCount,
			imagesCount,
			musicsCount,
			socialLinksCount,
			sectionsCount,
		] = await Promise.all([
			prisma.link.count({ where: { userId, archived: false } }),
			prisma.text.count({ where: { userId, archived: false } }),
			prisma.video.count({ where: { userId, archived: false } }),
			prisma.image.count({ where: { userId, archived: false } }),
			prisma.music.count({ where: { userId, archived: false } }),
			prisma.socialLink.count({ where: { userId, active: true } }),
			prisma.section.count({ where: { userId, active: true } }),
		]);

		return NextResponse.json({
			linksCount,
			textsCount,
			videosCount,
			imagesCount,
			musicsCount,
			socialLinksCount,
			sectionsCount,
		});
	} catch {
		return NextResponse.json(
			{ error: "Falha ao buscar resumo de conteúdo." },
			{ status: 500 }
		);
	}
}

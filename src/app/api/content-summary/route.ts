// src/app/api/content-summary/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export const runtime = "nodejs";

export async function GET(_request: Request): Promise<NextResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = session.user.id;

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

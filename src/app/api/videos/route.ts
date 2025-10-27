import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Regex no escopo global
const DIRECT_REGEX = /\.(mp4|webm|ogg)$/i;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const VIMEO_REGEX = /vimeo\.com\/(\d+)/;
const TIKTOK_REGEX = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
const TWITCH_REGEX = /twitch\.tv\/videos\/(\d+)/;

function validateVideoUrl(
	url: string
): { type: string; normalizedUrl: string } | null {
	const trimmedUrl = url.trim();

	if (DIRECT_REGEX.test(trimmedUrl)) {
		return { type: "direct", normalizedUrl: trimmedUrl };
	}

	const youtubeMatch = trimmedUrl.match(YOUTUBE_REGEX);
	if (youtubeMatch) {
		return {
			type: "youtube",
			normalizedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
		};
	}

	const vimeoMatch = trimmedUrl.match(VIMEO_REGEX);
	if (vimeoMatch) {
		return {
			type: "vimeo",
			normalizedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
		};
	}

	const tiktokMatch = trimmedUrl.match(TIKTOK_REGEX);
	if (tiktokMatch) {
		return {
			type: "tiktok",
			normalizedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
		};
	}

	const twitchMatch = trimmedUrl.match(TWITCH_REGEX);
	if (twitchMatch) {
		return {
			type: "twitch",
			normalizedUrl: `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=localhost`,
		};
	}

	return null;
}

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const { title, description, url, sectionId } = await request.json();

		if (!url) {
			return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
		}

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		if (description && description.length > 200) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 200 caracteres" },
				{ status: 400 }
			);
		}

		const validation = validateVideoUrl(url);
		if (!validation) {
			return NextResponse.json(
				{
					error:
						"URL de vídeo inválida. Aceitos: YouTube, Vimeo, TikTok, Twitch ou arquivos .mp4, .webm, .ogg",
				},
				{ status: 400 }
			);
		}

        await prisma.$transaction([
            prisma.link.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
            prisma.text.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
            prisma.section.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
            prisma.video.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
            prisma.image.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
            prisma.music.updateMany({
                where: { userId: session.user.id },
                data: { order: { increment: 1 } },
            }),
        ]);

		const video = await prisma.video.create({
			data: {
				title: title?.trim() || null,
				description: description?.trim() || null,
				type: validation.type,
				url: validation.normalizedUrl,
				active: true,
				order: 0,
				userId: session.user.id,
				sectionId: sectionId || null,
			},
		});

		return NextResponse.json(video, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		const videos = await prisma.video.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ videos });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

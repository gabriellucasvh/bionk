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

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const videoId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(videoId)) {
		return NextResponse.json(
			{ error: "ID do vídeo é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { title, description, url, active, archived } = body;

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

		const video = await prisma.video.findFirst({
			where: { id: videoId, userId: session.user.id },
		});

		if (!video) {
			return NextResponse.json(
				{ error: "Vídeo não encontrado" },
				{ status: 404 }
			);
		}

		const updateData: any = {
			...(title !== undefined && { title: title?.trim() || null }),
			...(description !== undefined && {
				description: description?.trim() || null,
			}),
			...(active !== undefined && { active }),
			...(archived !== undefined && { archived }),
		};

		if (url) {
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
			updateData.type = validation.type;
			updateData.url = validation.normalizedUrl;
		}

		const updatedVideo = await prisma.video.update({
			where: { id: videoId },
			data: updateData,
		});

		return NextResponse.json(updatedVideo);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const videoId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(videoId)) {
		return NextResponse.json(
			{ error: "ID do vídeo é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const video = await prisma.video.findFirst({
			where: { id: videoId, userId: session.user.id },
		});

		if (!video) {
			return NextResponse.json(
				{ error: "Vídeo não encontrado" },
				{ status: 404 }
			);
		}

		await prisma.video.delete({
			where: { id: videoId },
		});

		return NextResponse.json({ message: "Vídeo excluído com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

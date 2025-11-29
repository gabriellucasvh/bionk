import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evictProfilePageCache, profileVideosTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const DIRECT_REGEX = /\.(mp4|webm|ogg)$/i;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const YOUTUBE_EMBED_REGEX =
	/(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]+)/;
const VIMEO_REGEX = /vimeo\.com\/(\d+)/;
const VIMEO_EMBED_REGEX = /player\.vimeo\.com\/video\/(\d+)/;
const TIKTOK_REGEX = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
const TIKTOK_EMBED_REGEX = /tiktok\.com\/embed\/v2\/(\d+)/;
const TWITCH_CLIP_REGEX =
	/(?:clips\.twitch\.tv\/([A-Za-z0-9-]+)|twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9-]+))/i;
const TWITCH_EMBED_PARAM_REGEX =
	/(?:clips\.twitch\.tv\/embed\?clip=|player\.twitch\.tv\/?\?clip=)([A-Za-z0-9-]+)/i;

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

	const youtubeEmbedMatch = trimmedUrl.match(YOUTUBE_EMBED_REGEX);
	if (youtubeEmbedMatch) {
		return {
			type: "youtube",
			normalizedUrl: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}`,
		};
	}

	const vimeoMatch = trimmedUrl.match(VIMEO_REGEX);
	if (vimeoMatch) {
		return {
			type: "vimeo",
			normalizedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
		};
	}

	const vimeoEmbedMatch = trimmedUrl.match(VIMEO_EMBED_REGEX);
	if (vimeoEmbedMatch) {
		return {
			type: "vimeo",
			normalizedUrl: `https://player.vimeo.com/video/${vimeoEmbedMatch[1]}`,
		};
	}

	const tiktokMatch = trimmedUrl.match(TIKTOK_REGEX);
	if (tiktokMatch) {
		return {
			type: "tiktok",
			normalizedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
		};
	}

	const tiktokEmbedMatch = trimmedUrl.match(TIKTOK_EMBED_REGEX);
	if (tiktokEmbedMatch) {
		return {
			type: "tiktok",
			normalizedUrl: `https://www.tiktok.com/embed/v2/${tiktokEmbedMatch[1]}`,
		};
	}

	const twitchClipMatch = trimmedUrl.match(TWITCH_CLIP_REGEX);
	if (twitchClipMatch) {
		const slug = twitchClipMatch[1] || twitchClipMatch[2];
		if (slug) {
			return {
				type: "twitch",
				normalizedUrl: `https://clips.twitch.tv/embed?clip=${slug}`,
			};
		}
	}

	const twitchEmbedParamMatch = trimmedUrl.match(TWITCH_EMBED_PARAM_REGEX);
	if (twitchEmbedParamMatch) {
		const slug = twitchEmbedParamMatch[1];
		if (slug) {
			return {
				type: "twitch",
				normalizedUrl: `https://clips.twitch.tv/embed?clip=${slug}`,
			};
		}
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
							"URL de vídeo inválida. Aceitos: YouTube, Vimeo, TikTok, Twitch (apenas clipes) ou arquivos .mp4, .webm, .ogg",
					},
					{ status: 400 }
				);
			}
			updateData.type = validation.type;
			updateData.url = validation.normalizedUrl;

			let nextThumb: string | null = null;
			try {
				if (validation.type === "youtube") {
					const mWatch = url.match(YOUTUBE_REGEX);
					const mEmbed = url.match(YOUTUBE_EMBED_REGEX);
					const ytId = (mWatch && mWatch[1]) || (mEmbed && mEmbed[1]);
					if (ytId) {
						nextThumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
					}
				} else if (validation.type === "vimeo") {
					const mPage = url.match(VIMEO_REGEX);
					const mEmbed = url.match(VIMEO_EMBED_REGEX);
					const vimeoId = (mPage && mPage[1]) || (mEmbed && mEmbed[1]);
					const endpoint = vimeoId
						? `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vimeoId}`)}`
						: `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
					const r = await fetch(endpoint);
					if (r && r.ok) {
						const d = await r.json();
						const t = d && d.thumbnail_url ? String(d.thumbnail_url) : "";
						if (t) {
							nextThumb = t;
						}
					}
				}
			} catch {}
			updateData.thumbnailUrl = nextThumb;
		}

		const updatedVideo = await prisma.video.update({
			where: { id: videoId },
			data: updateData,
		});

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileVideosTag(user.username));
				await evictProfilePageCache(user.username);
			}
		} catch {}

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

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileVideosTag(user.username));
			}
		} catch {}

		return NextResponse.json({ message: "Vídeo excluído com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileVideosTag } from "@/lib/cache-tags";
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
						"URL de vídeo inválida. Aceitos: YouTube, Vimeo, TikTok, Twitch (apenas clipes) ou arquivos .mp4, .webm, .ogg",
				},
				{ status: 400 }
			);
		}

		let thumbnailUrl: string | null = null;
		try {
			if (validation.type === "youtube") {
				const mWatch = url.match(YOUTUBE_REGEX);
				const mEmbed = url.match(YOUTUBE_EMBED_REGEX);
				const ytId = (mWatch && mWatch[1]) || (mEmbed && mEmbed[1]);
				if (ytId) {
					thumbnailUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
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
						thumbnailUrl = t;
					}
				}
			}
		} catch {}

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

		const data = {
			title: title?.trim() || null,
			description: description?.trim() || null,
			type: validation.type,
			url: validation.normalizedUrl,
			thumbnailUrl: thumbnailUrl ?? null,
			active: true,
			order: 0,
			userId: session.user.id,
			sectionId: sectionId || null,
		};

		const video = await prisma.video.create({
			data: data as any,
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

		const videoLinks = await prisma.link.findMany({
			where: { userId: session.user.id, type: "video_link" },
			select: { url: true, clicks: true },
		});
		const clicksMap = new Map<string, number>();
		for (const l of videoLinks) {
			if (l.url) {
				clicksMap.set(l.url, l.clicks || 0);
			}
		}
		const enriched = videos.map((v: any) => ({
			...v,
			clicks: clicksMap.get(v.url) || 0,
		}));

		return NextResponse.json({ videos: enriched });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

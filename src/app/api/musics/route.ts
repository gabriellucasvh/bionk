import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import {
	getCanonicalUrl,
	getEmbedUrl,
	parseMusicUrl,
	resolveDeezerShortUrl,
} from "@/utils/music";
export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const { title, url, usePreview = true, sectionId } = await request.json();

		if (!url) {
			return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
		}

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		// Resolver link curto do Deezer, se necessário
		const inputUrl: string = url;
		const maybeResolvedUrl = inputUrl.toLowerCase().includes("link.deezer.com")
			? await resolveDeezerShortUrl(inputUrl)
			: inputUrl;

		const parsed = parseMusicUrl(maybeResolvedUrl);
		if (
			!parsed.id ||
			parsed.type === "unknown" ||
			parsed.platform === "unknown"
		) {
			return NextResponse.json(
				{
					error:
						"URL de música inválida. Aceitos: Spotify, Deezer, Apple Music, SoundCloud e Audiomack",
				},
				{ status: 400 }
			);
		}

		const normalizedUrl = usePreview
			? getEmbedUrl(maybeResolvedUrl)
			: getCanonicalUrl(maybeResolvedUrl);

		const uid = session.user.id;
		const ingestMode = (process.env.INGEST_MODE || "").toLowerCase();
		const useQueue = ingestMode
			? ingestMode !== "sync"
			: process.env.NODE_ENV === "production";
		if (!useQueue) {
			const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
				prisma.link.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.text.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.video.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.image.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.music.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.section.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.event.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
			]);
			const candidates = [
				minL._min.order,
				minT._min.order,
				minV._min.order,
				minI._min.order,
				minM._min.order,
				minS._min.order,
				minE._min.order,
			].filter((n) => typeof n === "number") as number[];
			const base = candidates.length > 0 ? Math.min(...candidates) : 0;
			const created = await prisma.music.create({
				data: {
					userId: uid,
					title: title ? title.trim() : "",
					url: normalizedUrl,
					usePreview: !!usePreview,
					active: true,
					order: base - 1,
					sectionId: sectionId || null,
				},
			});
			return NextResponse.json(created, { status: 201 });
		}
		const r = getRedis();
		const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
		const shard =
			Math.abs(Array.from(uid).reduce((a, c) => a + c.charCodeAt(0), 0)) %
			shardCount;
		const payload = {
			userId: uid,
			title: title ? title.trim() : "",
			url: normalizedUrl,
			usePreview: !!usePreview,
			sectionId: sectionId || null,
		};
		await r.lpush(`ingest:musics:${uid}:${shard}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
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

		const musics = await prisma.music.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ musics });
	} catch (error) {
		console.error("Erro ao listar músicas:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

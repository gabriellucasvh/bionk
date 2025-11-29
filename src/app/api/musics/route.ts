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

		const r = getRedis();
		const payload = {
			userId: session.user.id,
			title: title ? title.trim() : "",
			url: normalizedUrl,
			usePreview: !!usePreview,
			sectionId: sectionId || null,
		};
		await r.lpush(`ingest:musics:${session.user.id}`, JSON.stringify(payload));
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

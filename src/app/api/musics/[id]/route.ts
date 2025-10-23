import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Aceita URLs oficiais com segmento de idioma opcional (ex: intl-pt)
// Suporta: track, album, playlist, episode, show
const SPOTIFY_REGEX =
	/open\.spotify\.com\/(?:[a-z-]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/;

function validateAndNormalizeSpotifyUrl(
	url: string,
	usePreview: boolean
): { normalizedUrl: string; canonicalUrl: string } | null {
	const trimmed = (url || "").trim();
	const match = trimmed.match(SPOTIFY_REGEX);
	if (!match) {
		return null;
	}
	const kind = match[1];
	const id = match[2];
	const canonicalUrl = `https://open.spotify.com/${kind}/${id}`;
	const normalizedUrl = usePreview
		? `https://open.spotify.com/embed/${kind}/${id}`
		: canonicalUrl;
	return { normalizedUrl, canonicalUrl };
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
	const musicId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(musicId)) {
		return NextResponse.json(
			{ error: "ID da música é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { title, url, usePreview, active, archived } = body;

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		const music = await prisma.music.findFirst({
			where: { id: musicId, userId: session.user.id },
		});

		if (!music) {
			return NextResponse.json(
				{ error: "Música não encontrada" },
				{ status: 404 }
			);
		}

		const updateData: any = {
			...(title !== undefined && { title: (title || "").trim() }),
			...(active !== undefined && { active }),
			...(archived !== undefined && { archived }),
		};

		if (usePreview !== undefined) {
			updateData.usePreview = !!usePreview;
		}

		if (url && url !== music.url) {
			const validation = validateAndNormalizeSpotifyUrl(
				url,
				updateData.usePreview ?? music.usePreview
			);
			if (!validation) {
				return NextResponse.json(
					{ error: "URL de música inválida. Aceitos: Spotify" },
					{ status: 400 }
				);
			}
			updateData.url = validation.normalizedUrl;

			// Atualiza metadados quando URL muda
			try {
				const metaRes = await fetch(
					`https://open.spotify.com/oembed?url=${encodeURIComponent(validation.canonicalUrl)}`
				);
				if (metaRes.ok) {
					const data = await metaRes.json();
					const a = (data?.author_name || "").toString();
					const th = (data?.thumbnail_url || "").toString();
					if (a.trim().length > 0) {
						updateData.authorName = a;
					}
					if (th.trim().length > 0) {
						updateData.thumbnailUrl = th;
					}
				}
			} catch {
				// silent
			}
		}
		const updatedMusic = await prisma.music.update({
			where: { id: musicId },
			data: updateData,
		});

		return NextResponse.json(updatedMusic);
	} catch (error) {
		console.error("Erro ao atualizar música:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const musicId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(musicId)) {
		return NextResponse.json(
			{ error: "ID da música é inválido ou obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const music = await prisma.music.findFirst({
			where: { id: musicId, userId: session.user.id },
		});

		if (!music) {
			return NextResponse.json(
				{ error: "Música não encontrada" },
				{ status: 404 }
			);
		}

		await prisma.music.delete({
			where: { id: musicId },
		});

		return NextResponse.json({ message: "Música excluída com sucesso" });
	} catch (error) {
		console.error("Erro ao excluir música:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

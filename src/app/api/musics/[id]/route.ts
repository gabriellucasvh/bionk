import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
	fetchMetadataFromProvider,
	getCanonicalUrl,
	getEmbedUrl,
	parseMusicUrl,
	resolveDeezerShortUrl,
} from "@/utils/music";

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
			// Resolver link curto do Deezer, se necessário
			const inputUrl: string = url;
			const maybeResolvedUrl = inputUrl
				.toLowerCase()
				.includes("link.deezer.com")
				? await resolveDeezerShortUrl(inputUrl)
				: inputUrl;

			const parsed = parseMusicUrl(maybeResolvedUrl);
			if (
				!parsed.id ||
				parsed.type === "unknown" ||
				parsed.platform === "unknown"
			) {
				return NextResponse.json(
					{ error: "URL de música inválida. Aceitos: Spotify e Deezer" },
					{ status: 400 }
				);
			}
			const normalizedUrl =
				(updateData.usePreview ?? music.usePreview)
					? getEmbedUrl(maybeResolvedUrl)
					: getCanonicalUrl(maybeResolvedUrl);
			updateData.url = normalizedUrl;
			// updateData.platform = parsed.platform;

			// Atualiza metadados quando URL muda
			try {
				const meta = await fetchMetadataFromProvider(parsed);
				if ((meta.authorName || "").trim().length > 0) {
					updateData.authorName = meta.authorName;
				}
				if ((meta.thumbnailUrl || "").trim().length > 0) {
					updateData.thumbnailUrl = meta.thumbnailUrl;
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

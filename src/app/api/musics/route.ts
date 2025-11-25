import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseMusicUrl, getCanonicalUrl, getEmbedUrl, fetchMetadataFromProvider, resolveDeezerShortUrl } from "@/utils/music";
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
    if (!parsed.id || parsed.type === "unknown" || parsed.platform === "unknown") {
      return NextResponse.json(
        { error: "URL de música inválida. Aceitos: Spotify, Deezer, Apple Music, SoundCloud e Audiomack" },
        { status: 400 }
      );
    }

    const normalizedUrl = usePreview ? getEmbedUrl(maybeResolvedUrl) : getCanonicalUrl(maybeResolvedUrl);

    // Ao criar um novo item, empurra os outros para baixo mantendo o order
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

    // Buscar metadados (Spotify via oEmbed, Deezer via API)
    let authorName: string | undefined;
    let thumbnailUrl: string | undefined;
    let finalTitle: string = (title?.trim() || "");
    try {
      const meta = await fetchMetadataFromProvider(parsed);
      if (!finalTitle && (meta.title || "").trim().length > 0) {
        finalTitle = meta.title as string;
      }
      authorName = (meta.authorName || "").trim() || undefined;
      thumbnailUrl = (meta.thumbnailUrl || "").trim() || undefined;
    } catch {
      // silent
    }

    const music = await prisma.music.create({
      data: {
        title: finalTitle,
        url: normalizedUrl,
        // platform: parsed.platform,
        usePreview: !!usePreview,
        active: true,
        order: 0,
        userId: session.user.id,
        sectionId: sectionId || null,
        authorName,
        thumbnailUrl,
      },
    });

    return NextResponse.json(music, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar música:", error);
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

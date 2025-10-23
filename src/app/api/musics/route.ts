import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Aceita URLs oficiais com segmento de idioma opcional (ex: intl-pt)
// Suporta: track, album, playlist, episode, show
const SPOTIFY_REGEX = /open\.spotify\.com\/(?:[a-z-]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/;

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

    const validation = validateAndNormalizeSpotifyUrl(url, !!usePreview);
    if (!validation) {
      return NextResponse.json(
        { error: "URL de música inválida. Aceitos: Spotify" },
        { status: 400 }
      );
    }

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

    // Buscar metadados via oEmbed (apenas uma vez na criação)
    let authorName: string | undefined;
    let thumbnailUrl: string | undefined;
    let finalTitle: string = (title?.trim() || "");
    try {
      const metaRes = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(validation.canonicalUrl)}`
      );
      if (metaRes.ok) {
        const data = await metaRes.json();
        const t = (data?.title || "").toString();
        const a = (data?.author_name || "").toString();
        const th = (data?.thumbnail_url || "").toString();
        if (!finalTitle && t.trim().length > 0) {finalTitle = t};
        authorName = a.trim().length > 0 ? a : undefined;
        thumbnailUrl = th.trim().length > 0 ? th : undefined;
      }
    } catch {
      // silent
    }

    const music = await prisma.music.create({
      data: {
        title: finalTitle,
        url: validation.normalizedUrl,
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

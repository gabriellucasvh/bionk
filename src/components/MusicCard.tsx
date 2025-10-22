"use client";

import { MoreVertical } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import LinkOptionsModal from "@/components/modals/LinkOptionsModal";
import type { UserLink } from "@/types/user-profile";

interface MusicCardProps {
  id: number;
  title?: string;
  url: string;
  usePreview?: boolean;
  className?: string;
  customPresets?: {
    customBackgroundColor?: string;
    customBackgroundGradient?: string;
    customTextColor?: string;
    customFont?: string;
    customButton?: string;
    customButtonFill?: string;
    customButtonCorners?: string;
    customButtonColor?: string;
    customButtonTextColor?: string;
  };
  buttonStyle?: React.CSSProperties;
}

// --- Helpers ---

// Garante que a URL tenha protocolo (https) para evitar iframes relativos
const ensureHttps = (url: string): string => {
  const trimmed = (url || "").trim();
  if (trimmed.length === 0) return url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

// Extrai URL canônica (sem /embed) para uso em oEmbed e links diretos
const getSpotifyCanonicalUrl = (url: string): string => {
  try {
    const normalized = ensureHttps(url);
    const u = new URL(normalized);
    if (!u.hostname.includes("spotify.com")) return normalized;
    const parts = u.pathname.split("/").filter(Boolean);

    const supported = new Set(["track", "album", "playlist", "episode", "show"]);
    let type: string | undefined;
    let id: string | undefined;

    // Se começar com "embed", ignora esse segmento
    const startIdx = parts[0] === "embed" ? 1 : 0;
    for (let i = startIdx; i < parts.length - 1; i++) {
      if (supported.has(parts[i])) {
        type = parts[i];
        id = parts[i + 1];
        break;
      }
    }

    if (!type || !id) return normalized;
    return `https://open.spotify.com/${type}/${id}`;
  } catch {
    return ensureHttps(url);
  }
};

type SpotifyOEmbed = {
  title?: string; // track title
  author_name?: string; // artist/band
  thumbnail_url?: string; // cover image
};

const getSpotifyEmbedUrl = (url: string): string => {
  try {
    const normalized = ensureHttps(url);
    const u = new URL(normalized);
    if (!u.hostname.includes("spotify.com")) return normalized;
    const parts = u.pathname.split("/").filter(Boolean);

    // If it is already an embed URL, keep it as-is
    if (parts[0] === "embed" && parts.length >= 3) {
      return normalized;
    }

    // Robustly find the resource type segment and the following id
    const supported = new Set(["track", "album", "playlist", "episode", "show"]);
    let type: string | undefined;
    let id: string | undefined;
    for (let i = 0; i < parts.length - 1; i++) {
      if (supported.has(parts[i])) {
        type = parts[i];
        id = parts[i + 1];
        break;
      }
    }

    if (!type || !id) return normalized;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return ensureHttps(url);
  }
};

export default function MusicCard({
  id,
  title,
  url,
  usePreview = true,
  className = "",
  customPresets,
  buttonStyle,
}: MusicCardProps) {
  const [meta, setMeta] = React.useState<SpotifyOEmbed | null>(null);
  const [optionsOpen, setOptionsOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const fetchMeta = async () => {
      try {
        const canonical = getSpotifyCanonicalUrl(url);
        const res = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(canonical)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as SpotifyOEmbed;
        if (mounted) setMeta(data);
      } catch {
        // silent
      }
    };
    fetchMeta();
    return () => {
      mounted = false;
    };
  }, [url]);

  const cornerValue = customPresets?.customButtonCorners || "12";
  const textColorStyle = customPresets?.customTextColor
    ? { color: customPresets.customTextColor }
    : {};
    const buttonTextColorStyle = customPresets?.customButtonTextColor
      ? { color: customPresets.customButtonTextColor }
      : {};

  if (usePreview) {
    const embedUrl = getSpotifyEmbedUrl(url);
    return (
      <div className={cn("w-full space-y-2 pb-2", className)}>
        {/* Opcionalmente mostra o título acima do player */}
        {title && (
          <h3 className={cn("text-center font-extrabold text-lg")} style={textColorStyle}>
            {title.length > 64 ? `${title.slice(0, 64)}...` : title}
          </h3>
        )}
        <div className="flex justify-center">
          <iframe
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            height="152"
            src={embedUrl}
            style={{ borderRadius: `${cornerValue}px`, width: "100%", border: 0 }}
            title={`spotify-${id}`}
          />
        </div>
      </div>
    );
  }

  // Modo link direto: botão como um link normal com imagem à esquerda,
  // duas linhas centralizadas (título e autor) e ícone de compartilhar à direita.
  const displayTitle = (meta?.title || title || "").toString();
  const displayAuthor = (meta?.author_name || "").toString();
  const thumbnail = meta?.thumbnail_url || "";

  // Link simplificado para o modal de opções
  const linkForModal = ({
    id,
    title: displayTitle,
    url: ensureHttps(url),
  } as unknown) as UserLink;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "group relative w-full rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:brightness-110 p-1"
        )}
        style={buttonStyle}
      >
        <a
          className="relative z-10 flex h-full w-full items-center"
          href={getSpotifyCanonicalUrl(url)}
          rel="noopener noreferrer"
          target="_blank"
        >
          {/* Imagem à esquerda */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              <Image
                alt={displayTitle || "Música"}
                className="ml-1 size-13 object-cover"
                height={32}
                src={thumbnail}
                style={{ borderRadius: "12px" }}
                width={32}
              />
            ) : (
              <div className="ml-1 size-13" />
            )}
          </div>

          {/* Texto central (título e autor) */}
          <div className="flex flex-1 justify-center" style={buttonTextColorStyle}>
            <div className="min-w-0 text-center">
              <span className="line-clamp-1 w-full text-sm font-semibold">
                {displayTitle.length > 64 ? `${displayTitle.slice(0, 64)}...` : displayTitle}
              </span>
              {displayAuthor && (
                <span className="line-clamp-1 w-full text-xs text-muted-foreground">
                  {displayAuthor.length > 64 ? `${displayAuthor.slice(0, 64)}...` : displayAuthor}
                </span>
              )}
            </div>
          </div>

          {/* Espaço reservado para o botão de opções */}
          <div className="w-10 flex-shrink-0" />
        </a>


        <button
          aria-label="Opções"
          className="absolute top-[50%] -translate-y-1/2 right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOptionsOpen(true);
          }}
          type="button"
        >
          <MoreVertical className="size-5" style={buttonTextColorStyle} />
        </button>
        {/* Modal de opções */}
        {optionsOpen && (
          <LinkOptionsModal
            link={linkForModal}
            onOpenChange={(open) => setOptionsOpen(open)}
          />
        )}
      </div>
    </div>
  );
}

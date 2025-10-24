export type MusicPlatform = "spotify" | "deezer" | "unknown";
export type MusicType =
	| "track"
	| "album"
	| "playlist"
	| "episode"
	| "show"
	| "unknown";

export interface ParsedMusicUrl {
	platform: MusicPlatform;
	type: MusicType;
	id: string | null;
}

export interface NormalizedUrls {
	canonicalUrl: string;
	embedUrl: string;
}

export interface MusicMetadata {
	title?: string;
	authorName?: string;
	thumbnailUrl?: string;
}

export const ensureHttps = (url: string): string => {
	const trimmed = (url || "").trim();
	if (trimmed.length === 0) {
		return url;
	}
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
};

const SPOTIFY_TYPES = new Set([
	"track",
	"album",
	"playlist",
	"episode",
	"show",
]);
const DEEZER_TYPES = new Set(["track", "album", "playlist"]);

export const detectPlatform = (url: string): MusicPlatform => {
	const u = (url || "").toLowerCase();
	if (u.includes("spotify.com")) {
		return "spotify";
	}
	if (u.includes("deezer.com")) {
		return "deezer";
	}
	return "unknown";
};

export const parseMusicUrl = (url: string): ParsedMusicUrl => {
	try {
		const normalized = ensureHttps(url);
		const u = new URL(normalized);
		if (u.hostname.includes("spotify.com")) {
			const parts = u.pathname.split("/").filter(Boolean);
			const startIdx = parts[0] === "embed" ? 1 : 0;
			for (let i = startIdx; i < parts.length - 1; i++) {
				const t = parts[i];
				const id = parts[i + 1];
				if (SPOTIFY_TYPES.has(t)) {
					return { platform: "spotify", type: t as MusicType, id };
				}
			}
			return { platform: "spotify", type: "unknown", id: null };
		}
		if (u.hostname.includes("deezer.com")) {
			const parts = u.pathname.split("/").filter(Boolean);
			// Deezer may have optional locale segment: /br/, /en/, etc.
			const startIdx = /^[a-z]{2}(-[a-z]{2})?$/i.test(parts[0] || "") ? 1 : 0;
			for (let i = startIdx; i < parts.length - 1; i++) {
				const t = parts[i];
				const id = parts[i + 1];
				if (DEEZER_TYPES.has(t)) {
					return { platform: "deezer", type: t as MusicType, id };
				}
			}
			return { platform: "deezer", type: "unknown", id: null };
		}
		return { platform: "unknown", type: "unknown", id: null };
	} catch {
		return { platform: "unknown", type: "unknown", id: null };
	}
};

export const getCanonicalUrl = (url: string): string => {
	const parsed = parseMusicUrl(url);
	if (!parsed.id || parsed.type === "unknown") {
		return ensureHttps(url);
	}
	if (parsed.platform === "spotify") {
		return `https://open.spotify.com/${parsed.type}/${parsed.id}`;
	}
	if (parsed.platform === "deezer") {
		return `https://www.deezer.com/${parsed.type}/${parsed.id}`;
	}
	return ensureHttps(url);
};

export const getEmbedUrl = (
	url: string,
	theme: "dark" | "light" = "dark"
): string => {
	const parsed = parseMusicUrl(url);
	if (!parsed.id || parsed.type === "unknown") {
		return ensureHttps(url);
	}
	if (parsed.platform === "spotify") {
		return `https://open.spotify.com/embed/${parsed.type}/${parsed.id}`;
	}
	if (parsed.platform === "deezer") {
		return `https://widget.deezer.com/widget/${theme}/${parsed.type}/${parsed.id}`;
	}
	return ensureHttps(url);
};

export async function fetchMetadataFromProvider(
	parsed: ParsedMusicUrl
): Promise<MusicMetadata> {
	if (!parsed.id || parsed.type === "unknown") {
		return {};
	}
	try {
		if (parsed.platform === "spotify") {
			const canonical = `https://open.spotify.com/${parsed.type}/${parsed.id}`;
			const res = await fetch(
				`https://open.spotify.com/oembed?url=${encodeURIComponent(canonical)}`
			);
			if (!res.ok) {
				return {};
			}
			const data = await res.json();
			const title = (data?.title || "").toString();
			const authorName = (data?.author_name || "").toString();
			const thumbnailUrl = (data?.thumbnail_url || "").toString();
			return {
				title: title.trim() || undefined,
				authorName: authorName.trim() || undefined,
				thumbnailUrl: thumbnailUrl.trim() || undefined,
			};
		}
		if (parsed.platform === "deezer") {
			const endpoint = `https://api.deezer.com/${parsed.type}/${parsed.id}`;
			const res = await fetch(endpoint);
			if (!res.ok) {
				return {};
			}
			const data = await res.json();
			// Deezer response mapping varies by type
			if (parsed.type === "track") {
				return {
					title: (data?.title || "").toString() || undefined,
					authorName: (data?.artist?.name || "").toString() || undefined,
					thumbnailUrl:
						(data?.album?.cover_medium || "").toString() || undefined,
				};
			}
			if (parsed.type === "album") {
				return {
					title: (data?.title || "").toString() || undefined,
					authorName:
						(
							data?.artist?.name ||
							data?.contributors?.[0]?.name ||
							""
						).toString() || undefined,
					thumbnailUrl: (data?.cover_medium || "").toString() || undefined,
				};
			}
			if (parsed.type === "playlist") {
				return {
					title: (data?.title || "").toString() || undefined,
					authorName: (data?.creator?.name || "").toString() || undefined,
					thumbnailUrl: (data?.picture_medium || "").toString() || undefined,
				};
			}
			return {};
		}
		return {};
	} catch {
		return {};
	}
}

// Resolve link curto do Deezer (link.deezer.com/s/...) para URL final
export async function resolveDeezerShortUrl(url: string): Promise<string> {
	try {
		const normalized = ensureHttps(url);
		const u = new URL(normalized);
		if (!u.hostname.includes("link.deezer.com")) {
			return normalized;
		}
		const res = await fetch(normalized, {
			redirect: "follow" as RequestRedirect,
		});
		// A URL final após redirecionamentos
		const finalUrl = res.url || normalized;
		return finalUrl;
	} catch {
		return ensureHttps(url);
	}
}

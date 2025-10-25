export type MusicPlatform =
	| "spotify"
	| "deezer"
	| "apple"
	| "soundcloud"
	| "audiomack"
	| "unknown";
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

// Precompiled regex (top-level) to avoid per-call construction
const REGEX_HTTP_PROTOCOL = /^https?:\/\//i;
const REGEX_DEEZER_LOCALE = /^[a-z]{2}(-[a-z]{2})?$/i;
const REGEX_APPLE_LOCALE = /^(?:[a-z]{2}(?:-[a-z]{2})?|geo)$/i;
const REGEX_NUMERIC_ID = /^\d+$/;
const REGEX_APPLE_PL_PREFIX = /^pl\./i;

export const ensureHttps = (url: string): string => {
	const trimmed = (url || "").trim();
	if (trimmed.length === 0) {
		return url;
	}
	if (REGEX_HTTP_PROTOCOL.test(trimmed)) {
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
const APPLE_TYPES = new Set(["song", "album", "playlist"]);


export const detectPlatform = (url: string): MusicPlatform => {
	const u = (url || "").toLowerCase();
	if (u.includes("spotify.com")) {
		return "spotify";
	}
	if (u.includes("deezer.com")) {
		return "deezer";
	}
	if (u.includes("music.apple.com") || u.includes("itunes.apple.com")) {
		return "apple";
	}
	if (u.includes("soundcloud.com") || u.includes("on.soundcloud.com")) {
		return "soundcloud";
	}
	if (u.includes("audiomack.com")) {
		return "audiomack";
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
			const startIdx = REGEX_DEEZER_LOCALE.test(parts[0] || "") ? 1 : 0;
			for (let i = startIdx; i < parts.length - 1; i++) {
				const t = parts[i];
				const id = parts[i + 1];
				if (DEEZER_TYPES.has(t)) {
					return { platform: "deezer", type: t as MusicType, id };
				}
			}
			return { platform: "deezer", type: "unknown", id: null };
		}
		if (
			u.hostname.includes("music.apple.com") ||
			u.hostname.includes("itunes.apple.com")
		) {
			const parts = u.pathname.split("/").filter(Boolean);
			// Apple may have country/locale as first segment (e.g., /us/, /br/, /geo)
			const first = parts[0] || "";
			const startIdx = REGEX_APPLE_LOCALE.test(first) ? 1 : 0;
			for (let i = startIdx; i < parts.length; i++) {
				const t = parts[i];
				if (APPLE_TYPES.has(t)) {
					// Find the best candidate ID in subsequent segments
					let candidateId: string | null = null;
					for (let j = i + 1; j < parts.length; j++) {
						const seg = parts[j];
						if (REGEX_NUMERIC_ID.test(seg)) {
							candidateId = seg;
							break;
						}
						if (t === "playlist" && REGEX_APPLE_PL_PREFIX.test(seg)) {
							candidateId = seg;
							break;
						}
					}
					// Fall back to track id in query for album pages
					const trackQueryId = u.searchParams.get("i");
					const mappedType = t === "song" ? "track" : (t as MusicType);
					if (candidateId) {
						return { platform: "apple", type: mappedType, id: candidateId };
					}
					if (trackQueryId) {
						return { platform: "apple", type: "track", id: trackQueryId };
					}
					return { platform: "apple", type: mappedType, id: null };
				}
			}
			// Handle album path with track param (?i=trackId) even if types not detected
			const trackId = u.searchParams.get("i");
			if (trackId) {
				return { platform: "apple", type: "track", id: trackId };
			}
			return { platform: "apple", type: "unknown", id: null };
		}
		// SoundCloud embed URL: w.soundcloud.com/player/?url=<canonical>
		if (
			u.hostname.includes("w.soundcloud.com") &&
			u.pathname.includes("/player")
		) {
			const inner = u.searchParams.get("url") || "";
			try {
				const decoded = decodeURIComponent(inner);
				const innerUrl = ensureHttps(decoded);
				const innerHost = new URL(innerUrl).hostname;
				if (
					innerHost.includes("soundcloud.com") ||
					innerHost.includes("on.soundcloud.com")
				) {
					const parts = new URL(innerUrl).pathname.split("/").filter(Boolean);
					const isPlaylist = parts.includes("sets");
					const type: MusicType = isPlaylist ? "playlist" : "track";
					return { platform: "soundcloud", type, id: innerUrl };
				}
				// if inner URL not soundcloud, treat unknown
				return { platform: "unknown", type: "unknown", id: null };
			} catch {
				return { platform: "soundcloud", type: "track", id: normalized };
			}
		}
		if (
			u.hostname.includes("soundcloud.com") ||
			u.hostname.includes("on.soundcloud.com")
		) {
			const parts = u.pathname.split("/").filter(Boolean);
			// Tipo: playlist se conter /sets/, senão presumimos track
			const isPlaylist = parts.includes("sets");
			const type: MusicType = isPlaylist ? "playlist" : "track";
			// Para SoundCloud, usar a URL canônica como id para o oEmbed
			const canonical = ensureHttps(url);
			return { platform: "soundcloud", type, id: canonical };
		}
		// Audiomack canonical: /<artist>/(song|album|playlist)/<slug>
		// Audiomack embed: /embed/(song|album|playlist)/<artist>/<slug>
		if (u.hostname.includes("audiomack.com")) {
			const parts = u.pathname.split("/").filter(Boolean);
			if (parts[0] === "embed") {
				const t = parts[1];
				const artist = parts[2];
				const slug = parts[3];
				if (
					t &&
					artist &&
					slug &&
					(t === "song" || t === "album" || t === "playlist")
				) {
					const mappedType: MusicType =
						t === "song" ? "track" : (t as MusicType);
					return {
						platform: "audiomack",
						type: mappedType,
						id: `${artist}/${slug}`,
					};
				}
				return { platform: "audiomack", type: "unknown", id: null };
			}
			const artist = parts[0];
			const t = parts[1];
			const slug = parts[2];
			if (
				artist &&
				t &&
				slug &&
				(t === "song" || t === "album" || t === "playlist")
			) {
				const mappedType: MusicType = t === "song" ? "track" : (t as MusicType);
				return {
					platform: "audiomack",
					type: mappedType,
					id: `${artist}/${slug}`,
				};
			}
			return { platform: "audiomack", type: "unknown", id: null };
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
	if (parsed.platform === "apple") {
		// Apple canonical URLs são sluggificadas; retornamos original
		return ensureHttps(url);
	}
	if (parsed.platform === "soundcloud") {
		// Para SoundCloud, manter a URL original
		return ensureHttps(url);
	}
	if (parsed.platform === "audiomack") {
		const [artist, slug] = (parsed.id || "").split("/");
		const typePath = parsed.type === "track" ? "song" : parsed.type;
		if (artist && slug) {
			return `https://audiomack.com/${artist}/${typePath}/${slug}`;
		}
		return ensureHttps(url);
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
	if (parsed.platform === "apple") {
		// Default to US if locale not determinable from URL
		let country = "us";
		try {
			const u = new URL(ensureHttps(url));
			const parts = u.pathname.split("/").filter(Boolean);
			const first = parts[0] || "";
			if (REGEX_APPLE_LOCALE.test(first)) {
				country = first.toLowerCase() === "geo" ? "us" : first.toLowerCase();
			}
		} catch {
			// keep default
		}
		const appleType = parsed.type === "track" ? "song" : parsed.type;
		return `https://embed.music.apple.com/${country}/${appleType}/${parsed.id}`;
	}
	if (parsed.platform === "soundcloud") {
		const canonical = parsed.id ? ensureHttps(parsed.id) : ensureHttps(url);
		return `https://w.soundcloud.com/player/?url=${encodeURIComponent(canonical)}`;
	}
	if (parsed.platform === "audiomack") {
		const typePath = parsed.type === "track" ? "song" : parsed.type;
		return `https://audiomack.com/embed/${typePath}/${parsed.id}`;
	}
	return ensureHttps(url);
};

function extractMetaContent(html: string, property: string): string | null {
	const propRegex = new RegExp(
		`<meta[^>]+property=["']${property}["'][^>]*content=["']([^"']+)["']`,
		"i"
	);
	const nameRegex = new RegExp(
		`<meta[^>]+name=["']${property}["'][^>]*content=["']([^"']+)["']`,
		"i"
	);
	const propMatch = html.match(propRegex);
	if (propMatch && propMatch[1]) {return propMatch[1]};
	const nameMatch = html.match(nameRegex);
	if (nameMatch && nameMatch[1]) {return nameMatch[1]};
	return null;
}

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
				const contributorName =
					Array.isArray(data?.contributors) && data.contributors.length > 0
						? (data.contributors[0]?.name ?? "")
						: "";
				const authorNameSafe = data?.artist?.name ?? contributorName;
				const authorNameStr =
					typeof authorNameSafe === "string" ? authorNameSafe : "";
				return {
					title: (data?.title || "").toString() || undefined,
					authorName: authorNameStr.trim() || undefined,
					thumbnailUrl:
						(data?.cover_medium || data?.cover || "").toString() || undefined,
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
		if (parsed.platform === "apple") {
			// Use iTunes Search API for Apple Music metadata when possible
			// Track
			if (parsed.type === "track") {
				const res = await fetch(
					`https://itunes.apple.com/lookup?id=${encodeURIComponent(parsed.id)}`
				);
				if (!res.ok) {
					return {};
				}
				const data = await res.json();
				const item = Array.isArray(data?.results) ? data.results[0] : undefined;
				const title = (
					item?.trackName ||
					item?.collectionName ||
					""
				).toString();
				const authorName = (item?.artistName || "").toString();
				let thumb = (item?.artworkUrl100 || "").toString();
				if (thumb) {
					thumb = thumb.replace("100x100bb", "300x300bb");
				}
				return {
					title: title.trim() || undefined,
					authorName: authorName.trim() || undefined,
					thumbnailUrl: thumb.trim() || undefined,
				};
			}
			// Album
			if (parsed.type === "album") {
				const res = await fetch(
					`https://itunes.apple.com/lookup?id=${encodeURIComponent(parsed.id)}&entity=song`
				);
				if (!res.ok) {
					return {};
				}
				const data = await res.json();
				// First result is the album, subsequent are tracks
				const album = Array.isArray(data?.results)
					? data.results[0]
					: undefined;
				const title = (album?.collectionName || "").toString();
				const authorName = (album?.artistName || "").toString();
				let thumb = (album?.artworkUrl100 || "").toString();
				if (thumb) {
					thumb = thumb.replace("100x100bb", "300x300bb");
				}
				return {
					title: title.trim() || undefined,
					authorName: authorName.trim() || undefined,
					thumbnailUrl: thumb.trim() || undefined,
				};
			}
			// Playlist: limited metadata without Apple auth; return empty
			if (parsed.type === "playlist") {
				return {};
			}
			return {};
		}
		if (parsed.platform === "soundcloud") {
			const canonical = parsed.id ? ensureHttps(parsed.id) : "";
			if (!canonical) {return {}};
			const res = await fetch(
				`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(canonical)}`
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
		// Audiomack: sem oEmbed oficial conhecido; retornar vazio
		if (parsed.platform === "audiomack") {
			const artist = parsed.id.split("/")[0] || "";
			const slug = parsed.id.split("/")[1] || "";
			const typePath = parsed.type === "track" ? "song" : parsed.type;
			const canonical = `https://audiomack.com/${artist}/${typePath}/${slug}`;
			const res = await fetch(canonical, {
				headers: {
					"user-agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
				},
			});
			if (!res.ok) {
				return { authorName: artist || undefined };
			}
			const html = await res.text();
			const title =
				extractMetaContent(html, "og:title") ||
				extractMetaContent(html, "twitter:title") ||
				undefined;
			const thumbnail =
				extractMetaContent(html, "og:image") ||
				extractMetaContent(html, "twitter:image") ||
				extractMetaContent(html, "twitter:image:src") ||
				undefined;
			return {
				title: title?.trim() || undefined,
				authorName: artist?.trim() || undefined,
				thumbnailUrl: thumbnail?.trim() || undefined,
			};
		}
		return {};
	} catch {
		return {};
	}
}

// Função de autocomplete para Deezer - busca sugestões baseadas no título
export async function searchDeezerTracks(
	query: string,
	limit = 5
): Promise<
	Array<{
		title: string;
		artist: string;
		url: string;
		type: "track" | "album" | "playlist";
	}>
> {
	if (!query.trim()) {return []};

	try {
		const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
		const res = await fetch(searchUrl);
		if (!res.ok) {return []};

		const data = await res.json();
		const tracks = Array.isArray(data?.data) ? data.data : [];

		return tracks
			.map((track: any) => ({
				title: track.title || "",
				artist: track.artist?.name || "",
				url: track.link || "",
				type: "track" as const,
			}))
			.filter((item: any) => item.title && item.artist && item.url);
	} catch {
		return [];
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

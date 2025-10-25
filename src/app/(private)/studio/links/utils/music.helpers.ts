export interface MusicPlatform {
	name: string;
	iconPath: string;
	bgColor: string;
}

export const getMusicPlatform = (url: string): MusicPlatform => {
	const urlLower = (url || "").toLowerCase();
	if (urlLower.includes("spotify.com")) {
		return {
			name: "Spotify",
			iconPath: "/icons/spotify.svg",
			bgColor: "bg-green-600",
		};
	}
	if (urlLower.includes("deezer.com")) {
		return {
			name: "Deezer",
			iconPath: "/icons/deezer.png",
			bgColor: "bg-purple-500",
		};
	}
	if (
		urlLower.includes("music.apple.com") ||
		urlLower.includes("itunes.apple.com")
	) {
		return {
			name: "Apple Music",
			iconPath: "/icons/applemusic.svg",
			bgColor: "bg-[#FA243C]",
		};
	}
	if (
		urlLower.includes("soundcloud.com") ||
		urlLower.includes("on.soundcloud.com") ||
		urlLower.includes("w.soundcloud.com")
	) {
		return {
			name: "SoundCloud",
			iconPath: "/icons/soundcloud.svg",
			bgColor: "bg-[#ff5500]",
		};
	}
	if (urlLower.includes("audiomack.com")) {
		return {
			name: "Audiomack",
			iconPath: "/icons/audiomack.svg",
			bgColor: "bg-[#F6A623]",
		};
	}
	return { name: "Música", iconPath: "", bgColor: "bg-gray-500" };
};

export const MUSIC_URL_ERROR_MESSAGE =
	"Por favor, informe uma URL válida de Spotify, Deezer, Apple Music, SoundCloud ou Audiomack.";

// Aceita URLs oficiais com segmento de idioma opcional (ex: intl-pt)
// Suporta: track, album, playlist, episode, show
const SPOTIFY_REGEX =
	/open\.spotify\.com\/(?:[a-z-]+\/)?(track|album|playlist|episode|show)\/[a-zA-Z0-9]+/;

// Deezer com segmento de idioma opcional (ex: br)
// Suporta: track, album, playlist
const DEEZER_REGEX =
	/deezer\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(track|album|playlist)\/[0-9]+/;

// Link curto do Deezer (ex: https:\/\/link.deezer.com\/s\/31pFhhUZRAIUcxUsCwmse)
const DEEZER_SHORT_REGEX = /link\.deezer\.com\/s\/[A-Za-z0-9]+/;

// Apple Music com país opcional (ex: us, br ou geo)
// Suporta: song (track), album, playlist
const APPLE_REGEX =
	/(?:music|itunes)\.apple\.com\/(?:[a-z]{2}(?:-[a-z]{2})?|geo)?\/(song|album|playlist)\/[A-Za-z0-9.]+/;

// Apple Music: caso especial de álbum com parâmetro ?i=trackId
const APPLE_ALBUM_TRACK_PARAM_REGEX = /music\.apple\.com\/.+album\/.+\?i=\d+/;

// SoundCloud: track (user/track) e playlist (user/sets/playlist)
const SOUNDCLOUD_TRACK_REGEX =
	/soundcloud\.com\/[A-Za-z0-9-_]+\/(?!sets\/)[A-Za-z0-9-_.]+/;
const SOUNDCLOUD_PLAYLIST_REGEX =
	/soundcloud\.com\/[A-Za-z0-9-_]+\/sets\/[A-Za-z0-9-_.]+/;
// SoundCloud short links
const SOUNDCLOUD_SHORT_REGEX = /on\.soundcloud\.com\/[A-Za-z0-9]+/;
// SoundCloud embed player URLs
const SOUNDCLOUD_EMBED_REGEX = /https?:\/\/w\.soundcloud\.com\/player\/?/i;

// Audiomack: canonical and embed
const AUDIOMACK_CANONICAL_REGEX = /(?:https?:\/\/)?(?:www\.)?audiomack\.com\/[A-Za-z0-9-_]+\/(song|album|playlist)\/[A-Za-z0-9-_.]+/i;
const AUDIOMACK_EMBED_REGEX = /(?:https?:\/\/)?(?:www\.)?audiomack\.com\/embed\/(song|album|playlist)\/[A-Za-z0-9-_]+\/[A-Za-z0-9-_.]+/i;

export function isValidMusicUrl(url: string): {
	valid: boolean;
	error?: string;
} {
	const trimmed = (url || "").trim();
	if (trimmed.length === 0) {
		return { valid: false, error: "URL é obrigatória" };
	}
	const spotify = SPOTIFY_REGEX.test(trimmed);
	const deezer = DEEZER_REGEX.test(trimmed);
	const deezerShort = DEEZER_SHORT_REGEX.test(trimmed);
	const apple =
		APPLE_REGEX.test(trimmed) || APPLE_ALBUM_TRACK_PARAM_REGEX.test(trimmed);
	const soundcloud =
		SOUNDCLOUD_TRACK_REGEX.test(trimmed) ||
		SOUNDCLOUD_PLAYLIST_REGEX.test(trimmed) ||
		SOUNDCLOUD_SHORT_REGEX.test(trimmed) ||
		SOUNDCLOUD_EMBED_REGEX.test(trimmed);
	const audiomack = AUDIOMACK_CANONICAL_REGEX.test(trimmed) || AUDIOMACK_EMBED_REGEX.test(trimmed);
	return spotify || deezer || deezerShort || apple || soundcloud || audiomack
		? { valid: true }
		: { valid: false, error: MUSIC_URL_ERROR_MESSAGE };
}

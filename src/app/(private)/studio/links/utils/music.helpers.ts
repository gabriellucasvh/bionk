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

	return {
		name: "Música",
		iconPath: "",
		bgColor: "bg-gray-500",
	};
};

export const MUSIC_URL_ERROR_MESSAGE =
	"URL de música inválida. Aceitos: Spotify, Deezer e Apple Music (inclui link curto do Deezer)";

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
	return spotify || deezer || deezerShort || apple
		? { valid: true }
		: { valid: false, error: MUSIC_URL_ERROR_MESSAGE };
}

export interface VideoPlatform {
	name: string;
	iconPath: string;
	bgColor: string;
}

export const getVideoPlatform = (url: string): VideoPlatform => {
	const urlLower = url.toLowerCase();

	if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
		return {
			name: "YouTube",
			iconPath: "/icons/youtube.svg",
			bgColor: "bg-red-600",
		};
	}

	if (urlLower.includes("vimeo.com")) {
		return {
			name: "Vimeo",
			iconPath: "/icons/vimeo.svg",
			bgColor: "bg-blue-500",
		};
	}

	if (urlLower.includes("twitch.tv")) {
		return {
			name: "Twitch",
			iconPath: "/icons/twitch.svg",
			bgColor: "bg-purple-600",
		};
	}

	if (urlLower.includes("tiktok.com")) {
		return {
			name: "TikTok",
			iconPath: "/icons/tiktok.svg",
			bgColor: "bg-black",
		};
	}

	if (urlLower.includes("kick.com")) {
		return {
			name: "Kick",
			iconPath: "/icons/kick.svg",
			bgColor: "bg-green-500",
		};
	}

	return {
		name: "Vídeo",
		iconPath: "",
		bgColor: "bg-gray-500",
	};
};

export const VIDEO_URL_ERROR_MESSAGE =
    "URL de vídeo inválida. Aceitos: YouTube, Vimeo, TikTok, Twitch (apenas clipes) ou arquivos .mp4, .webm, .ogg";

const DIRECT_VIDEO_EXT_REGEX = /\.(mp4|webm|ogg)$/i;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/;
const YOUTUBE_EMBED_REGEX = /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)[a-zA-Z0-9_-]+/;
const VIMEO_REGEX = /vimeo\.com\/\d+/;
const VIMEO_EMBED_REGEX = /player\.vimeo\.com\/video\/\d+/;
const TIKTOK_REGEX = /tiktok\.com\/@[^/]+\/video\/\d+/;
const TIKTOK_EMBED_REGEX = /tiktok\.com\/embed\/v2\/\d+/;
const TWITCH_CLIP_REGEX =
    /(?:clips\.twitch\.tv\/[A-Za-z0-9-]+|twitch\.tv\/[^/]+\/clip\/[A-Za-z0-9-]+)/i;
const TWITCH_EMBED_REGEX = /clips\.twitch\.tv\/embed\?clip=[A-Za-z0-9-]+/i;

export function isValidVideoUrl(url: string): {
    valid: boolean;
    error?: string;
} {
    const trimmed = (url || "").trim();
    if (trimmed.length === 0) {
        return { valid: false, error: "URL é obrigatória" };
    }
    const direct = DIRECT_VIDEO_EXT_REGEX.test(trimmed);
    const youtube = YOUTUBE_REGEX.test(trimmed) || YOUTUBE_EMBED_REGEX.test(trimmed);
    const vimeo = VIMEO_REGEX.test(trimmed) || VIMEO_EMBED_REGEX.test(trimmed);
    const tiktok = TIKTOK_REGEX.test(trimmed) || TIKTOK_EMBED_REGEX.test(trimmed);
    const twitchClip = TWITCH_CLIP_REGEX.test(trimmed) || TWITCH_EMBED_REGEX.test(trimmed);
    const ok = direct || youtube || vimeo || tiktok || twitchClip;
    return ok
        ? { valid: true }
        : { valid: false, error: VIDEO_URL_ERROR_MESSAGE };
}

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

  return {
    name: "Música",
    iconPath: "",
    bgColor: "bg-gray-500",
  };
};

export const MUSIC_URL_ERROR_MESSAGE =
  "URL de música inválida. Aceitos: Spotify";

// Aceita URLs oficiais com segmento de idioma opcional (ex: intl-pt)
// Suporta: track, album, playlist, episode, show
const SPOTIFY_REGEX = /open\.spotify\.com\/(?:[a-z-]+\/)?(track|album|playlist|episode|show)\/[a-zA-Z0-9]+/;

export function isValidMusicUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = (url || "").trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "URL é obrigatória" };
  }
  const spotify = SPOTIFY_REGEX.test(trimmed);
  return spotify ? { valid: true } : { valid: false, error: MUSIC_URL_ERROR_MESSAGE };
}

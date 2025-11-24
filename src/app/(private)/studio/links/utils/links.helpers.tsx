const urlRegex = /^(https?:\/\/)?([^\s.]+\.[^\s]{2,})$/;

export const isValidUrl = (url: string) => urlRegex.test(url);

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface LinkPlatform {
    name: string;
    iconPath: string;
    bgColor: string;
}

export const getLinkPlatform = (url: string): LinkPlatform => {
    const u = (url || "").toLowerCase();
    if (u.startsWith("mailto:")) {
        return {
            name: "Email",
            iconPath: "/icons/mail.svg",
            bgColor: "bg-gray-600",
        };
    }
    if (u.includes("github.com")) {
        return {
            name: "GitHub",
            iconPath: "/icons/github.svg",
            bgColor: "bg-black",
        };
    }
    if (u.includes("youtube.com") || u.includes("youtu.be")) {
        return {
            name: "YouTube",
            iconPath: "/icons/youtube.svg",
            bgColor: "bg-red-600",
        };
    }
    if (u.includes("vimeo.com")) {
        return {
            name: "Vimeo",
            iconPath: "/icons/vimeo.svg",
            bgColor: "bg-blue-500",
        };
    }
    if (u.includes("instagram.com")) {
        return {
            name: "Instagram",
            iconPath: "/icons/instagram.svg",
            bgColor: "bg-pink-600",
        };
    }
    if (u.includes("x.com") || u.includes("twitter.com")) {
        return {
            name: "X",
            iconPath: "/icons/x.svg",
            bgColor: "bg-black",
        };
    }
    if (u.includes("tiktok.com")) {
        return {
            name: "TikTok",
            iconPath: "/icons/tiktok.svg",
            bgColor: "bg-black",
        };
    }
    if (u.includes("linkedin.com")) {
        return {
            name: "LinkedIn",
            iconPath: "/icons/linkedin.svg",
            bgColor: "bg-blue-600",
        };
    }
    if (u.includes("facebook.com")) {
        return {
            name: "Facebook",
            iconPath: "/icons/facebook.svg",
            bgColor: "bg-blue-600",
        };
    }
    if (u.includes("wa.me") || u.includes("whatsapp.com")) {
        return {
            name: "WhatsApp",
            iconPath: "/icons/whatsapp.svg",
            bgColor: "bg-green-500",
        };
    }
    if (u.includes("t.me") || u.includes("telegram.org")) {
        return {
            name: "Telegram",
            iconPath: "/icons/telegram.svg",
            bgColor: "bg-blue-500",
        };
    }
    if (u.includes("reddit.com")) {
        return {
            name: "Reddit",
            iconPath: "/icons/reddit.svg",
            bgColor: "bg-orange-600",
        };
    }
    if (u.includes("pinterest.com")) {
        return {
            name: "Pinterest",
            iconPath: "/icons/pinterest.svg",
            bgColor: "bg-red-600",
        };
    }
    if (u.includes("soundcloud.com")) {
        return {
            name: "SoundCloud",
            iconPath: "/icons/soundcloud.svg",
            bgColor: "bg-orange-500",
        };
    }
    if (u.includes("spotify.com")) {
        return {
            name: "Spotify",
            iconPath: "/icons/spotify.svg",
            bgColor: "bg-green-600",
        };
    }
    if (u.includes("discord.com") || u.includes("discord.gg")) {
        return {
            name: "Discord",
            iconPath: "/icons/discord.svg",
            bgColor: "bg-indigo-500",
        };
    }
    if (u.includes("steamcommunity.com")) {
        return {
            name: "Steam",
            iconPath: "/icons/steam.svg",
            bgColor: "bg-gray-800",
        };
    }
    if (u.includes("play.google.com")) {
        return {
            name: "Google Play",
            iconPath: "/icons/google-play.svg",
            bgColor: "bg-black",
        };
    }
    return {
        name: "Link",
        iconPath: "",
        bgColor: "bg-bunker-950 dark:bg-bunker-100",
    };
};

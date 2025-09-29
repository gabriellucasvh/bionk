export function detectTrafficSourceServer(
	userAgent: string,
	referrer: string | null,
	url: string
): string | null {
	const lowerUserAgent = userAgent.toLowerCase();

	if (lowerUserAgent.includes("instagram")) {
		return "Instagram";
	}

	if (lowerUserAgent.includes("whatsapp")) {
		return "WhatsApp";
	}

	if (
		lowerUserAgent.includes("tiktok") ||
		lowerUserAgent.includes("musical_ly")
	) {
		return "TikTok";
	}

	if (lowerUserAgent.includes("fban") || lowerUserAgent.includes("fbav")) {
		return "Facebook";
	}

	if (
		lowerUserAgent.includes("twitter") ||
		lowerUserAgent.includes("twitterandroid")
	) {
		return "Twitter/X";
	}

	if (lowerUserAgent.includes("linkedin")) {
		return "LinkedIn";
	}

	if (lowerUserAgent.includes("telegram")) {
		return "Telegram";
	}

	try {
		const urlObj = new URL(url);
		const urlParams = urlObj.searchParams;

		if (urlParams.has("fbclid")) {
			return "Facebook";
		}

		const utmSource = urlParams.get("utm_source");
		if (utmSource) {
			switch (utmSource.toLowerCase()) {
				case "instagram":
				case "ig":
					return "Instagram";
				case "facebook":
				case "fb":
					return "Facebook";
				case "whatsapp":
				case "wa":
					return "WhatsApp";
				case "tiktok":
				case "tt":
					return "TikTok";
				case "twitter":
				case "x":
					return "Twitter/X";
				case "youtube":
				case "yt":
					return "YouTube";
				case "linkedin":
				case "li":
					return "LinkedIn";
				case "telegram":
				case "tg":
					return "Telegram";
				default:
					return utmSource;
			}
		}

		if (urlParams.has("igshid")) {return "Instagram"};
		if (urlParams.has("tt_from")) {return "TikTok"};
		if (urlParams.has("si") && url.includes("youtube")) {return "YouTube"};
	} catch {
		// Ignore URL parsing errors
	}

	if (referrer) {
		const referrerSource = detectReferrerSourceServer(referrer);
		if (referrerSource) {return referrerSource};
	}

	return null;
}

function detectReferrerSourceServer(referrer: string): string | null {
	try {
		const url = new URL(referrer);
		const hostname = url.hostname.toLowerCase();

		if (
			hostname.includes("instagram.com") ||
			hostname === "l.instagram.com" ||
			hostname === "help.instagram.com" ||
			hostname === "business.instagram.com" ||
			hostname === "about.instagram.com" ||
			hostname === "www.instagram.com" ||
			hostname === "ig.me" ||
			hostname === "instagr.am" ||
			hostname.endsWith(".instagram.com")
		) {
			return "Instagram";
		}

		if (
			hostname.includes("tiktok.com") ||
			hostname === "vm.tiktok.com" ||
			hostname === "m.tiktok.com" ||
			hostname === "ads.tiktok.com" ||
			hostname === "www.tiktok.com" ||
			hostname === "vt.tiktok.com" ||
			hostname.endsWith(".tiktok.com") ||
			hostname.includes("bytedance.com")
		) {
			return "TikTok";
		}

		if (
			hostname.includes("whatsapp.com") ||
			hostname === "wa.me" ||
			hostname === "web.whatsapp.com" ||
			hostname === "business.whatsapp.com" ||
			hostname === "faq.whatsapp.com" ||
			hostname === "chat.whatsapp.com" ||
			hostname === "www.whatsapp.com" ||
			hostname === "api.whatsapp.com" ||
			hostname.endsWith(".whatsapp.com")
		) {
			return "WhatsApp";
		}

		if (
			hostname.includes("facebook.com") ||
			hostname === "fb.me" ||
			hostname === "m.facebook.com" ||
			hostname === "l.facebook.com" ||
			hostname === "business.facebook.com" ||
			hostname === "developers.facebook.com" ||
			hostname === "lm.facebook.com" ||
			hostname === "www.facebook.com" ||
			hostname === "touch.facebook.com" ||
			hostname === "mbasic.facebook.com" ||
			hostname.endsWith(".facebook.com") ||
			hostname.includes("meta.com")
		) {
			return "Facebook";
		}

		const platformMap: Record<string, string> = {
			"twitter.com": "Twitter/X",
			"www.twitter.com": "Twitter/X",
			"x.com": "Twitter/X",
			"www.x.com": "Twitter/X",
			"t.co": "Twitter/X",
			"youtube.com": "YouTube",
			"www.youtube.com": "YouTube",
			"m.youtube.com": "YouTube",
			"youtu.be": "YouTube",
			"linkedin.com": "LinkedIn",
			"www.linkedin.com": "LinkedIn",
			"lnkd.in": "LinkedIn",
			"telegram.org": "Telegram",
			"web.telegram.org": "Telegram",
			"t.me": "Telegram",
			"discord.com": "Discord",
			"discord.gg": "Discord",
			"reddit.com": "Reddit",
			"www.reddit.com": "Reddit",
			"redd.it": "Reddit",
			"pinterest.com": "Pinterest",
			"www.pinterest.com": "Pinterest",
			"pin.it": "Pinterest",
			"google.com": "Google",
			"www.google.com": "Google",
			"google.com.br": "Google",
			"bing.com": "Bing",
			"www.bing.com": "Bing",
			"duckduckgo.com": "DuckDuckGo",
			"yahoo.com": "Yahoo",
			"www.yahoo.com": "Yahoo",
		};

		for (const [domain, platform] of Object.entries(platformMap)) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				return platform;
			}
		}

		return null;
	} catch {
		return null;
	}
}

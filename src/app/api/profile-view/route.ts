// app/api/profile-view/route.ts
import { NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/hooks/useCookieConsent";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

// Mapa de plataformas com suas palavras-chave no User-Agent
const USER_AGENT_PLATFORM_MAP: Record<string, string[]> = {
	Instagram: ["instagram", "igab/", "instagramapp"],
	WhatsApp: ["whatsapp", "wachat", "whatsappweb"],
	TikTok: ["tiktok", "musical_ly", "tiktokapp", "bytedance"],
	Facebook: ["fban", "fbav", "fbsv", "facebookapp", "fb_iab"],
	"Twitter/X": ["twitter", "twitterandroid", "twitteriphone", "twitterapp"],
	LinkedIn: ["linkedin", "linkedinapp"],
	Telegram: ["telegram", "telegramapp"],
	Discord: ["discord", "discordapp"],
	YouTube: ["youtubeapp"],
};

// Mapa de domínios conhecidos para plataformas
const PLATFORM_DOMAIN_MAP: Record<string, string> = {
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

// Função para detectar plataforma através do User-Agent
function detectPlatformFromUserAgent(userAgent: string | null): string | null {
	if (!userAgent) {
		return null;
	}

	const ua = userAgent.toLowerCase();

	// Caso especial para YouTube (youtube + mobile)
	if (ua.includes("youtube") && ua.includes("mobile")) {
		return "YouTube";
	}

	// Busca por plataformas usando o mapa
	for (const [platform, keywords] of Object.entries(USER_AGENT_PLATFORM_MAP)) {
		if (keywords.some((keyword) => ua.includes(keyword))) {
			return platform;
		}
	}

	return null;
}

// Função para validar trafficSource do frontend
function isValidTrafficSource(trafficSource: string | null): boolean {
	return !!(
		trafficSource &&
		trafficSource !== "null" &&
		trafficSource.trim() !== ""
	);
}

// Função para validar referrer normalizado
function isValidReferrer(referrer: string | null): boolean {
	return !!(referrer && referrer !== "direct" && referrer !== "unknown");
}

// Função híbrida para detectar origem do tráfego combinando User-Agent e Referrer
function detectTrafficSourceHybrid(
	userAgent: string | null,
	referrer: string | null,
	trafficSource: string | null
): string | null {
	if (!(userAgent || referrer || trafficSource)) {
		return null;
	}

	// 1. Prioridade máxima: User-Agent (apps nativos e webviews)
	const platformFromUA = detectPlatformFromUserAgent(userAgent);
	if (platformFromUA) {
		return platformFromUA;
	}

	// 2. Segunda prioridade: trafficSource do frontend (parâmetros de URL)
	if (isValidTrafficSource(trafficSource)) {
		return trafficSource;
	}

	// 3. Terceira prioridade: Referrer normalizado (navegadores web)
	const normalizedReferrer = normalizeReferrer(referrer);
	if (isValidReferrer(normalizedReferrer)) {
		return normalizedReferrer;
	}

	return null;
}

// Função para detectar Instagram através do hostname
function isInstagramDomain(hostname: string): boolean {
	return (
		hostname.includes("instagram.com") ||
		hostname === "l.instagram.com" ||
		hostname === "help.instagram.com" ||
		hostname === "business.instagram.com" ||
		hostname === "about.instagram.com" ||
		hostname === "www.instagram.com" ||
		hostname === "ig.me" ||
		hostname === "instagr.am" ||
		hostname.endsWith(".instagram.com")
	);
}

// Função para detectar TikTok através do hostname
function isTikTokDomain(hostname: string): boolean {
	return (
		hostname.includes("tiktok.com") ||
		hostname === "vm.tiktok.com" ||
		hostname === "m.tiktok.com" ||
		hostname === "ads.tiktok.com" ||
		hostname === "www.tiktok.com" ||
		hostname === "vt.tiktok.com" ||
		hostname.endsWith(".tiktok.com") ||
		hostname.includes("bytedance.com")
	);
}

// Função para detectar WhatsApp através do hostname
function isWhatsAppDomain(hostname: string): boolean {
	return (
		hostname.includes("whatsapp.com") ||
		hostname === "wa.me" ||
		hostname === "web.whatsapp.com" ||
		hostname === "business.whatsapp.com" ||
		hostname === "faq.whatsapp.com" ||
		hostname === "chat.whatsapp.com" ||
		hostname === "www.whatsapp.com" ||
		hostname === "api.whatsapp.com" ||
		hostname.endsWith(".whatsapp.com")
	);
}

// Função para detectar Facebook através do hostname
function isFacebookDomain(hostname: string): boolean {
	return (
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
	);
}

// Função para detectar plataforma através do hostname
function detectPlatformFromHostname(hostname: string): string | null {
	if (isInstagramDomain(hostname)) {
		return "Instagram";
	}
	if (isTikTokDomain(hostname)) {
		return "TikTok";
	}
	if (isWhatsAppDomain(hostname)) {
		return "WhatsApp";
	}
	if (isFacebookDomain(hostname)) {
		return "Facebook";
	}

	// Verificar mapa de domínios conhecidos
	for (const [domain, platform] of Object.entries(PLATFORM_DOMAIN_MAP)) {
		if (hostname === domain || hostname.endsWith(`.${domain}`)) {
			return platform;
		}
	}

	return null;
}

// Função para extrair domínio principal
function extractMainDomain(hostname: string): string {
	const domainParts = hostname.split(".");
	if (domainParts.length >= 2) {
		return `${domainParts.at(-2)}.${domainParts.at(-1)}`;
	}
	return hostname;
}

// Função para normalizar e anonimizar referrers
function normalizeReferrer(referrer: string | null): string | null {
	if (!referrer) {
		return "direct";
	}

	try {
		const url = new URL(referrer);
		const hostname = url.hostname.toLowerCase();

		// Detectar plataforma conhecida
		const platform = detectPlatformFromHostname(hostname);
		if (platform) {
			return platform;
		}

		// Para outros domínios, retornar apenas o domínio principal
		return extractMainDomain(hostname);
	} catch {
		return "unknown";
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		const { userId, trafficSource } = await request.json();
		if (!userId) {
			return NextResponse.json(
				{ error: "UserId is required" },
				{ status: 400 }
			);
		}

		// Verificar preferências de cookies
		const cookiePreferences = getCookiePreferencesFromRequest(request);

		// Se analytics não estão permitidos, não processar
		if (!cookiePreferences.analytics) {
			return NextResponse.json(
				{
					message: "Analytics tracking not allowed",
				},
				{ status: 200 }
			);
		}

		// Detectar tipo de dispositivo de forma anônima (LGPD compliant)
		const userAgent = getUserAgent(request);
		const deviceType = detectDeviceType(userAgent);

		// Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(request);
		const country = await getCountryFromIP(clientIP || "127.0.0.1");

		// Capturar referrer de forma anonimizada
		const referrerHeader =
			request.headers.get("referer") || request.headers.get("referrer") || null;

		// Log para debug em produção

		// Usar detecção híbrida que combina User-Agent + Referrer + Parâmetros URL
		const referrer =
			detectTrafficSourceHybrid(userAgent, referrerHeader, trafficSource) ||
			"direct";

		await prisma.profileView.create({
			data: {
				userId,
				device: deviceType,
				userAgent,
				country,
				referrer,
			},
		});
		return NextResponse.json({ message: "Profile view recorded" });
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/hooks/useCookieConsent";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

// Mapa de User-Agent para detecção de plataformas
const USER_AGENT_PLATFORM_MAP: Record<string, string[]> = {
	Instagram: ["instagram", "igab/", "instagramapp"],
	WhatsApp: ["whatsapp", "wachat", "whatsappweb"],
	TikTok: ["tiktok", "musical_ly", "tiktokapp", "bytedance"],
	Facebook: ["fban", "fbav", "fbsv", "facebookapp", "fb_iab"],
	"Twitter/X": ["twitter", "twitterandroid", "twitteriphone", "twitterapp"],
	LinkedIn: ["linkedin", "linkedinapp"],
	Telegram: ["telegram", "telegramapp"],
	Discord: ["discord", "discordapp"],
};

// Função para detectar plataforma pelo User-Agent
function detectPlatformFromUserAgent(userAgent: string): string | null {
	const ua = userAgent.toLowerCase();

	// Buscar plataforma no mapa
	for (const [platform, keywords] of Object.entries(USER_AGENT_PLATFORM_MAP)) {
		if (keywords.some((keyword) => ua.includes(keyword))) {
			return platform;
		}
	}

	// Caso especial para YouTube
	if (
		ua.includes("youtubeapp") ||
		(ua.includes("youtube") && ua.includes("mobile"))
	) {
		return "YouTube";
	}

	return null;
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
	if (userAgent) {
		const platformFromUA = detectPlatformFromUserAgent(userAgent);
		if (platformFromUA) {
			return platformFromUA;
		}
	}

	// 2. Segunda prioridade: trafficSource do frontend (parâmetros de URL)
	if (
		trafficSource &&
		trafficSource !== "null" &&
		trafficSource.trim() !== ""
	) {
		return trafficSource;
	}

	// 3. Terceira prioridade: Referrer normalizado (navegadores web)
	const normalizedReferrer = normalizeReferrer(referrer);
	if (
		normalizedReferrer &&
		normalizedReferrer !== "direct" &&
		normalizedReferrer !== "unknown"
	) {
		return normalizedReferrer;
	}

	return null;
}

// Função para normalizar e anonimizar referrers
function normalizeReferrer(referrer: string | null): string | null {
	if (!referrer) {
		return "direct";
	}

	try {
		const url = new URL(referrer);
		const hostname = url.hostname.toLowerCase();

		// Verificar padrões de domínio para cada plataforma
		// Instagram - incluindo todos os subdomínios, redirecionamentos e variações
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

		// TikTok - incluindo domínios móveis, regionais e redirecionamentos
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

		// WhatsApp - incluindo todos os domínios, redirecionamentos e variações
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

		// Facebook - incluindo Meta, todos os subdomínios e redirecionamentos
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

		// Mapear domínios conhecidos restantes
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

		// Verificar se é uma plataforma conhecida
		for (const [domain, platform] of Object.entries(platformMap)) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				return platform;
			}
		}

		// Para outros domínios, retornar apenas o domínio principal (sem subdomínios)
		const domainParts = hostname.split(".");
		if (domainParts.length >= 2) {
			return `${domainParts.at(-2)}.${domainParts.at(-1)}`;
		}

		return hostname;
	} catch {
		// Se não conseguir fazer parse da URL, retornar 'unknown'
		return "unknown";
	}
}

export async function POST(req: NextRequest) {
	try {
		// Lida tanto com JSON quanto com texto plano do sendBeacon
		const body = await req.text();
		const { linkId, trafficSource } = JSON.parse(body);

		if (!linkId || Number.isNaN(Number(linkId))) {
			return NextResponse.json(
				{ error: "ID do link é obrigatório e deve ser um número" },
				{ status: 400 }
			);
		}

		// Verificar preferências de cookies
		const cookiePreferences = getCookiePreferencesFromRequest(req);

		// Se analytics não estão permitidos, não processar o tracking detalhado
		if (!cookiePreferences.analytics) {
			// Ainda incrementar o contador de cliques (funcionalidade essencial)
			// mas sem coletar dados de tracking
			const linkWithIncrementedClicks = await prisma.link.update({
				where: { id: Number(linkId) },
				data: { clicks: { increment: 1 } },
			});

			if (
				linkWithIncrementedClicks.deleteOnClicks &&
				linkWithIncrementedClicks.clicks >=
					linkWithIncrementedClicks.deleteOnClicks
			) {
				await prisma.link.update({
					where: { id: Number(linkId) },
					data: { active: false },
				});
			}

			return NextResponse.json({
				message: "Click recorded without tracking",
				clicks: linkWithIncrementedClicks.clicks,
			});
		}

		// Detectar tipo de dispositivo de forma anônima (LGPD compliant)
		const userAgent = getUserAgent(req);
		const deviceType = detectDeviceType(userAgent);

		// Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(req);
		const country = await getCountryFromIP(clientIP || "127.0.0.1");

		// Capturar referrer de forma anonimizada
		const referrerHeader =
			req.headers.get("referer") || req.headers.get("referrer") || null;

		// Log para debug em produção

		// Usar detecção híbrida que combina User-Agent + Referrer + Parâmetros URL
		const normalizedReferrer =
			detectTrafficSourceHybrid(userAgent, referrerHeader, trafficSource) ||
			"direct";

		const [, updatedLink] = await prisma.$transaction([
			prisma.linkClick.create({
				data: {
					linkId: Number(linkId),
					device: deviceType,
					userAgent,
					country,
					referrer: normalizedReferrer,
				},
			}),
			prisma.link.update({
				where: { id: Number(linkId) },
				data: { clicks: { increment: 1 } },
			}),
		]);

		if (
			updatedLink.deleteOnClicks &&
			updatedLink.clicks >= updatedLink.deleteOnClicks
		) {
			await prisma.link.update({
				where: { id: Number(linkId) },
				data: { active: false },
			});
		}

		return NextResponse.json(updatedLink);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

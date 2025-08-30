import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getCountryFromIP, getClientIP } from "@/utils/geolocation";
import { type NextRequest, NextResponse } from "next/server";

// Função para normalizar e anonimizar referrers
function normalizeReferrer(referrer: string | null): string | null {
	if (!referrer) return 'direct';
	
	try {
		const url = new URL(referrer);
		const hostname = url.hostname.toLowerCase();
		
		// Mapear domínios conhecidos para plataformas
		const platformMap: Record<string, string> = {
			'instagram.com': 'Instagram',
			'www.instagram.com': 'Instagram',
			'l.instagram.com': 'Instagram',
			'tiktok.com': 'TikTok',
			'www.tiktok.com': 'TikTok',
			'vm.tiktok.com': 'TikTok',
			'twitter.com': 'Twitter/X',
			'www.twitter.com': 'Twitter/X',
			'x.com': 'Twitter/X',
			'www.x.com': 'Twitter/X',
			't.co': 'Twitter/X',
			'facebook.com': 'Facebook',
			'www.facebook.com': 'Facebook',
			'm.facebook.com': 'Facebook',
			'fb.me': 'Facebook',
			'youtube.com': 'YouTube',
			'www.youtube.com': 'YouTube',
			'm.youtube.com': 'YouTube',
			'youtu.be': 'YouTube',
			'linkedin.com': 'LinkedIn',
			'www.linkedin.com': 'LinkedIn',
			'lnkd.in': 'LinkedIn',
			'whatsapp.com': 'WhatsApp',
			'web.whatsapp.com': 'WhatsApp',
			'wa.me': 'WhatsApp',
			'telegram.org': 'Telegram',
			'web.telegram.org': 'Telegram',
			't.me': 'Telegram',
			'discord.com': 'Discord',
			'discord.gg': 'Discord',
			'reddit.com': 'Reddit',
			'www.reddit.com': 'Reddit',
			'redd.it': 'Reddit',
			'pinterest.com': 'Pinterest',
			'www.pinterest.com': 'Pinterest',
			'pin.it': 'Pinterest',
			'google.com': 'Google',
			'www.google.com': 'Google',
			'google.com.br': 'Google',
			'bing.com': 'Bing',
			'www.bing.com': 'Bing',
			'duckduckgo.com': 'DuckDuckGo',
			'yahoo.com': 'Yahoo',
			'www.yahoo.com': 'Yahoo'
		};
		
		// Verificar se é uma plataforma conhecida
		for (const [domain, platform] of Object.entries(platformMap)) {
			if (hostname === domain || hostname.endsWith(`.${domain}`)) {
				return platform;
			}
		}
		
		// Para outros domínios, retornar apenas o domínio principal (sem subdomínios)
		const domainParts = hostname.split('.');
		if (domainParts.length >= 2) {
			return `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
		}
		
		return hostname;
	} catch {
		// Se não conseguir fazer parse da URL, retornar 'unknown'
		return 'unknown';
	}
}

export async function POST(req: NextRequest) {
	try {
		// Lida tanto com JSON quanto com texto plano do sendBeacon
		const body = await req.text();
		const { linkId } = JSON.parse(body);

		if (!linkId || Number.isNaN(Number(linkId))) {
			return NextResponse.json(
				{ error: "ID do link é obrigatório e deve ser um número" },
				{ status: 400 }
			);
		}

		// Detectar tipo de dispositivo de forma anônima (LGPD compliant)
		const userAgent = getUserAgent(req);
		const deviceType = detectDeviceType(userAgent);

		// Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(req);
		const country = await getCountryFromIP(clientIP || '127.0.0.1');

		// Capturar referrer de forma anonimizada
		const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;
		const normalizedReferrer = normalizeReferrer(referrer);

		const [, updatedLink] = await prisma.$transaction([
			prisma.linkClick.create({
				data: {
					linkId: Number(linkId),
					device: deviceType,
					userAgent: userAgent,
					country: country,
					referrer: normalizedReferrer
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
	} catch  {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

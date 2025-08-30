// app/api/profile-view/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getCountryFromIP, getClientIP } from "@/utils/geolocation";

// Função para normalizar e anonimizar referrers
function normalizeReferrer(referrer: string | null): string | null {
	if (!referrer) return 'direct';
	
	try {
		const url = new URL(referrer);
		const hostname = url.hostname.toLowerCase();
		
		// Verificar padrões de domínio para cada plataforma
		// Instagram - incluindo todos os subdomínios e redirecionamentos
		if (hostname.includes('instagram.com') || hostname === 'l.instagram.com' || 
				hostname === 'help.instagram.com' || hostname === 'business.instagram.com' ||
				hostname === 'about.instagram.com' || hostname.endsWith('.instagram.com')) {
			return 'Instagram';
		}
		
		// TikTok - incluindo domínios móveis e regionais
		if (hostname.includes('tiktok.com') || hostname === 'vm.tiktok.com' || 
				hostname === 'm.tiktok.com' || hostname === 'ads.tiktok.com' ||
				hostname === 'www.tiktok.com' || hostname.endsWith('.tiktok.com')) {
			return 'TikTok';
		}
		
		// WhatsApp - incluindo todos os domínios e redirecionamentos
		if (hostname.includes('whatsapp.com') || hostname === 'wa.me' || 
				hostname === 'web.whatsapp.com' || hostname === 'business.whatsapp.com' ||
				hostname === 'faq.whatsapp.com' || hostname === 'chat.whatsapp.com' ||
				hostname.endsWith('.whatsapp.com')) {
			return 'WhatsApp';
		}
		
		// Facebook - incluindo Meta e todos os subdomínios
		if (hostname.includes('facebook.com') || hostname === 'fb.me' || 
				hostname === 'm.facebook.com' || hostname === 'l.facebook.com' ||
				hostname === 'business.facebook.com' || hostname === 'developers.facebook.com' ||
				hostname === 'lm.facebook.com' || hostname.endsWith('.facebook.com')) {
			return 'Facebook';
		}
		
		// Mapear domínios conhecidos restantes
		const platformMap: Record<string, string> = {
			'twitter.com': 'Twitter/X',
			'www.twitter.com': 'Twitter/X',
			'x.com': 'Twitter/X',
			'www.x.com': 'Twitter/X',
			't.co': 'Twitter/X',
			'youtube.com': 'YouTube',
			'www.youtube.com': 'YouTube',
			'm.youtube.com': 'YouTube',
			'youtu.be': 'YouTube',
			'linkedin.com': 'LinkedIn',
			'www.linkedin.com': 'LinkedIn',
			'lnkd.in': 'LinkedIn',
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }
    
    // Detectar tipo de dispositivo de forma anônima (LGPD compliant)
    const userAgent = getUserAgent(request);
    const deviceType = detectDeviceType(userAgent);
    
    // Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(request);
		const country = await getCountryFromIP(clientIP || '127.0.0.1');

		// Capturar referrer de forma anonimizada
		const referrer = request.headers.get('referer') || request.headers.get('referrer') || null;
		const normalizedReferrer = normalizeReferrer(referrer);

    await prisma.profileView.create({
      data: { 
        userId,
        device: deviceType,
        userAgent: userAgent,
        country: country,
        referrer: normalizedReferrer
      },
    });
    return NextResponse.json({ message: "Profile view recorded" });
  } catch (error) {
    console.error("Error recording profile view", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// utils/traffic-source.ts

/**
 * Detecta a origem do tráfego baseada em User-Agent, parâmetros de URL e referrer
 * Útil para identificar de onde o usuário veio com máxima precisão
 */
export function detectTrafficSource(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent.toLowerCase();
  const referrer = document.referrer;
  
  // 1. Detectar pelo User-Agent primeiro (mais confiável para apps nativos)
  if (userAgent.includes('instagram')) {
    return 'Instagram';
  }
  
  if (userAgent.includes('whatsapp')) {
    return 'WhatsApp';
  }
  
  if (userAgent.includes('tiktok') || userAgent.includes('musical_ly')) {
    return 'TikTok';
  }
  
  if (userAgent.includes('fban') || userAgent.includes('fbav')) {
    return 'Facebook';
  }
  
  if (userAgent.includes('twitter') || userAgent.includes('twitterandroid')) {
    return 'Twitter/X';
  }
  
  if (userAgent.includes('linkedin')) {
    return 'LinkedIn';
  }
  
  if (userAgent.includes('telegram')) {
    return 'Telegram';
  }
  
  // 2. Detectar por parâmetros de URL
  // Facebook/Instagram - fbclid parameter
  if (urlParams.has('fbclid')) {
    // Se já não foi detectado pelo user agent, assumir Facebook
    return 'Facebook';
  }
  
  // UTM Source
  const utmSource = urlParams.get('utm_source');
  if (utmSource) {
    switch (utmSource.toLowerCase()) {
      case 'instagram':
      case 'ig':
        return 'Instagram';
      case 'facebook':
      case 'fb':
        return 'Facebook';
      case 'whatsapp':
      case 'wa':
        return 'WhatsApp';
      case 'tiktok':
      case 'tt':
        return 'TikTok';
      case 'twitter':
      case 'x':
        return 'Twitter/X';
      case 'youtube':
      case 'yt':
        return 'YouTube';
      case 'linkedin':
      case 'li':
        return 'LinkedIn';
      case 'telegram':
      case 'tg':
        return 'Telegram';
      default:
        return utmSource;
    }
  }
  
  // Outros parâmetros conhecidos
  if (urlParams.has('igshid')) return 'Instagram';
  if (urlParams.has('tt_from')) return 'TikTok';
  if (urlParams.has('si') && window.location.href.includes('youtube')) return 'YouTube';
  
  // 3. Detectar por referrer (para navegadores web)
  if (referrer) {
    const referrerSource = detectReferrerSource(referrer);
    if (referrerSource) return referrerSource;
  }
  
  return null;
}

/**
 * Detecta a origem do tráfego baseada no referrer (para navegadores web)
 */
function detectReferrerSource(referrer: string): string | null {
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    // Instagram - incluindo todos os subdomínios, redirecionamentos e variações
    if (hostname.includes('instagram.com') || hostname === 'l.instagram.com' || 
        hostname === 'help.instagram.com' || hostname === 'business.instagram.com' ||
        hostname === 'about.instagram.com' || hostname === 'www.instagram.com' ||
        hostname === 'ig.me' || hostname === 'instagr.am' ||
        hostname.endsWith('.instagram.com')) {
      return 'Instagram';
    }
    
    // TikTok - incluindo domínios móveis, regionais e redirecionamentos
    if (hostname.includes('tiktok.com') || hostname === 'vm.tiktok.com' || 
        hostname === 'm.tiktok.com' || hostname === 'ads.tiktok.com' ||
        hostname === 'www.tiktok.com' || hostname === 'vt.tiktok.com' ||
        hostname.endsWith('.tiktok.com') || hostname.includes('bytedance.com')) {
      return 'TikTok';
    }
    
    // WhatsApp - incluindo todos os domínios, redirecionamentos e variações
    if (hostname.includes('whatsapp.com') || hostname === 'wa.me' || 
        hostname === 'web.whatsapp.com' || hostname === 'business.whatsapp.com' ||
        hostname === 'faq.whatsapp.com' || hostname === 'chat.whatsapp.com' ||
        hostname === 'www.whatsapp.com' || hostname === 'api.whatsapp.com' ||
        hostname.endsWith('.whatsapp.com')) {
      return 'WhatsApp';
    }
    
    // Facebook - incluindo Meta, todos os subdomínios e redirecionamentos
    if (hostname.includes('facebook.com') || hostname === 'fb.me' || 
        hostname === 'm.facebook.com' || hostname === 'l.facebook.com' ||
        hostname === 'business.facebook.com' || hostname === 'developers.facebook.com' ||
        hostname === 'lm.facebook.com' || hostname === 'www.facebook.com' ||
        hostname === 'touch.facebook.com' || hostname === 'mbasic.facebook.com' ||
        hostname.endsWith('.facebook.com') || hostname.includes('meta.com')) {
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
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Lista de plataformas suportadas para detecção de tráfego
 */
export const SUPPORTED_PLATFORMS = [
  'Instagram',
  'Facebook', 
  'WhatsApp',
  'TikTok',
  'Twitter/X',
  'YouTube',
  'LinkedIn',
  'Telegram'
] as const;

export type SupportedPlatform = typeof SUPPORTED_PLATFORMS[number];
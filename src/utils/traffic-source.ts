// utils/traffic-source.ts

/**
 * Detecta a origem do tráfego baseada em parâmetros de URL e User-Agent
 * Útil para identificar de onde o usuário veio quando o referrer HTTP não é confiável
 */
export function detectTrafficSource(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar pelo User-Agent primeiro (mais confiável para apps nativos)
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
  
  return null;
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
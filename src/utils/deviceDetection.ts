// src/utils/deviceDetection.ts

/**
 * Detecta o tipo de dispositivo baseado no User-Agent
 * Função que respeita a LGPD - não armazena dados pessoais identificáveis
 * @param userAgent - String do User-Agent do navegador
 * @returns Tipo do dispositivo: 'mobile', 'tablet', 'desktop' ou 'unknown'
 */
export function detectDeviceType(userAgent: string | null): string {
  if (!userAgent) {
    return 'unknown';
  }

  // Normalizar para lowercase para comparação
  const ua = userAgent.toLowerCase();

  // Detectar dispositivos móveis
  const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i;
  if (mobileRegex.test(ua)) {
    return 'mobile';
  }

  // Detectar tablets
  const tabletRegex = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i;
  if (tabletRegex.test(ua)) {
    return 'tablet';
  }

  // Detectar desktop (padrão para outros casos)
  const desktopRegex = /windows|macintosh|linux|x11/i;
  if (desktopRegex.test(ua)) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * Função auxiliar para obter o User-Agent de forma segura
 * @param request - Objeto Request do Next.js
 * @returns User-Agent string ou null
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent');
}
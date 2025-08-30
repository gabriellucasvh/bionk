// Função para obter país baseado no IP usando ipapi.co (gratuito até 1000 requests/dia)
export async function getCountryFromIP(ip: string): Promise<string> {
	// Handle local/private IPs - try to get real IP first
	if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
		// Try to get real IP from external service
		try {
			const realIPResponse = await fetch('https://api.ipify.org?format=json', {
				signal: AbortSignal.timeout(3000)
			});
			if (realIPResponse.ok) {
				const { ip: realIP } = await realIPResponse.json();
				if (realIP && realIP !== ip) {
					return await getCountryFromRealIP(realIP);
				}
			}
		} catch (error) {
			console.log('Could not get real IP, using fallback');
		}
		return 'Brazil'; // Fallback para desenvolvimento local
	}

	return await getCountryFromRealIP(ip);
}

async function getCountryFromRealIP(ip: string): Promise<string> {
	const services = [
		{
			url: `https://ipapi.co/${ip}/country_name/`,
			type: 'text' as const,
			parser: (text: string) => text.trim()
		},
		{
			url: `https://ipinfo.io/${ip}/country`,
			type: 'text' as const,
			parser: (text: string) => {
				const countryCode = text.trim();
				// Convert country code to country name
				const countryNames: { [key: string]: string } = {
					'BR': 'Brazil',
					'US': 'United States',
					'CA': 'Canada',
					'GB': 'United Kingdom',
					'DE': 'Germany',
					'FR': 'France',
					'IT': 'Italy',
					'ES': 'Spain',
					'PT': 'Portugal',
					'AR': 'Argentina',
					'MX': 'Mexico',
					'JP': 'Japan',
					'CN': 'China',
					'IN': 'India',
					'AU': 'Australia'
				};
				return countryNames[countryCode] || countryCode;
			}
		},
		{
			url: `http://ip-api.com/json/${ip}?fields=country`,
			type: 'json' as const,
			parser: async (response: Response) => {
				const data = await response.json();
				return data.country || 'Unknown';
			}
		}
	];

	for (const service of services) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 4000);

			const response = await fetch(service.url, {
				signal: controller.signal,
				headers: {
					'User-Agent': 'Bionk-Analytics/1.0'
				}
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				let country: string;
				if (service.type === 'json') {
					country = await service.parser(response);
				} else {
					const text = await response.text();
					country = service.parser(text);
				}
				
				if (country && country !== 'Unknown' && country.length > 0) {
					return country;
				}
			}
		} catch (error) {
			console.log(`Service ${service.url} failed:`, error);
			continue;
		}
	}

	return 'Unknown';
}

// Função para obter IP do cliente a partir dos headers da requisição
export function getClientIP(request: Request): string | null {
  // Verificar headers comuns de proxy/CDN
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Pegar o primeiro IP da lista (IP original do cliente)
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback para outros headers
  const xClientIP = request.headers.get('x-client-ip');
  if (xClientIP) {
    return xClientIP;
  }

  return null;
}
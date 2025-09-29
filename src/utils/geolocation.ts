import type { NextRequest } from "next/server";

// Função para extrair IP do request
export function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIP = request.headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIP) {
		return realIP;
	}

	return "127.0.0.1"; // fallback para desenvolvimento local
}

// Função para obter país baseado no IP usando ipapi.co (gratuito até 1000 requests/dia)
export async function getCountryFromIP(
	request: NextRequest | string
): Promise<string> {
	let ip: string;

	if (typeof request === "string") {
		ip = request;
	} else {
		ip = getClientIP(request);
	}

	// Handle local/private IPs - try to get real IP first
	if (
		!ip ||
		ip === "127.0.0.1" ||
		ip === "::1" ||
		ip.startsWith("192.168.") ||
		ip.startsWith("10.") ||
		ip.startsWith("172.")
	) {
		// Try to get real IP from external service
		try {
			const realIPResponse = await fetch("https://api.ipify.org?format=json", {
				signal: AbortSignal.timeout(3000),
			});
			if (realIPResponse.ok) {
				const { ip: realIP } = await realIPResponse.json();
				if (realIP && realIP !== ip) {
					return await getCountryFromRealIP(realIP);
				}
			}
		} catch {
			console.log("Could not get real IP, using fallback");
		}
		return "Brazil"; // Fallback para desenvolvimento local
	}

	return await getCountryFromRealIP(ip);
}

function getCountryFromRealIP(ip: string): Promise<string> {
	const services = [
		{
			url: `https://ipapi.co/${ip}/country_name/`,
			type: "text" as const,
			parser: (text: string) => text.trim(),
		},
		{
			url: `https://ipinfo.io/${ip}/country`,
			type: "text" as const,
			parser: (text: string) => {
				const countryCode = text.trim();
				// Convert country code to country name
				const countryNames: { [key: string]: string } = {
					BR: "Brazil",
					US: "United States",
					CA: "Canada",
					GB: "United Kingdom",
					DE: "Germany",
					FR: "France",
					IT: "Italy",
					ES: "Spain",
					PT: "Portugal",
					AR: "Argentina",
					MX: "Mexico",
					JP: "Japan",
					CN: "China",
					IN: "India",
					AU: "Australia",
				};
				return countryNames[countryCode] || countryCode;
			},
		},
		{
			url: `http://ip-api.com/json/${ip}?fields=country`,
			type: "json" as const,
			parser: async (response: Response) => {
				const data = await response.json();
				return data.country || "Unknown";
			},
		},
	];

	const tryService = async (
		service: (typeof services)[0]
	): Promise<string | null> => {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 4000);

			const response = await fetch(service.url, {
				signal: controller.signal,
				headers: {
					"User-Agent": "Bionk-Analytics/1.0",
				},
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				let country: string;
				if (service.type === "json") {
					country = await service.parser(response);
				} else {
					const text = await response.text();
					country = service.parser(text);
				}

				if (country && country !== "Unknown" && country.length > 0) {
					return country;
				}
			}
		} catch (error) {
			console.log(`Service ${service.url} failed:`, error);
		}
		return null;
	};

	const tryServicesSequentially = async (index: number): Promise<string> => {
		if (index >= services.length) {
			return "Unknown";
		}

		const result = await tryService(services[index]);
		if (result) {
			return result;
		}

		return tryServicesSequentially(index + 1);
	};

	return tryServicesSequentially(0);
}

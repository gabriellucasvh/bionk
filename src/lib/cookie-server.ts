interface CookiePreferences {
	essential: boolean;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

export function getCookiePreferencesFromRequest(
	request: Request
): CookiePreferences {
	const cookieHeader = request.headers.get("cookie") || "";

	const getCookie = (name: string, defaultValue = false): boolean => {
		const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
		return match ? match[2] === "true" : defaultValue;
	};

	return {
		essential: true, // Sempre true
		analytics: getCookie("cookie-analytics", true), // Usar padrão true para analytics
		functional: getCookie("cookie-functional", false),
		marketing: getCookie("cookie-marketing", false),
	};
}

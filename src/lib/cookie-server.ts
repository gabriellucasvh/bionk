import { cookies } from "next/headers";

interface CookiePreferences {
	essential: boolean;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

export function getCookiePreferencesFromHeaders(): CookiePreferences {
	const cookieStore = cookies() as any;
	const getBool = (name: string, defaultValue = false): boolean => {
		const val = cookieStore.get(name)?.value;
		return val ? val === "true" : defaultValue;
	};
	return {
		essential: true,
		analytics: getBool("cookie-analytics", false),
		functional: getBool("cookie-functional", false),
		marketing: getBool("cookie-marketing", false),
	};
}

// Backwards compatibility for existing call sites that pass Request
export function getCookiePreferencesFromRequest(
	request: Request
): CookiePreferences {
	const cookieHeader = request.headers.get("cookie") || "";
	const getCookie = (name: string, defaultValue = false): boolean => {
		const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
		return match ? match[2] === "true" : defaultValue;
	};
	return {
		essential: true,
		analytics: getCookie("cookie-analytics", false),
		functional: getCookie("cookie-functional", false),
		marketing: getCookie("cookie-marketing", false),
	};
}

"use client";

import { useEffect, useState } from "react";

interface CookiePreferences {
	essential: boolean;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

const COOKIE_CONSENT_KEY = "bionk-cookie-consent";
const COOKIE_PREFERENCES_KEY = "bionk-cookie-preferences";

const defaultPreferences: CookiePreferences = {
	essential: true,
	analytics: false,
	functional: false,
	marketing: false,
};

export function useCookieConsent() {
	const [hasConsent, setHasConsent] = useState<boolean | null>(null);
	const [preferences, setPreferences] =
		useState<CookiePreferences>(defaultPreferences);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
			const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

			setHasConsent(consent === "true");

			if (savedPreferences) {
				const parsed = JSON.parse(savedPreferences);
				setPreferences(parsed);
			} else {
				setPreferences(defaultPreferences);
			}
		} catch {
			setHasConsent(false);
			setPreferences(defaultPreferences);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const handler = (e: Event) => {
			const ce = e as CustomEvent<any>;
			const d = ce.detail;
			if (!(d && d.preferences)) {
				return;
			}
			setHasConsent(d.hasConsent === true);
			setPreferences(d.preferences);
			try {
				localStorage.setItem(
					COOKIE_CONSENT_KEY,
					d.hasConsent ? "true" : "false"
				);
				localStorage.setItem(
					COOKIE_PREFERENCES_KEY,
					JSON.stringify(d.preferences)
				);
			} catch {}
		};

		if (typeof window !== "undefined") {
			window.addEventListener(
				"cookie-preferences-changed",
				handler as EventListener
			);
		}

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener(
					"cookie-preferences-changed",
					handler as EventListener
				);
			}
		};
	}, []);

	// Função para verificar se um tipo específico de cookie é permitido
	const canUse = (type: keyof CookiePreferences): boolean => {
		if (!hasConsent) {
			return false;
		}
		return preferences[type];
	};

	// Função para verificar se analytics podem ser usados
	const canUseAnalytics = (): boolean => {
		return canUse("analytics");
	};

	// Função para verificar se cookies funcionais podem ser usados
	const canUseFunctional = (): boolean => {
		return canUse("functional");
	};

	// Função para verificar se cookies de marketing podem ser usados
	const canUseMarketing = (): boolean => {
		return canUse("marketing");
	};

	// Função para obter preferências do servidor (via cookies HTTP)
	const getServerPreferences = (): CookiePreferences => {
		if (typeof document === "undefined") {
			return defaultPreferences;
		}

		const getCookie = (name: string): boolean => {
			const value = document.cookie
				.split("; ")
				.find((row) => row.startsWith(`${name}=`))
				?.split("=")[1];
			return value === "true";
		};

		return {
			essential: true, // Sempre true
			analytics: getCookie("cookie-analytics"),
			functional: getCookie("cookie-functional"),
			marketing: getCookie("cookie-marketing"),
		};
	};

	return {
		hasConsent,
		preferences,
		isLoading,
		canUse,
		canUseAnalytics,
		canUseFunctional,
		canUseMarketing,
		getServerPreferences,
	};
}

// Hook para uso no servidor (Next.js)
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

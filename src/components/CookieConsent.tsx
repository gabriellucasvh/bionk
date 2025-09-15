"use client";

import { HelpCircle, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BaseButton } from "./buttons/BaseButton";

interface CookiePreferences {
	essential: boolean;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

interface CookieConsentProps {
	userId?: string;
}

const COOKIE_CONSENT_KEY = "bionk-cookie-consent";
const COOKIE_PREFERENCES_KEY = "bionk-cookie-preferences";

const defaultPreferences: CookiePreferences = {
	essential: true, // Sempre ativo
	analytics: false,
	functional: false,
	marketing: false,
};

export default function CookieConsent({ userId: _ }: CookieConsentProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [showCustomization, setShowCustomization] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
	const [preferences, setPreferences] =
		useState<CookiePreferences>(defaultPreferences);

	useEffect(() => {
		// Verificar se o usuário já deu consentimento
		const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
		if (hasConsent) {
			// Carregar preferências salvas
			const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
			if (savedPreferences) {
				try {
					setPreferences(JSON.parse(savedPreferences));
				} catch {
					// Se houver erro, usar preferências padrão
					setPreferences(defaultPreferences);
				}
			}
		} else {
			setIsVisible(true);
		}
	}, []);

	const savePreferences = (prefs: CookiePreferences) => {
		localStorage.setItem(COOKIE_CONSENT_KEY, "true");
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
		setPreferences(prefs);
		setIsVisible(false);
		setShowCustomization(false);

		// Aplicar preferências imediatamente
		applyCookiePreferences(prefs);
	};

	const setCookie = (name: string, value: string, maxAge = 31_536_000) => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			// Use Cookie Store API if available
			if ("cookieStore" in window) {
				(window as any).cookieStore.set({
					name,
					value,
					path: "/",
					maxAge,
					sameSite: "lax",
				});
			} else {
				// Fallback to document.cookie with proper encapsulation
				const cookieString = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
				// biome-ignore lint/suspicious/noDocumentCookie: Fallback when Cookie Store API is not available
				document.cookie = cookieString;
			}
		} catch (error) {
			console.warn("Failed to set cookie:", error);
		}
	};

	const applyCookiePreferences = (prefs: CookiePreferences) => {
		// Definir cookies de preferências para o servidor
		setCookie("cookie-consent", "true");
		setCookie("cookie-analytics", prefs.analytics.toString());
		setCookie("cookie-functional", prefs.functional.toString());
		setCookie("cookie-marketing", prefs.marketing.toString());

		// Recarregar a página para aplicar as novas configurações
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	const handleAcceptAll = () => {
		const allAccepted: CookiePreferences = {
			essential: true,
			analytics: true,
			functional: true,
			marketing: true,
		};
		savePreferences(allAccepted);
	};

	const handleRejectAll = () => {
		savePreferences(defaultPreferences);
	};

	const handleCustomSave = () => {
		savePreferences(preferences);
	};

	const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
		if (key === "essential") {
			return;
		} // Essential cookies não podem ser desabilitados
		setPreferences((prev) => ({ ...prev, [key]: value }));
	};

	if (!isVisible) {
		return null;
	}

	return (
		<>
			{/* Overlay */}
			<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

			{/* Cookie Banner */}
			<div className="fixed right-0 bottom-0 left-0 z-50 p-4 md:p-6">
				<Card className="mx-auto max-w-xl border-2 shadow-2xl">
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<Link className="inline-block" href="/">
									<Image
										alt="Bionk Logo"
										className="h-10 w-auto"
										height={24}
										priority
										src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
										width={24}
									/>
								</Link>
								<div>
									<CardTitle className="font-semibold text-lg">
										Privacidade e Cookies
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										Respeitamos sua privacidade
									</p>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground text-sm leading-relaxed">
							Usamos cookies e tecnologias similares para melhorar sua
							experiência, analisar o tráfego do site e personalizar conteúdo.
							Coletamos informações como tipo de dispositivo, localização
							aproximada, origem do tráfego e dados de navegação para fornecer
							nossos serviços e análises.{" "}
							<Link
								className="underline"
								href="/privacidade"
								rel="noopener noreferrer"
								target="_blank"
							>
								Saiba mais
							</Link>
						</p>

						<div className="flex flex-col gap-3 sm:flex-row-reverse">
							<BaseButton
								className="flex-1 bg-black text-white hover:bg-black/80"
								fullWidth
								onClick={handleAcceptAll}
							>
								Aceitar Todos
							</BaseButton>
							<BaseButton
								className="flex-1"
								fullWidth
								onClick={handleRejectAll}
								variant="outline"
							>
								Rejeitar Todos
							</BaseButton>
							<BaseButton
								className="flex-1 sm:flex-none"
								fullWidth
								onClick={() => setShowCustomization(true)}
								variant="link"
							>
								<Settings className="mr-2 h-4 w-4" />
								Personalizar
							</BaseButton>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Customization Modal */}
			<Dialog onOpenChange={setShowCustomization} open={showCustomization}>
				<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Personalizar Cookies
						</DialogTitle>
						<DialogDescription>
							Escolha quais tipos de cookies você deseja permitir. Cookies
							essenciais são necessários para o funcionamento do site.
						</DialogDescription>
					</DialogHeader>

					<Card className="bg-gray-50 dark:bg-gray-800">
						<CardContent className="space-y-4 p-4">
							{/* Essential Cookies */}
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center space-x-2">
									<Switch checked={true} disabled />
									<span className="font-medium text-sm">Essenciais</span>
									<Badge className="text-xs" variant="secondary">
										Obrigatório
									</Badge>
								</div>
								<div className="relative">
									<HelpCircle
										className="h-4 w-4 cursor-help text-gray-400"
										onClick={() =>
											setActiveTooltip(
												activeTooltip === "essential" ? null : "essential"
											)
										}
										onMouseEnter={() => setActiveTooltip("essential")}
										onMouseLeave={() => setActiveTooltip(null)}
									/>
									{activeTooltip === "essential" && (
										<div className="absolute right-0 bottom-6 z-10 w-64 rounded bg-black p-2 text-white text-xs">
											Autenticação, segurança, funcionamento básico
										</div>
									)}
								</div>
							</div>

							{/* Functional Cookies */}
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center space-x-2">
									<Switch
										checked={preferences.functional}
										onCheckedChange={(checked) =>
											updatePreference("functional", checked)
										}
									/>
									<span className="font-medium text-sm">Funcionais</span>
								</div>
								<div className="relative">
									<HelpCircle
										className="h-4 w-4 cursor-help text-gray-400"
										onClick={() =>
											setActiveTooltip(
												activeTooltip === "functional" ? null : "functional"
											)
										}
										onMouseEnter={() => setActiveTooltip("functional")}
										onMouseLeave={() => setActiveTooltip(null)}
									/>
									{activeTooltip === "functional" && (
										<div className="absolute right-0 bottom-6 z-10 w-64 rounded bg-black p-2 text-white text-xs">
											Preferências de tema, idioma, configurações de usuário
										</div>
									)}
								</div>
							</div>

							{/* Analytics Cookies */}
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center space-x-2">
									<Switch
										checked={preferences.analytics}
										onCheckedChange={(checked) =>
											updatePreference("analytics", checked)
										}
									/>
									<span className="font-medium text-sm">Analytics</span>
								</div>
								<div className="relative">
									<HelpCircle
										className="h-4 w-4 cursor-help text-gray-400"
										onClick={() =>
											setActiveTooltip(
												activeTooltip === "analytics" ? null : "analytics"
											)
										}
										onMouseEnter={() => setActiveTooltip("analytics")}
										onMouseLeave={() => setActiveTooltip(null)}
									/>
									{activeTooltip === "analytics" && (
										<div className="absolute right-0 bottom-6 z-10 w-64 rounded bg-black p-2 text-white text-xs">
											Visualizações de perfil, cliques, origem do tráfego, tipo
											de dispositivo, localização por país
										</div>
									)}
								</div>
							</div>

							{/* Marketing Cookies */}
							<div className="flex items-center justify-between py-2">
								<div className="flex items-center space-x-2">
									<Switch
										checked={preferences.marketing}
										onCheckedChange={(checked) =>
											updatePreference("marketing", checked)
										}
									/>
									<span className="font-medium text-sm">Marketing</span>
								</div>
								<div className="relative">
									<HelpCircle
										className="h-4 w-4 cursor-help text-gray-400"
										onClick={() =>
											setActiveTooltip(
												activeTooltip === "marketing" ? null : "marketing"
											)
										}
										onMouseEnter={() => setActiveTooltip("marketing")}
										onMouseLeave={() => setActiveTooltip(null)}
									/>
									{activeTooltip === "marketing" && (
										<div className="absolute right-0 bottom-6 z-10 w-64 rounded bg-black p-2 text-white text-xs">
											Personalização de conteúdo, publicidade direcionada
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex flex-col gap-3 pt-4 sm:flex-row">
						<BaseButton
							className="flex-1 bg-black text-white hover:bg-black/80"
							onClick={handleCustomSave}
						>
							Salvar Preferências
						</BaseButton>
						<BaseButton
							className="flex-1 sm:flex-none"
							onClick={() => setShowCustomization(false)}
							variant="outline"
						>
							Cancelar
						</BaseButton>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

"use client";

import Cookies from "js-cookie";
import { ArrowRight, Cookie, Flag, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

interface CookiePreferences {
	essential: boolean;
	analytics: boolean;
	functional: boolean;
	marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
	essential: true,
	analytics: false,
	functional: true,
	marketing: false,
};

interface BionkActionsModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	username?: string;
}

export default function BionkActionsModal({
	isOpen,
	onOpenChange,
	username,
}: BionkActionsModalProps) {
	const [showCookieSettings, setShowCookieSettings] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
	const [preferences, setPreferences] =
		useState<CookiePreferences>(defaultPreferences);

	const reportHref = `/reportar-violacao?ref=bionkactionsmodal&u=${encodeURIComponent(username || "")}`;

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		try {
			const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
			if (saved) {
				setPreferences(JSON.parse(saved));
			}
		} catch {}
	}, [isOpen]);

	const setCookie = (name: string, value: string, maxAge = 31_536_000) => {
		if (typeof window === "undefined") {
			return;
		}
		try {
			Cookies.set(name, value, {
				path: "/",
				// Convert seconds to an absolute Date for precision
				expires: new Date(Date.now() + maxAge * 1000),
				sameSite: "lax",
				secure: window.location.protocol === "https:",
			});
		} catch {
			// ignore
		}
	};

	const applyCookiePreferences = (prefs: CookiePreferences) => {
		setCookie("cookie-consent", "true");
		setCookie("cookie-analytics", prefs.analytics.toString());
		setCookie("cookie-functional", prefs.functional.toString());
		setCookie("cookie-marketing", prefs.marketing.toString());
		if (typeof window !== "undefined") {
			window.location.reload();
		}
	};

	const savePreferences = (prefs: CookiePreferences) => {
		localStorage.setItem(COOKIE_CONSENT_KEY, "true");
		localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
		setPreferences(prefs);
		applyCookiePreferences(prefs);
	};

	const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
		if (key === "essential") {
			return;
		}
		setPreferences((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={isOpen}>
			<DialogContent className="w-full max-w-[90vw] rounded-3xl border border-none bg-background p-6 shadow-xl sm:max-w-lg">
				<DialogHeader className="sr-only">
					<DialogTitle>Bionk</DialogTitle>
				</DialogHeader>

				{showCookieSettings ? (
					<div className="space-y-4 pt-5">
						<div className="space-y-3">
							<div className="flex items-center justify-between py-1">
								<div className="flex items-center gap-2">
									<Switch
										aria-label="Essenciais"
										checked={preferences.essential}
										disabled
									/>
									<span className="font-medium text-sm">Essenciais</span>
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

							<div className="flex items-center justify-between py-1">
								<div className="flex items-center gap-2">
									<Switch
										aria-label="Funcionais"
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
											Tema, idioma, configurações de usuário
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center justify-between py-1">
								<div className="flex items-center gap-2">
									<Switch
										aria-label="Analytics"
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
											Visualizações, cliques, origem do tráfego
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center justify-between py-1">
								<div className="flex items-center gap-2">
									<Switch
										aria-label="Marketing"
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
											Personalização de conteúdo e anúncios
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="flex flex-row gap-3 pt-4">
							<BaseButton
								className="flex-1 rounded-lg sm:flex-none"
								onClick={() => setShowCookieSettings(false)}
								variant="outline"
							>
								Voltar
							</BaseButton>
							<BaseButton
								className="flex-1 rounded-lg bg-black text-white hover:bg-black/80"
								onClick={() => savePreferences(preferences)}
							>
								Salvar Preferências
							</BaseButton>
						</div>
					</div>
				) : (
					<div>
						<div className="space-y-4 py-2">
							<div className="flex items-center gap-3">
								<Image
									alt="Bionk Logo"
									className="h-11 w-11 rounded-md"
									height={40}
									src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
									width={40}
								/>
								<div>
									<div className="font-bold text-2xl text-zinc-900">Bionk</div>
									<div className="text-green-700 text-sm">
										Sua bio, amplificada
									</div>
								</div>
							</div>

							<p className="text-base text-zinc-700">
								Transforme seus links em uma experiência única. Crie sua página
								em 60 segundos e compartilhe tudo que importa em um só lugar.
							</p>

							<Link className="my-6 block" href="/registro" prefetch={false}>
								<BaseButton className="w-full rounded-full bg-lime-400 text-black hover:bg-lime-500">
									<span className="flex items-center justify-center gap-2">
										Começar gratuitamente <ArrowRight className="h-4 w-4" />
									</span>
								</BaseButton>
							</Link>

							<div className="flex flex-wrap items-center justify-start gap-3 text-sm text-zinc-700">
								<Link
									className="flex items-center gap-1 hover:underline"
									href={reportHref}
									prefetch={false}
									rel="noopener noreferrer"
									target="_blank"
								>
									<Flag className="h-4 w-4" />
									Reportar Usuário
								</Link>
								<span className="text-zinc-400">•</span>
								<button
									className="flex items-center gap-1 hover:underline"
									onClick={() => setShowCookieSettings(true)}
									type="button"
								>
									<Cookie className="h-4 w-4" />
									Cookies
								</button>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

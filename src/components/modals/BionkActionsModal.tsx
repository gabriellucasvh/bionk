"use client";

import Cookies from "js-cookie";
import { ArrowRight, Cookie, Flag, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";
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

	// Swipe/bottom sheet state (mobile)
	const [isAnimating, setIsAnimating] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [isClosing, setIsClosing] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const startYRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);
	const dragYRef = useRef(0);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const sheetRef = useRef<HTMLDivElement | null>(null);
	const VELOCITY_CLOSE_THRESHOLD = 0.5; // px/ms
	const MIN_DELTA_FOR_SWIPE = 10; // px
	const getCloseDistanceThreshold = () => {
		const h =
			sheetRef.current?.offsetHeight || Math.round(window.innerHeight * 0.8);
		return Math.max(140, Math.round(h * 0.55));
	};

	useEffect(() => {
		if (isOpen) {
			setIsAnimating(true);
			setIsClosing(false);
		}
	}, [isOpen]);

	// Detectar viewport mobile para não montar o modal desktop no mobile
	useEffect(() => {
		const mq =
			typeof window !== "undefined"
				? window.matchMedia("(max-width: 639px)")
				: null;
		const update = () => setIsMobile(!!mq?.matches);
		update();
		mq?.addEventListener("change", update);
		return () => mq?.removeEventListener("change", update);
	}, []);

	// Bloquear scroll do body enquanto aberto/fechando no mobile
	useEffect(() => {
		if (isOpen || isClosing) {
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
			document.body.classList.add("bottom-sheet-open");
		} else {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.classList.remove("bottom-sheet-open");
		}
		return () => {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.classList.remove("bottom-sheet-open");
		};
	}, [isOpen, isClosing]);

	const handleClose = () => {
		setIsClosing(true);
		setIsAnimating(true);
		onOpenChange(false);
		window.setTimeout(() => {
			setIsClosing(false);
			setIsAnimating(false);
			setDragY(0);
			dragYRef.current = 0;
		}, 400);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		const contentEl = contentRef.current;
		const target = e.target as Node;
		if (contentEl && contentEl.contains(target) && contentEl.scrollTop > 0) {
			return;
		}
		startYRef.current = e.clientY;
		startTimeRef.current = performance.now();
		setIsDragging(true);

		const onMouseMove = (ev: MouseEvent) => {
			if (startYRef.current !== null) {
				const delta = ev.clientY - startYRef.current;
				const clamped = Math.max(0, delta);
				setDragY(clamped);
				dragYRef.current = clamped;

				const now = performance.now();
				const duration = startTimeRef.current ? now - startTimeRef.current : 0;
				const velocity = duration > 0 ? clamped / duration : 0;
				// Fecha durante o arrasto apenas por velocidade (gesto rápido)
				if (
					clamped >= MIN_DELTA_FOR_SWIPE &&
					velocity >= VELOCITY_CLOSE_THRESHOLD
				) {
					document.removeEventListener("mousemove", onMouseMove);
					document.removeEventListener("mouseup", onMouseUp);
					setIsDragging(false);
					startYRef.current = null;
					startTimeRef.current = null;
					handleClose();
				}
			}
		};

		const onMouseUp = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
			setIsDragging(false);

			const endTime = performance.now();
			const duration = startTimeRef.current
				? endTime - startTimeRef.current
				: 0;
			const delta = dragYRef.current;
			const velocity = duration > 0 ? delta / duration : 0;
			// Fecha ao soltar se distância for grande o suficiente ou por velocidade de swipe
			if (
				delta >= getCloseDistanceThreshold() ||
				(delta >= MIN_DELTA_FOR_SWIPE && velocity >= VELOCITY_CLOSE_THRESHOLD)
			) {
				handleClose();
			} else {
				setDragY(0);
				dragYRef.current = 0;
			}
			startYRef.current = null;
			startTimeRef.current = null;
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	const onTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		const contentEl = contentRef.current;
		const target = e.target as Node;
		const touchingContent = !!contentEl && contentEl.contains(target);
		if (touchingContent && contentEl && contentEl.scrollTop > 0) {
			return;
		}
		startYRef.current = touch.clientY;
		startTimeRef.current = performance.now();
		setIsDragging(true);

		const onTouchMove = (ev: TouchEvent) => {
			if (startYRef.current !== null && ev.touches[0]) {
				const delta = ev.touches[0].clientY - startYRef.current;
				const clamped = Math.max(0, delta);
				setDragY(clamped);
				dragYRef.current = clamped;
				ev.preventDefault();

				const now = performance.now();
				const duration = startTimeRef.current ? now - startTimeRef.current : 0;
				const velocity = duration > 0 ? clamped / duration : 0;
				// Fecha durante o arrasto apenas por velocidade (gesto rápido)
				if (
					clamped >= MIN_DELTA_FOR_SWIPE &&
					velocity >= VELOCITY_CLOSE_THRESHOLD
				) {
					document.removeEventListener("touchmove", onTouchMove, {
						passive: false,
					} as any);
					document.removeEventListener("touchend", onTouchEnd);
					setIsDragging(false);
					startYRef.current = null;
					startTimeRef.current = null;
					handleClose();
				}
			}
		};

		const onTouchEnd = () => {
			document.removeEventListener("touchmove", onTouchMove, {
				passive: false,
			} as any);
			document.removeEventListener("touchend", onTouchEnd);
			setIsDragging(false);

			const endTime = performance.now();
			const duration = startTimeRef.current
				? endTime - startTimeRef.current
				: 0;
			const delta = dragYRef.current;
			const velocity = duration > 0 ? delta / duration : 0;
			// Fecha ao soltar se distância for grande o suficiente ou por velocidade de swipe
			if (
				delta >= getCloseDistanceThreshold() ||
				(delta >= MIN_DELTA_FOR_SWIPE && velocity >= VELOCITY_CLOSE_THRESHOLD)
			) {
				handleClose();
			} else {
				setDragY(0);
				dragYRef.current = 0;
			}
			startYRef.current = null;
			startTimeRef.current = null;
		};

		document.addEventListener("touchmove", onTouchMove, {
			passive: false,
		} as any);
		document.addEventListener("touchend", onTouchEnd);
	};

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
		<>
			{/* Desktop modal (hidden on mobile) */}
			{!isMobile && (
				<div className="hidden sm:block">
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
															activeTooltip === "functional"
																? null
																: "functional"
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
												<div className="font-bold text-2xl text-zinc-900">
													Bionk
												</div>
												<div className="text-green-700 text-sm">
													Sua bio, amplificada
												</div>
											</div>
										</div>
										<p className="text-base text-zinc-700">
											Transforme seus links em uma experiência única. Crie sua
											página em 60 segundos e compartilhe tudo que importa em um
											só lugar.
										</p>
										<Link
											className="my-6 block"
											href="/registro"
											prefetch={false}
										>
											<BaseButton className="w-full rounded-full bg-lime-400 text-black hover:bg-lime-500">
												<span className="flex items-center justify-center gap-2">
													Começar gratuitamente{" "}
													<ArrowRight className="h-4 w-4" />
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
				</div>
			)}

			{/* Mobile bottom sheet */}
			{isMobile && (isOpen || isClosing) && (
				<div
					className="fixed inset-0 z-[60] sm:hidden"
					style={{ margin: 0, padding: 0 }}
				>
					<div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm"
						onClick={handleClose}
						onTouchMove={(e) => e.preventDefault()}
						onTouchStart={(e) => e.preventDefault()}
						role="none"
						style={{ touchAction: "none" }}
					/>
					<div
						className="absolute right-0 left-0 w-full bg-zinc-100 shadow-2xl dark:bg-zinc-800"
						onMouseDown={onMouseDown}
						onTouchStart={onTouchStart}
						ref={sheetRef}
						role="none"
						style={{
							bottom: "-1px",
							borderTopLeftRadius: "24px",
							borderTopRightRadius: "24px",
							transform: `translateY(${isDragging ? `${dragY}px` : isClosing ? "calc(100% + 30px)" : isAnimating ? "0px" : "calc(100% + 30px)"})`,
							transition: isDragging
								? "none"
								: "transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
							touchAction: "none",
							userSelect: "none",
							margin: "0px",
							padding: "0px",
							boxSizing: "border-box",
							willChange: "transform",
						}}
					>
						<div
							className="flex h-6 w-full cursor-grab items-center justify-center rounded-t-3xl active:cursor-grabbing"
							role="none"
							style={{ touchAction: "none" }}
						>
							<div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
						</div>
						<div
							className="h-[50vh] overflow-y-auto px-6"
							ref={contentRef}
							style={{
								touchAction: "pan-y",
								WebkitOverflowScrolling: "touch",
								overscrollBehavior: "contain",
								paddingBottom: "env(safe-area-inset-bottom, 0px)",
							}}
						>
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
															activeTooltip === "functional"
																? null
																: "functional"
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
												<div className="font-bold text-2xl text-zinc-900">
													Bionk
												</div>
												<div className="text-green-700 text-sm">
													Sua bio, amplificada
												</div>
											</div>
										</div>
										<p className="text-base text-zinc-700">
											Transforme seus links em uma experiência única. Crie sua
											página em 60 segundos e compartilhe tudo que importa em um
											só lugar.
										</p>
										<Link
											className="my-6 block"
											href="/registro"
											prefetch={false}
										>
											<BaseButton className="w-full rounded-full bg-lime-400 text-black hover:bg-lime-500">
												<span className="flex items-center justify-center gap-2">
													Começar gratuitamente{" "}
													<ArrowRight className="h-4 w-4" />
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
						</div>
					</div>
				</div>
			)}
		</>
	);
}

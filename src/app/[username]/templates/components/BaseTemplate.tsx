"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FONT_OPTIONS } from "@/app/(private)/studio/design/constants/design.constants";
import CookieConsent from "@/components/CookieConsent";
import BionkActionsModal from "@/components/modals/BionkActionsModal";
import JoinBionkModal from "@/components/modals/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import type { TemplateComponentProps } from "@/types/user-profile";
import { getTemplatePreset } from "@/utils/templatePresets";
import FixedBackground from "./FixedBackground";
import LinksList from "./LinksList";
import ShareModal from "./ShareModal";
import UserHeader from "./UserHeader";

function getFontFamily(customFont: string): string {
	const fontOption = FONT_OPTIONS.find((option) => option.value === customFont);
	return fontOption ? fontOption.fontFamily : "var(--font-sans)";
}

interface BaseTemplateProps extends TemplateComponentProps {
	children?: React.ReactNode;
}

export default function BaseTemplate({ user, children }: BaseTemplateProps) {
	const [isShareModalOpen, setShareModalOpen] = useState(false);
	const [isActionsModalOpen, setActionsModalOpen] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Remove o rounded-t-3xl somente após o scroll atingir o valor do raio
	useEffect(() => {
		const el = wrapperRef.current;
		let radius = 24;
		if (el) {
			const cs = getComputedStyle(el);
			const r = Number.parseFloat(cs.borderTopLeftRadius || "24");
			if (!Number.isNaN(r) && r > 0) {
				radius = r;
			}
		}
		const onScroll = () => {
			const y = window.scrollY || 0;
			setHasScrolled(y >= radius);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const templateId = user.template || "default";
	const templatePreset = getTemplatePreset(templateId);
	const customPresets = user.CustomPresets || templatePreset;

	const hasBackgroundMedia =
		customPresets?.customBackgroundMediaType === "image" ||
		customPresets?.customBackgroundMediaType === "video";

	const wrapperStyle: React.CSSProperties = {
		// Prioriza cor sólida quando ambas existem
		...(hasBackgroundMedia
			? {}
			: customPresets.customBackgroundColor
				? { backgroundColor: customPresets.customBackgroundColor }
				: customPresets.customBackgroundGradient
					? {
							backgroundImage: customPresets.customBackgroundGradient,
							backgroundColor: "transparent",
						}
					: {}),
		...(customPresets.customFont && {
			fontFamily: getFontFamily(customPresets.customFont),
		}),
	};

	const textStyle: React.CSSProperties = {
		...(customPresets.customTextColor && {
			color: customPresets.customTextColor,
		}),
	};

	const getButtonStyleByType = () => {
		const cornerValue = customPresets.customButtonCorners || "12";
		const borderRadiusValue = `${cornerValue}px`;
		const buttonColor = customPresets.customButtonColor || "#ffffff";
		const textColor = customPresets.customButtonTextColor || "#000000";

		const baseStyle: React.CSSProperties = {
			borderRadius: borderRadiusValue,
		};

		// Aplicar estilos baseados no customButtonStyle (estilo selecionado)
		switch (customPresets.customButtonStyle) {
			case "solid":
				return {
					...baseStyle,
					backgroundColor: buttonColor,
					border: "none",
					color: textColor,
				};
			case "outline":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px solid ${buttonColor}`,
					color: textColor,
				};
			case "soft":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}20`,
					border: `1px solid ${buttonColor}40`,
					color: textColor,
				};
			case "shadow":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}30`,
					border: `1px solid ${buttonColor}50`,
					color: textColor,
					boxShadow:
						"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				};
			case "neon":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px solid ${buttonColor}`,
					color: textColor,
					boxShadow: `0 0 8px ${buttonColor}40`,
				};
			case "dashed":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px dashed ${buttonColor}`,
					color: textColor,
				};
			case "double":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `4px double ${buttonColor}`,
					color: textColor,
				};
			case "raised":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}40`,
					borderTop: `2px solid ${buttonColor}`,
					borderLeft: `2px solid ${buttonColor}`,
					borderRight: `1px solid ${buttonColor}80`,
					borderBottom: `1px solid ${buttonColor}80`,
					color: textColor,
					boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
				};
			case "inset":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}40`,
					borderBottom: `2px solid ${buttonColor}`,
					borderRight: `2px solid ${buttonColor}`,
					borderTop: `1px solid ${buttonColor}80`,
					borderLeft: `1px solid ${buttonColor}80`,
					color: textColor,
					boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.2)",
				};
			default:
				// Fallback para o comportamento antigo se customButtonStyle não for um estilo válido
				switch (customPresets.customButtonFill) {
					case "filled":
						return {
							...baseStyle,
							backgroundColor: buttonColor,
							border: "none",
							color: textColor,
						};
					case "outlined":
						return {
							...baseStyle,
							backgroundColor: "transparent",
							border: "2px solid currentColor",
							color: textColor,
						};
					case "gradient":
						return {
							...baseStyle,
							backgroundColor: "transparent",
							backgroundImage:
								customPresets.customBackgroundGradient ||
								"linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)",
							border: "none",
							color: textColor,
						};
					default:
						return {
							...baseStyle,
							backgroundColor: buttonColor,
							border: "none",
							color: textColor,
						};
				}
		}
	};

	const buttonStyle = getButtonStyleByType();

	const shouldUseBlurredBackground =
		customPresets?.customBlurredBackground !== false &&
		user.image &&
		!user.image.includes("default_xry2zk");

	return (
		<>
			{/* Container principal com aspect ratio de celular em telas maiores */}
			<div
				className={`relative min-h-dvh sm:flex sm:items-start sm:justify-center sm:pt-4 ${
					shouldUseBlurredBackground ? "" : "bg-zinc-900"
				}`}
				style={{
					backgroundColor: shouldUseBlurredBackground ? "#1a1a1a" : undefined,
					backgroundImage: shouldUseBlurredBackground
						? `url(${user.image})`
						: undefined,
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					backgroundAttachment: "fixed",
				}}
			>
				{shouldUseBlurredBackground && (
					<div className="absolute inset-0 bg-black/80 backdrop-blur-[100px]" />
				)}
				<div
					className={`relative z-10 min-h-dvh w-full sm:min-h-[calc(100vh-2rem)] sm:w-[575px] sm:overflow-hidden ${hasScrolled ? "sm:rounded-t-none" : "sm:rounded-t-3xl"} sm:shadow-2xl sm:shadow-black/20 sm:transition-all sm:duration-200 sm:ease-out ${
						customPresets.headerStyle === "hero" ? "px-4" : "px-4"
					} ${customPresets.headerStyle !== "hero" ? "sm:px-6 sm:pt-4" : ""}`}
					ref={wrapperRef}
					style={wrapperStyle}
				>
					<FixedBackground customPresets={customPresets} />
					<ProfileViewTracker userId={user.id} />

					{/* Top-right actions */}
					<div className="absolute top-4 right-4 z-50 flex items-center gap-2 sm:top-6 sm:right-6">
						<button
							aria-label="Opções do Bionk"
							className="flex items-center justify-center rounded-full border border-white/20 bg-white/80 p-2 shadow shadow-black/10 backdrop-blur-md transition-colors hover:bg-white/90"
							onClick={() => setActionsModalOpen(true)}
							type="button"
						>
							<Image
								alt="Bionk"
								height={18}
								src="/icons/b-icon.svg"
								width={18}
							/>
						</button>
						<button
							aria-label="Compartilhar perfil"
							className="flex items-center justify-center rounded-full border border-white/20 bg-white/80 p-2 shadow shadow-black/10 backdrop-blur-md transition-colors hover:bg-white/90"
							onClick={() => setShareModalOpen(true)}
							type="button"
						>
							<SquareArrowOutUpRight
								className="size-4.5 text-black"
								strokeWidth={1.5}
							/>
						</button>
					</div>

					{/* Renderizar header hero fora do container com padding */}
					{customPresets.headerStyle === "hero" && (
						<div className="relative z-10">
							<UserHeader
								customPresets={customPresets}
								headerStyle={customPresets.headerStyle}
								textStyle={textStyle}
								user={user}
							/>
						</div>
					)}

					<div
						className={`relative z-10 flex min-h-dvh flex-col sm:min-h-[calc(100vh-2rem)] ${customPresets.headerStyle === "hero" ? "px-4 sm:px-6" : ""}`}
					>
						<main
							className={`mx-auto flex w-full max-w-md flex-1 flex-col items-center sm:max-w-none ${
								customPresets.headerStyle === "hero" ? "pt-0" : "pt-4"
							}`}
						>
							{/* Renderizar header padrão/horizontal dentro do container com padding */}
							{customPresets.headerStyle !== "hero" && (
								<UserHeader
									customPresets={customPresets}
									headerStyle={customPresets.headerStyle}
									textStyle={textStyle}
									user={user}
								/>
							)}
							<section className="w-full">
								{children ?? (
									<LinksList
										buttonStyle={buttonStyle}
										customPresets={customPresets}
										hasScrolled={hasScrolled}
										textStyle={textStyle}
										user={user}
									/>
								)}
							</section>
						</main>
						<footer
							className="mt-auto flex justify-center pt-4 pb-4"
							style={textStyle}
						>
							<JoinBionkModal>{user.username}</JoinBionkModal>
						</footer>
					</div>
				</div>
			</div>

			<ShareModal
				isOpen={isShareModalOpen}
				onOpenChange={setShareModalOpen}
				user={user}
			/>
			<BionkActionsModal
				isOpen={isActionsModalOpen}
				onOpenChange={setActionsModalOpen}
				username={user.username}
			/>
			<CookieConsent userId={user.id} />
		</>
	);
}

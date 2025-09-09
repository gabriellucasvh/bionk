"use client";

import { Eye, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FC, MouseEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import LinkOptionsModal from "@/components/modals/LinkOptionsModal";
import type { UserLink } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";

interface InteractiveLinkProps {
	href: string;
	link: UserLink;
	children: ReactNode;
	sensitive?: boolean;
	className?: string;
	style?: React.CSSProperties;
	borderRadius?: number;
}

// Função auxiliar para extrair o favicon da URL
const getFaviconUrl = (url: string) => {
	try {
		const urlObj = new URL(url);
		return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
	} catch {
		return null;
	}
};

// Função auxiliar para determinar a URL da imagem
const getImageUrl = (
	link: UserLink,
	customImageError: boolean,
	faviconUrl: string | null
) => {
	return link.customImageUrl && !customImageError
		? link.customImageUrl
		: faviconUrl;
};

// Função auxiliar para verificar se deve mostrar a imagem
const shouldShowImage = (
	imageUrl: string | null,
	link: UserLink,
	customImageError: boolean,
	faviconError: boolean
) => {
	return imageUrl && (link.customImageUrl ? !customImageError : !faviconError);
};

// Função auxiliar para verificar se é GIF
const isGifImage = (imageUrl: string | null): boolean => {
	return imageUrl?.toLowerCase().includes(".gif") ?? false;
};

// Componente auxiliar para renderizar imagem
interface ImageComponentProps {
	link: UserLink;
	imageUrl: string | null;
	isGif: boolean;
	borderRadius: number;
	setCustomImageError: (error: boolean) => void;
	setFaviconError: (error: boolean) => void;
}

const ImageComponent: FC<ImageComponentProps> = ({
	link,
	imageUrl,
	borderRadius,
	setCustomImageError,
	setFaviconError,
}) => {
	const handleImageError = () => {
		if (link.customImageUrl) {
			setCustomImageError(true);
		} else {
			setFaviconError(true);
		}
	};

	const imageProps = {
		alt: link.customImageUrl
			? `Ícone personalizado de ${link.title}`
			: `Favicon de ${link.title}`,
		className: "ml-1 size-10 object-cover",
		height: 32,
		onError: handleImageError,
		src: imageUrl || "",
		style: { borderRadius: `${borderRadius}px` },
		width: 32,
	};

	return (
		<div className="-translate-y-1/2 absolute top-1/2 left-2 z-20">
			<Image {...imageProps} />
		</div>
	);
};

// Componente auxiliar para overlay de conteúdo sensível
interface SensitiveOverlayProps {
	isTouch: boolean;
	unblurred: boolean;
}

const SensitiveOverlay: FC<SensitiveOverlayProps> = ({
	isTouch,
	unblurred,
}) => {
	const getOverlayClasses = () => {
		const baseClasses =
			"absolute inset-0 rounded-lg bg-black/20 backdrop-blur-md transition-all duration-300";
		const hoverClasses = isTouch
			? ""
			: "group-hover:bg-transparent group-hover:backdrop-blur-none";
		const touchClasses =
			isTouch && unblurred ? "bg-transparent backdrop-blur-none" : "";
		return twMerge(baseClasses, hoverClasses, touchClasses);
	};

	const getTextClasses = () => {
		const baseClasses =
			"z-30 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1 font-semibold text-sm text-white transition-opacity duration-300";
		const hoverClasses = isTouch ? "" : "group-hover:opacity-0";
		const touchClasses = isTouch && unblurred ? "opacity-0" : "";
		return twMerge(baseClasses, hoverClasses, touchClasses);
	};

	return (
		<div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-all duration-300">
			<div className={getOverlayClasses()} />
			<span className={getTextClasses()}>
				<Eye size={16} />
				Conteúdo sensível
			</span>
		</div>
	);
};

const InteractiveLink: FC<InteractiveLinkProps> = ({
	href,
	link,
	children,
	sensitive,
	className = "",
	style = {},
	borderRadius = 0,
}) => {
	const [unblurred, setUnblurred] = useState(false);
	const [isTouch, setIsTouch] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [faviconError, setFaviconError] = useState(false);
	const [customImageError, setCustomImageError] = useState(false);

	const faviconUrl = getFaviconUrl(link.url);
	const imageUrl = getImageUrl(link, customImageError, faviconUrl);
	const showImage = shouldShowImage(
		imageUrl,
		link,
		customImageError,
		faviconError
	);
	const isGif = isGifImage(imageUrl);

	useEffect(() => {
		const handleTouchStart = () => setIsTouch(true);
		window.addEventListener("touchstart", handleTouchStart, { once: true });
		return () => window.removeEventListener("touchstart", handleTouchStart);
	}, []);

	// Função auxiliar para lidar com clique sensível
	const handleSensitiveClick = (e: MouseEvent) => {
		e.preventDefault();
		setUnblurred(true);
	};

	// Função auxiliar para enviar dados de clique
	const sendClickData = () => {
		const url = "/api/link-click";
		const trafficSource = detectTrafficSource();
		const data = JSON.stringify({
			linkId: link.id,
			trafficSource,
		});

		if (navigator.sendBeacon) {
			navigator.sendBeacon(url, data);
		} else {
			fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: data,
				keepalive: true,
			});
		}
	};

	const handleLinkClick = (e: MouseEvent) => {
		if (sensitive && isTouch && !unblurred) {
			return handleSensitiveClick(e);
		}

		sendClickData();
	};

	const handleOptionsClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsModalOpen(true);
	};

	return (
		<>
			<div
				className={twMerge(
					"group relative w-full rounded-xl shadow-md",
					className
				)}
				style={style}
			>
				{/* Imagem personalizada ou favicon do site na borda esquerda */}
				{showImage && (
					<ImageComponent
						borderRadius={borderRadius}
						imageUrl={imageUrl}
						isGif={isGif}
						link={link}
						setCustomImageError={setCustomImageError}
						setFaviconError={setFaviconError}
					/>
				)}

				<Link
					aria-label={link.title}
					className={twMerge("z-10 w-full")}
					href={href}
					onClick={handleLinkClick}
					rel="noopener noreferrer"
					target="_blank"
				>
					{children}
				</Link>

				<button
					aria-label="Mais opções"
					className="-translate-y-1/2 absolute top-1/2 right-2 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
					onClick={handleOptionsClick}
					type="button"
				>
					<MoreVertical className="size-5" />
				</button>

				{sensitive && (
					<SensitiveOverlay isTouch={isTouch} unblurred={unblurred} />
				)}
			</div>

			<LinkOptionsModal
				link={isModalOpen ? link : null}
				onOpenChange={setIsModalOpen}
			/>
		</>
	);
};

export default InteractiveLink;

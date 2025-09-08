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
}

const InteractiveLink: FC<InteractiveLinkProps> = ({
	href,
	link,
	children,
	sensitive,
	className = "",
	style = {},
}) => {
	const [unblurred, setUnblurred] = useState(false);
	const [isTouch, setIsTouch] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [faviconError, setFaviconError] = useState(false);

	// Função para extrair o favicon da URL
	const getFaviconUrl = (url: string) => {
		try {
			const urlObj = new URL(url);
			return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
		} catch {
			return null;
		}
	};

	const faviconUrl = getFaviconUrl(link.url);

	useEffect(() => {
		const handleTouchStart = () => setIsTouch(true);
		window.addEventListener("touchstart", handleTouchStart, { once: true });
		return () => window.removeEventListener("touchstart", handleTouchStart);
	}, []);

	const handleLinkClick = (e: MouseEvent) => {
		if (sensitive && isTouch && !unblurred) {
			e.preventDefault();
			setUnblurred(true);
			return;
		}

		const url = "/api/link-click";
		const trafficSource = detectTrafficSource();
		const data = JSON.stringify({
			linkId: link.id,
			trafficSource, // Incluir a origem detectada
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
				{/* Favicon do site na borda esquerda */}
				{faviconUrl && !faviconError && (
					<div className="-translate-y-1/2 absolute top-1/2 left-2 z-20">
						<Image
							alt={`Favicon de ${link.title}`}
							className="ml-3 size-6 rounded-sm"
							height={32}
							onError={() => setFaviconError(true)}
							src={faviconUrl}
							width={32}
						/>
					</div>
				)}

				<Link
					aria-label={link.title}
					className={twMerge("z-10 w-full", faviconUrl)}
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
					<div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-all duration-300">
						<div
							className={twMerge(
								"absolute inset-0 rounded-lg bg-black/20 backdrop-blur-md transition-all duration-300",
								(!isTouch &&
									"group-hover:bg-transparent group-hover:backdrop-blur-none") ||
									(isTouch && unblurred && "bg-transparent backdrop-blur-none")
							)}
						/>
						<span
							className={twMerge(
								"z-30 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1 font-semibold text-sm text-white transition-opacity duration-300",
								(!isTouch && "group-hover:opacity-0") ||
									(isTouch && unblurred && "opacity-0")
							)}
						>
							<Eye size={16} />
							Conteúdo sensível
						</span>
					</div>
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

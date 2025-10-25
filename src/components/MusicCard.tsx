"use client";

import { MoreVertical } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import LinkOptionsModal from "@/components/modals/LinkOptionsModal";
import { cn } from "@/lib/utils";
import type { UserLink } from "@/types/user-profile";
import { ensureHttps, getCanonicalUrl, getEmbedUrl } from "@/utils/music";

interface MusicCardProps {
	id: number;
	title?: string;
	url: string;
	usePreview?: boolean;
	authorName?: string;
	thumbnailUrl?: string;
	className?: string;
	customPresets?: {
		customBackgroundColor?: string;
		customBackgroundGradient?: string;
		customTextColor?: string;
		customFont?: string;
		customButton?: string;
		customButtonFill?: string;
		customButtonCorners?: string;
		customButtonColor?: string;
		customButtonTextColor?: string;
	};
	buttonStyle?: React.CSSProperties;
}

export default function MusicCard({
	id,
	title,
	authorName,
	thumbnailUrl,
	url,
	usePreview = true,
	className = "",
	customPresets,
	buttonStyle,
}: MusicCardProps) {
	const [optionsOpen, setOptionsOpen] = React.useState(false);

	const cornerValue = customPresets?.customButtonCorners || "12";
	const textColorStyle = customPresets?.customTextColor
		? { color: customPresets.customTextColor }
		: {};
	const buttonTextColorStyle = customPresets?.customButtonTextColor
		? { color: customPresets.customButtonTextColor }
		: {};

	if (usePreview) {
		const embedUrl = getEmbedUrl(url);
		const isAudiomack = (url || "").toLowerCase().includes("audiomack.com");
		const iframeHeight = isAudiomack ? 252 : 152;
		return (
			<div className={cn("w-full space-y-2 pb-2", className)}>
				{title && (
					<h3
						className={cn("text-center font-extrabold text-lg")}
						style={textColorStyle}
					>
						{title.length > 64 ? `${title.slice(0, 64)}...` : title}
					</h3>
				)}
				<div className="flex justify-center">
					<iframe
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						height={iframeHeight}
						scrolling={isAudiomack ? "no" : undefined}
						src={embedUrl}
						style={{
							borderRadius: `${cornerValue}px`,
							width: "100%",
							border: 0,
						}}
						title={`music-${id}`}
					/>
				</div>
			</div>
		);
	}

	// Modo link direto: botão como um link normal com imagem à esquerda,
	// duas linhas centralizadas (título e autor) e ícone de compartilhar à direita.
	const displayTitle = (title || "").toString();
	const displayAuthor = (authorName || "").toString();
	const thumbnail = thumbnailUrl || "";

	// Link simplificado para o modal de opções
	const linkForModal = {
		id,
		title: displayTitle,
		url: ensureHttps(url),
	} as unknown as UserLink;

	return (
		<div className={cn("w-full", className)}>
			<div
				className={cn(
					"group relative w-full overflow-hidden rounded-xl p-1 shadow-md transition-all duration-200 hover:brightness-110"
				)}
				style={buttonStyle}
			>
				<a
					className="relative z-10 flex h-full w-full items-center"
					href={getCanonicalUrl(url)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{/* Imagem à esquerda */}
					<div className="flex-shrink-0">
						{thumbnail ? (
							<Image
								alt={displayTitle || "Música"}
								className="ml-1 size-13 object-cover"
								height={32}
								src={thumbnail}
								style={{ borderRadius: "12px" }}
								width={32}
							/>
						) : (
							<div className="ml-1 size-13" />
						)}
					</div>

					{/* Texto central (título e autor) */}
					<div
						className="flex flex-1 justify-center"
						style={buttonTextColorStyle}
					>
						<div className="min-w-0 text-center">
							<span className="line-clamp-1 w-full font-semibold text-sm">
								{displayTitle.length > 64
									? `${displayTitle.slice(0, 64)}...`
									: displayTitle}
							</span>
							{displayAuthor && (
								<span className="line-clamp-1 w-full text-muted-foreground text-xs">
									{displayAuthor.length > 64
										? `${displayAuthor.slice(0, 64)}...`
										: displayAuthor}
								</span>
							)}
						</div>
					</div>

					{/* Espaço reservado para o botão de opções */}
					<div className="w-10 flex-shrink-0" />
				</a>

				<button
					aria-label="Opções"
					className="-translate-y-1/2 dark:hover:bg.white/10 absolute top-[50%] right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setOptionsOpen(true);
					}}
					type="button"
				>
					<MoreVertical className="size-5" style={buttonTextColorStyle} />
				</button>
				{/* Modal de opções */}
				{optionsOpen && (
					<LinkOptionsModal
						link={linkForModal}
						onOpenChange={(open) => setOptionsOpen(open)}
					/>
				)}
			</div>
		</div>
	);
}

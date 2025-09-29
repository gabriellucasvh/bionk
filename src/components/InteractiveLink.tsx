"use client";

import { MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FC, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import LinkOptionsModal from "@/components/modals/LinkOptionsModal";
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
import type { UserLink } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";

interface InteractiveLinkProps {
	href: string;
	link: UserLink;
	children: ReactNode;
	className?: string;
	style?: React.CSSProperties;
	borderRadius?: number;
	customPresets?: {
		customButtonCorners?: string;
	};
}

// Função auxiliar para verificar se deve mostrar a imagem personalizada
const shouldShowImage = (
	link: UserLink,
	customImageError: boolean
) => {
	return link.customImageUrl && !customImageError;
};

// Componente auxiliar para renderizar imagem personalizada
interface ImageComponentProps {
	link: UserLink;
	borderRadius: number;
	setCustomImageError: (error: boolean) => void;
}

const ImageComponent: FC<ImageComponentProps> = ({
	link,
	borderRadius,
	setCustomImageError,
}) => {
	const handleImageError = () => {
		setCustomImageError(true);
	};

	const imageProps = {
		alt: `Ícone personalizado de ${link.title}`,
		className: "ml-1 size-13 object-cover",
		height: 32,
		onError: handleImageError,
		src: link.customImageUrl || "",
		style: { borderRadius: `${borderRadius}px` },
		width: 32,
	};

	return <Image {...imageProps} />;
};

const InteractiveLink: FC<InteractiveLinkProps> = ({
	href,
	link,
	children,
	className = "",
	style = {},
	borderRadius = 0,
	customPresets,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [customImageError, setCustomImageError] = useState(false);
	const { animatedLinks } = useLinkAnimation();
	const isAnimated = animatedLinks.has(link.id.toString());

	// Calcular o borderRadius baseado no customButtonCorners ou usar padrão
	const imageBorderRadius = customPresets?.customButtonCorners
		? Number(customPresets.customButtonCorners)
		: borderRadius || 12; // 12px é o padrão do rounded-xl

	const showImage = shouldShowImage(link, customImageError);

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

	const handleLinkClick = () => {
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
					isAnimated ? "animate-shake" : "",
					className
				)}
				style={style}
			>
				<Link
					aria-label={link.title}
					className="relative z-10 flex h-full w-full items-center"
					href={href}
					onClick={handleLinkClick}
					rel="noopener noreferrer"
					target="_blank"
				>
					{/* Espaço reservado para imagem personalizada na borda esquerda */}
					<div className="flex-shrink-0">
						{showImage ? (
							<ImageComponent
								borderRadius={imageBorderRadius}
								link={link}
								setCustomImageError={setCustomImageError}
							/>
						) : (
							<div className="ml-1 size-13" />
						)}
					</div>

					<div className="flex flex-1 justify-center">{children}</div>

					{/* Espaço reservado para o botão de opções */}
					<div className="w-10 flex-shrink-0" />
				</Link>

				<button
					aria-label="Mais opções"
					className="-translate-y-1/2 absolute top-1/2 right-2 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
					onClick={handleOptionsClick}
					type="button"
				>
					<MoreVertical className="size-5" />
				</button>
			</div>

			<LinkOptionsModal
				link={isModalOpen ? link : null}
				onOpenChange={setIsModalOpen}
			/>
		</>
	);
};

export default InteractiveLink;

// src/components/ShareSheet.tsx

"use client";

import {
	Check,
	ChevronLeft,
	ChevronRight,
	Link,
	MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SHARING_PLATFORMS } from "@/config/sharing-platforms";
import { cn } from "@/lib/utils";

interface ShareSheetProps {
	url: string;
	title: string;
}

const ShareSheet = ({ url, title }: ShareSheetProps) => {
	const [copied, setCopied] = useState(false);
	const scrollRef = useRef<HTMLUListElement>(null);
	const [scrollState, setScrollState] = useState({
		canScrollLeft: false,
		canScrollRight: false,
	});

	useEffect(() => {
		const listElement = scrollRef.current;

		const checkScrollability = () => {
			if (!listElement) {
				return;
			}

			// Verifica se o conteúdo é maior que a área visível
			const hasOverflow = listElement.scrollWidth > listElement.clientWidth;
			// Verifica a posição do scroll
			const isAtStart = listElement.scrollLeft === 0;
			const isAtEnd =
				Math.ceil(listElement.scrollLeft + listElement.clientWidth) >=
				listElement.scrollWidth;

			setScrollState({
				canScrollLeft: hasOverflow && !isAtStart,
				canScrollRight: hasOverflow && !isAtEnd,
			});
		};

		// Verificação inicial
		checkScrollability();

		// Adiciona listeners para o scroll e para o redimensionamento da janela
		listElement?.addEventListener("scroll", checkScrollability);
		window.addEventListener("resize", checkScrollability);

		return () => {
			listElement?.removeEventListener("scroll", checkScrollability);
			window.removeEventListener("resize", checkScrollability);
		};
	}, []); // O array vazio assegura que este efeito corre apenas uma vez (montagem/desmontagem)

	const handleScroll = (direction: "left" | "right") => {
		if (!scrollRef.current) {
			return;
		}
		const { current: list } = scrollRef;
		// Calcula o valor do scroll (75% da largura visível)
		const scrollAmount = list.clientWidth * 0.75;

		list.scrollBy({
			left: direction === "right" ? scrollAmount : -scrollAmount,
			behavior: "smooth", // Efeito de scroll suave
		});
	};

	const handleCopyLink = () => {
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const handleNativeShare = () => {
		if (navigator.share) {
			navigator.share({ title, url });
		} else {
			handleCopyLink();
		}
	};

	const handleSocialShare = (platformKey: string) => {
		const platform = SHARING_PLATFORMS.find((p) => p.key === platformKey);
		if (!platform) {
			return;
		}
		const encodedUrl = encodeURIComponent(url);
		const encodedTitle = encodeURIComponent(title);
		const shareUrl = platform.urlTemplate
			.replace("{url}", encodedUrl)
			.replace("{title}", encodedTitle);
		window.open(shareUrl, "_blank", "noopener,noreferrer");
	};

	const copyButton = {
		key: "copy",
		name: copied ? "Copiado!" : "Copiar Link",
		icon: copied ? (
			<Check className="size-5 text-green-500" />
		) : (
			<Link className="size-5" />
		),
		action: handleCopyLink,
		color: copied ? "bg-green-100" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
	};

	const moreButton = {
		key: "more",
		name: "Compartilhar via...",
		icon: <MoreHorizontal className="size-5" />,
		action: handleNativeShare,
		color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
	};

	return (
		<div className="relative">
			<h3 className="mb-3 text-left font-medium text-gray-700 text-sm dark:text-white">
				Compartilhar
			</h3>

			{/* Botão de scroll para a ESQUERDA */}
			<button
				className={cn(
					"-translate-y-1/2 absolute top-1/2 left-0 z-10 mt-2 ml-1 rounded-full bg-white p-1 shadow-md disabled:pointer-events-none disabled:opacity-0",
					{
						"opacity-100": scrollState.canScrollLeft,
						"opacity-0": !scrollState.canScrollLeft,
					}
				)}
				disabled={!scrollState.canScrollLeft}
				onClick={() => handleScroll("left")}
				type="button"
			>
				<ChevronLeft className="size-6" />
			</button>

			<ul
				className="flex w-full items-center gap-3 overflow-x-auto px-1 pb-3"
				ref={scrollRef}
			>
				<li className="flex-shrink-0">
					<button
						aria-label={copyButton.name}
						className={cn(
							"flex size-14 items-center justify-center rounded-full transition-colors",
							copyButton.color
						)}
						onClick={copyButton.action}
						title={copyButton.name}
						type="button"
					>
						{copyButton.icon}
					</button>
				</li>

				{SHARING_PLATFORMS.map((platform) => (
					<li className="flex-shrink-0" key={platform.key}>
						<button
							aria-label={`Compartilhar no ${platform.name}`}
							className={cn(
								"flex size-14 items-center justify-center rounded-full text-white transition-colors",
								platform.color
							)}
							onClick={() => handleSocialShare(platform.key)}
							title={platform.name}
							type="button"
						>
							<Image
								alt={`${platform.name} icon`}
								className="invert filter"
								height={24}
								src={platform.icon}
								width={24}
							/>
						</button>
					</li>
				))}

				<li className="flex-shrink-0">
					<button
						aria-label={moreButton.name}
						className={cn(
							"flex size-14 items-center justify-center rounded-full transition-colors",
							moreButton.color
						)}
						onClick={moreButton.action}
						title={moreButton.name}
						type="button"
					>
						{moreButton.icon}
					</button>
				</li>
			</ul>

			{/* Botão de scroll para a DIREITA */}
			<button
				className={cn(
					"-translate-y-1/2 absolute top-1/2 right-0 z-10 mt-2 mr-1 rounded-full bg-white p-1 shadow-md disabled:pointer-events-none disabled:opacity-0",
					{
						"opacity-100": scrollState.canScrollRight,
						"opacity-0": !scrollState.canScrollRight,
					}
				)}
				disabled={!scrollState.canScrollRight}
				onClick={() => handleScroll("right")}
				type="button"
			>
				<ChevronRight className="size-6" />
			</button>
		</div>
	);
};

export default ShareSheet;

"use client";

import { ChevronLeft, ChevronRight, Images, Lock } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
import type { TemplateComponentProps, UserLink } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";
import InteractiveLink from "./cards/InteractiveLink";
import MusicCard from "./cards/MusicCard";
import PasswordProtectedLink from "./cards/PasswordProtectedLink";
import TextCard from "./cards/TextCard";
import { CardImage } from "./cards/utils/media";
import { toForeground } from "./cards/utils/style";
import VideoCard from "./cards/VideoCard";

const REJECTED_URLS = /^(https?:\/\/|mailto:|tel:|\/\/)/i;
export default function LinksList({
	user,
	customPresets,
	textStyle,
	buttonStyle,
	hasScrolled,
}: {
	user: TemplateComponentProps["user"];
	customPresets?: any;
	textStyle?: CSSProperties;
	buttonStyle?: CSSProperties;
	hasScrolled?: boolean;
}) {
	const { animatedLinks } = useLinkAnimation();
	const [showTooltip, setShowTooltip] = useState<string | null>(null);
	// Estado para controlar visibilidade das setas dos carrosséis
	const [carouselStates, setCarouselStates] = useState<
		Record<
			string,
			{ canLeft: boolean; canRight: boolean; isOverflowing: boolean }
		>
	>({});

	const updateCarouselStateFor = (el: HTMLElement) => {
		const id = el.id.replace("carousel-", "");
		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		const canLeft = el.scrollLeft > 0;
		const canRight = Math.ceil(el.scrollLeft) < maxScrollLeft;
		const isOverflowing = el.scrollWidth > el.clientWidth;
		setCarouselStates((prev) => {
			const old = prev[id];
			if (
				old &&
				old.canLeft === canLeft &&
				old.canRight === canRight &&
				old.isOverflowing === isOverflowing
			) {
				return prev;
			}
			return { ...prev, [id]: { canLeft, canRight, isOverflowing } };
		});
	};

	const recalcAllCarousels = () => {
		const elements =
			document.querySelectorAll<HTMLElement>('[id^="carousel-"]');
		elements.forEach(updateCarouselStateFor);
	};

	useEffect(() => {
		recalcAllCarousels();
		const onResize = () => recalcAllCarousels();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [user]);

	const handleLockClick = (e: MouseEvent, linkId: string) => {
		e.preventDefault();
		e.stopPropagation();
		setShowTooltip(showTooltip === linkId ? null : linkId);
	};

	const handleMouseEnter = (linkId: string) => {
		setShowTooltip(linkId);
	};

	const handleMouseLeave = () => {
		setShowTooltip(null);
	};

	const renderLink = (item: UserLink, isFirstLink?: boolean) => {
		const isAnimated = animatedLinks.has(item.id.toString());

		const linkContent = (
			<>
				<div className="text-center">
					<h3 className="line-clamp-2 px-2 font-medium leading-tight">
						{item.title}
					</h3>
				</div>
			</>
		);

		return (
			<div className="w-full" key={item.id}>
				{item.password ? (
					<PasswordProtectedLink link={item}>
						<div
							className={cn(
								"group relative w-full rounded-xl p-1 shadow transition-all duration-200 hover:brightness-110",
								isAnimated && "animate-shake"
							)}
							style={buttonStyle}
						>
							<button
								className="relative z-10 flex h-full w-full items-center"
								type="button"
							>
								{/* Espaço reservado para imagem personalizada na borda esquerda */}
								<div className="flex-shrink-0">
									{item.customImageUrl ? (
										<Image
											alt={`Ícone personalizado de ${item.title}`}
											className="ml-1 size-13 object-cover"
											height={32}
											src={item.customImageUrl}
											style={{ borderRadius: "12px" }}
											width={32}
										/>
									) : (
										<div className="ml-1 size-13" />
									)}
								</div>

								<div className="flex flex-1 justify-center">{linkContent}</div>

								{/* Espaço reservado para o cadeado */}
								<div className="w-10 flex-shrink-0" />
							</button>

							{/* Cadeado posicionado absolutamente em relação ao card */}
							<button
								aria-label="Link protegido por senha"
								className="-translate-y-1/2 absolute top-1/2 right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
								onClick={(e) => handleLockClick(e, item.id.toString())}
								onMouseEnter={() => handleMouseEnter(item.id.toString())}
								onMouseLeave={handleMouseLeave}
								type="button"
							>
								<Lock className="size-5" />
							</button>

							{/* Tooltip responsivo */}
							{showTooltip === item.id.toString() && (
								<div className="-mb-1 absolute right-0 bottom-full z-30 mr-4 whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs dark:bg-white dark:text-black">
									Link protegido por senha
									<div className="absolute top-full right-2 h-0 w-0 border-transparent border-t-4 border-t-black border-r-4 border-l-4 dark:border-t-white" />
								</div>
							)}
						</div>
					</PasswordProtectedLink>
				) : (
					<InteractiveLink
						className={cn(
							"flex w-full items-center border p-1 text-left transition-colors duration-700 ease-in-out hover:brightness-110",
							isAnimated && "animate-shake",
							isFirstLink && hasScrolled ? "border-t-transparent" : undefined
						)}
						customPresets={customPresets}
						href={item.url || "#"}
						link={item}
						style={buttonStyle}
					>
						{linkContent}
					</InteractiveLink>
				)}
			</div>
		);
	};

	const addContentToArray = (
		contentArray: Array<{
			type: "link" | "text" | "video" | "image" | "music" | "event";
			item: any;
			order: number;
		}>,
		items: any[] | undefined,
		type: "link" | "text" | "video" | "image" | "music" | "event"
	) => {
		if (items && items.length > 0) {
			for (const item of items) {
				contentArray.push({ type, item, order: item.order });
			}
		}
	};

	const createContentArray = () => {
		const contentArray: Array<{
			type: "link" | "text" | "video" | "image" | "music" | "event";
			item: any;
			order: number;
		}> = [];

		addContentToArray(contentArray, user.Link, "link");
		addContentToArray(contentArray, user.Text, "text");
		addContentToArray(contentArray, user.Video, "video");
		addContentToArray(contentArray, (user as any).Image, "image");
		addContentToArray(contentArray, (user as any).Music, "music");
		addContentToArray(contentArray, (user as any).Event, "event");

		return contentArray.sort((a, b) => a.order - b.order);
	};

	const renderSectionHeader = (link: any, sectionId: number, index: number) => {
		if (!link.section) {
			return null;
		}

		return (
			<div
				className="mt-8 mb-3 w-full first:mt-0"
				key={`section-${sectionId}-${index}`}
			>
				<h2 className="text-center font-bold text-xl" style={textStyle}>
					{link.section.title}
				</h2>
			</div>
		);
	};

	const renderLinkContent = (
		link: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const linkSectionId = link.sectionId || null;

		if (linkSectionId !== sectionIdRef.value && linkSectionId !== null) {
			sectionIdRef.value = linkSectionId;
			const sectionHeader = renderSectionHeader(link, linkSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(renderLink(link));
		return result;
	};

	const renderTextContent = (
		text: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const textSectionId = text.sectionId || null;

		if (textSectionId !== sectionIdRef.value && textSectionId !== null) {
			sectionIdRef.value = textSectionId;
			const sectionHeader = renderSectionHeader(text, textSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(
			<TextCard
				buttonStyle={buttonStyle}
				classNames={{}}
				customPresets={customPresets}
				key={`text-${text.id}`}
				text={text}
				textStyle={textStyle}
			/>
		);
		return result;
	};

	const renderVideoContent = (
		video: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const videoSectionId = video.sectionId || null;

		if (videoSectionId !== sectionIdRef.value && videoSectionId !== null) {
			sectionIdRef.value = videoSectionId;
			const sectionHeader = renderSectionHeader(video, videoSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(
			<VideoCard
				customPresets={customPresets}
				key={`video-${video.id}`}
				{...video}
			/>
		);
		return result;
	};

	const renderMusicContent = (
		music: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const musicSectionId = music.sectionId || null;

		if (musicSectionId !== sectionIdRef.value && musicSectionId !== null) {
			sectionIdRef.value = musicSectionId;
			const sectionHeader = renderSectionHeader(music, musicSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(
			<MusicCard
				authorName={music.authorName}
				buttonStyle={buttonStyle}
				customPresets={customPresets}
				id={music.id}
				key={`music-${music.id}`}
				thumbnailUrl={music.thumbnailUrl}
				title={music.title}
				url={music.url}
				usePreview={!!music.usePreview}
			/>
		);
		return result;
	};

	const renderEventContent = (
		event: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const eventSectionId = event.sectionId || null;

		if (eventSectionId !== sectionIdRef.value && eventSectionId !== null) {
			sectionIdRef.value = eventSectionId;
			const sectionHeader = renderSectionHeader(event, eventSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		const dateLabel = (() => {
			try {
				const d = new Date(event.eventDate);
				return d.toLocaleDateString("pt-BR");
			} catch {
				return event.eventDate;
			}
		})();

		const cornerValue = customPresets?.customButtonCorners || "12";
		const mutedTextColor = toForeground(
			String(customPresets?.customButtonTextColor || "#0f0f0f")
		);

		const href = normalizeExternalUrl(event.externalLink);

		result.push(
			<div className="w-full" key={`event-${event.id}`}>
				{href ? (
					<a
						className="block border p-4 shadow"
						href={href}
						rel="noopener noreferrer"
						style={{ borderRadius: `${cornerValue}px`, ...buttonStyle }}
						target="_blank"
					>
						<h3 className="font-bold text-lg">{event.title}</h3>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{event.location}
						</div>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{dateLabel} • {event.eventTime}
						</div>
					</a>
				) : (
					<div
						className="border p-4 shadow"
						style={{ borderRadius: `${cornerValue}px`, ...buttonStyle }}
					>
						<h3 className="font-bold text-lg">{event.title}</h3>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{event.location}
						</div>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{dateLabel} • {event.eventTime}
						</div>
					</div>
				)}
			</div>
		);

		return result;
	};

	// Helpers para imagens
	const normalizeExternalUrl = (url?: string | null): string | null => {
		if (!url) {
			return null;
		}
		const trimmed = url.trim();
		if (!trimmed) {
			return null;
		}
		// Mantém protocolos válidos e URLs protocol-relative
		if (REJECTED_URLS.test(trimmed)) {
			return trimmed;
		}
		// Caso não tenha protocolo, força https
		return `https://${trimmed}`;
	};

	const sendImageClickData = (imageId: number, itemIndex: number) => {
		try {
			const payload = JSON.stringify({
				imageId,
				itemIndex,
				trafficSource: detectTrafficSource(),
			});
			if ("sendBeacon" in navigator) {
				const blob = new Blob([payload], { type: "application/json" });
				navigator.sendBeacon("/api/image-click", blob);
			} else {
				fetch("/api/image-click", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: payload,
					keepalive: true,
				}).catch(() => {});
			}
		} catch {}
	};

	const renderImageItem = (
		imageId: number,
		img: any,
		itemIndex: number,
		ratio?: string
	) => {
		const src = img.previewUrl || img.url;
		const content = (
			<CardImage alt={img.authorName || "Imagem"} ratio={ratio} src={src} />
		);

		const href = normalizeExternalUrl(img.linkUrl);
		if (href) {
			return (
				<a
					href={href}
					onClick={() => sendImageClickData(imageId, itemIndex)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{content}
				</a>
			);
		}

		return content;
	};

	const renderImageBlock = (image: any) => {
		const widthPercent = Math.max(
			10,
			Math.min(100, Number(image.sizePercent) || 100)
		);
		const wrapperStyle: React.CSSProperties = {
			width: `${widthPercent}%`,
			marginLeft: "auto",
			marginRight: "auto",
		};

		const cornerValue = customPresets?.customButtonCorners || "12";

		const header = (
			<div className="mb-2 text-center" style={textStyle}>
				{image.title ? (
					<h3 className="font-semibold text-lg">{image.title}</h3>
				) : null}
				{image.description ? (
					<p className="text-sm opacity-80">{image.description}</p>
				) : null}
			</div>
		);

		switch (image.layout) {
			case "single":
				return (
					<div
						className="w-full"
						key={`image-${image.id}`}
						style={wrapperStyle}
					>
						{header}
						<div className="overflow-hidden" style={buttonStyle}>
							{renderImageItem(image.id, image.items?.[0], 0, image.ratio)}
						</div>
					</div>
				);
			case "column":
				return (
					<div
						className="w-full"
						key={`image-${image.id}`}
						style={{ marginLeft: "auto", marginRight: "auto" }}
					>
						<details>
							<summary className="list-none">
								<div
									className={cn(
										"group relative w-full rounded-xl p-1 shadow transition-all duration-200 hover:cursor-pointer hover:brightness-110"
									)}
									style={buttonStyle}
								>
									<div className="relative z-10 flex h-full w-full items-center">
										<div className="flex-shrink-0">
											<div className="ml-1 size-13" />
										</div>
										<div className="flex flex-1 justify-center">
											<h3 className="line-clamp-2 select-none px-2 font-medium leading-tight">
												{image.title || "Imagens"}
											</h3>
										</div>
										<div className="w-10 flex-shrink-0" />
									</div>

									{/* Ícone à direita, absoluto como nos outros cards */}
									<div
										aria-hidden
										className="-translate-y-1/2 absolute top-1/2 right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
									>
										<Images className="size-5" />
									</div>
								</div>
							</summary>

							<div style={wrapperStyle}>
								{image.description ? (
									<p
										className="my-4 text-center text-sm opacity-80"
										style={textStyle}
									>
										{image.description}
									</p>
								) : null}

								<div className="mt-2 space-y-3">
									{(image.items || []).map((img: any, idx: number) => (
										<div
											className="overflow-hidden"
											key={`img-${image.id}-${idx}`}
											style={{ borderRadius: `${cornerValue}px` }}
										>
											{renderImageItem(image.id, img, idx, image.ratio)}
										</div>
									))}
								</div>
							</div>
						</details>
					</div>
				);
			case "carousel":
				return (
					<div
						className="w-full"
						key={`image-${image.id}`}
						style={wrapperStyle}
					>
						{header}
						<div className="relative">
							<div
								className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-3"
								id={`carousel-${image.id}`}
								onScroll={(e) =>
									updateCarouselStateFor(e.currentTarget as HTMLElement)
								}
							>
								{(image.items || []).map((img: any, idx: number) => (
									<div
										className="w-64 flex-shrink-0 snap-center overflow-hidden"
										key={`img-${image.id}-${idx}`}
										style={{ borderRadius: `${cornerValue}px` }}
									>
										{renderImageItem(image.id, img, idx, image.ratio)}
									</div>
								))}
							</div>
							{carouselStates[String(image.id)]?.isOverflowing &&
								carouselStates[String(image.id)]?.canLeft && (
									<button
										aria-label="Voltar"
										className="-translate-y-1/2 absolute top-1/2 left-2 rounded-full bg-black/50 p-2 shadow"
										onClick={() => {
											const el = document.getElementById(
												`carousel-${image.id}`
											);
											el?.scrollBy({ left: -240, behavior: "smooth" });
										}}
										type="button"
									>
										<ChevronLeft className="h-5 w-5 text-white" />
									</button>
								)}
							{carouselStates[String(image.id)]?.isOverflowing &&
								carouselStates[String(image.id)]?.canRight && (
									<button
										aria-label="Avançar"
										className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-black/50 p-2 shadow"
										onClick={() => {
											const el = document.getElementById(
												`carousel-${image.id}`
											);
											el?.scrollBy({ left: 240, behavior: "smooth" });
										}}
										type="button"
									>
										<ChevronRight className="h-5 w-5 text-white" />
									</button>
								)}
						</div>
					</div>
				);
			default:
				return (
					<div
						className="w-full"
						key={`image-${image.id}`}
						style={wrapperStyle}
					>
						{header}
					</div>
				);
		}
	};

	const renderImageContent = (
		image: any,
		index: number,
		sectionIdRef: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const imageSectionId = image.sectionId || null;

		if (imageSectionId !== sectionIdRef.value && imageSectionId !== null) {
			sectionIdRef.value = imageSectionId;
			const sectionHeader = renderSectionHeader(image, imageSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(renderImageBlock(image));
		return result;
	};

	const allContent = createContentArray();
	const currentSectionId = { value: null };
	const firstLinkIndex = allContent.findIndex((c) => c.type === "link");

	const shouldAddSectionSpacing = (currentIndex: number) => {
		const currentItem = allContent[currentIndex];
		const nextItem = allContent[currentIndex + 1];

		if (!(currentItem && nextItem)) {
			return false;
		}

		const currentItemSectionId = currentItem.item.sectionId;
		const nextItemSectionId = nextItem.item.sectionId;

		// Adiciona espaçamento se o item atual tem seção e o próximo não tem ou tem seção diferente
		return currentItemSectionId && currentItemSectionId !== nextItemSectionId;
	};

	return (
		<div className="space-y-4">
			{allContent.map((content, index) => {
				const renderedContent = (() => {
					switch (content.type) {
						case "link":
							return renderLinkContent(content.item, index, currentSectionId);
						case "text":
							return renderTextContent(content.item, index, currentSectionId);
						case "video":
							return renderVideoContent(content.item, index, currentSectionId);
						case "image":
							return renderImageContent(content.item, index, currentSectionId);
						case "music":
							return renderMusicContent(content.item, index, currentSectionId);
						case "event":
							return renderEventContent(content.item, index, currentSectionId);
						default:
							return null;
					}
				})();

				const needsSpacing = shouldAddSectionSpacing(index);

				return (
					<div className={needsSpacing ? "mb-8" : ""} key={`content-${index}`}>
						{content.type === "link"
							? renderLink(content.item as UserLink, index === firstLinkIndex)
							: renderedContent}
					</div>
				);
			})}
		</div>
	);
}

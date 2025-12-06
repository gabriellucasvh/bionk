"use client";

import { Lock } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, MouseEvent } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
import type { TemplateComponentProps, UserLink } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";
import EventCard from "./cards/EventCard";
import ImageCard from "./cards/ImageCard";
import InteractiveLink from "./cards/InteractiveLink";
import MusicCard from "./cards/MusicCard";
import PasswordProtectedLink from "./cards/PasswordProtectedLink";
import TextCard from "./cards/TextCard";
import VideoCard from "./cards/VideoCard";

const YOUTUBE_ID_REGEX =
	/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const VIMEO_ID_REGEX = /vimeo\.com\/(\d+)/;
const VIMEO_PLAYER_ID_REGEX = /player\.vimeo\.com\/video\/(\d+)/;
const TIKTOK_ID_REGEX = /tiktok\.com\/@[^/]+\/video\/(\d+)/;
const TWITCH_CLIP_REGEX =
	/(?:clips\.twitch\.tv\/([A-Za-z0-9-]+)|twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9-]+))/i;
const TRAILING_SLASHES_REGEX = /\/+$/;

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
        const isAnimated = !!item.animated || animatedLinks.has(item.id.toString());

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

	const renderSectionHeader = (item: any, sectionId: number, index: number) => {
		const sectionTitle = (() => {
			const byList = (user.Section || []).find(
				(s: any) => s.id === sectionId
			)?.title;
			if (byList) {
				return byList;
			}
			return item.section?.title || null;
		})();

		if (!sectionTitle) {
			return null;
		}

		return (
			<div
				className="mt-8 mb-3 w-full first:mt-0"
				key={`section-${sectionId}-${index}`}
			>
				<h2 className="text-center font-bold text-xl" style={textStyle}>
					{sectionTitle}
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

		result.push(renderLink(link, index === firstLinkIndex));
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

		const sendVideoClickData = () => {
			const endpoint = "/api/link-click";
			const trafficSource = detectTrafficSource();
			const platformName = (() => {
				if (video.type === "youtube") {
					return "YouTube";
				}
				if (video.type === "vimeo") {
					return "Vimeo";
				}
				if (video.type === "tiktok") {
					return "TikTok";
				}
				if (video.type === "twitch") {
					return "Twitch";
				}
				return "Vídeo";
			})();
			const ensureHttps = (u: string) => {
				if (!u) {
					return "";
				}
				if (u.startsWith("http://")) {
					return `https://${u.slice(7)}`;
				}
				if (!u.startsWith("http")) {
					return `https://${u}`;
				}
				return u;
			};
			const normalizeUrlForClick = (u: string, t: string) => {
				const trimmed = ensureHttps(u.trim());
				if (t === "youtube") {
					const m = trimmed.match(YOUTUBE_ID_REGEX);
					if (m) {
						return `https://www.youtube.com/embed/${m[1]}`;
					}
					return trimmed;
				}
				if (t === "vimeo") {
					const m1 = trimmed.match(VIMEO_ID_REGEX);
					if (m1) {
						return `https://player.vimeo.com/video/${m1[1]}`;
					}
					const m2 = trimmed.match(VIMEO_PLAYER_ID_REGEX);
					if (m2) {
						return `https://player.vimeo.com/video/${m2[1]}`;
					}
					return trimmed;
				}
				if (t === "tiktok") {
					const m = trimmed.match(TIKTOK_ID_REGEX);
					if (m) {
						return `https://www.tiktok.com/embed/v2/${m[1]}`;
					}
					return trimmed;
				}
				if (t === "twitch") {
					try {
						const parsedUrl = new URL(trimmed);
						if (
							parsedUrl.hostname.toLowerCase() === "clips.twitch.tv" &&
							parsedUrl.pathname.replace(TRAILING_SLASHES_REGEX, "") ===
								"/embed"
						) {
							const slugParam = parsedUrl.searchParams.get("clip");
							if (slugParam && slugParam.trim().length > 0) {
								return `https://clips.twitch.tv/embed?clip=${slugParam}`;
							}
						}
					} catch {}
					const m = trimmed.match(TWITCH_CLIP_REGEX);
					const slug = m ? m[1] || m[2] : null;
					if (slug) {
						return `https://clips.twitch.tv/embed?clip=${slug}`;
					}
					return trimmed;
				}
				return trimmed;
			};
			const normalizedUrl = normalizeUrlForClick(
				video.url || "",
				video.type || "video"
			);
			const payload = JSON.stringify({
				trafficSource,
				url: normalizedUrl,
				userId: user.id,
				title: video.title || platformName,
				type: "video_link",
			});
			if (navigator.sendBeacon) {
				navigator.sendBeacon(endpoint, payload);
			} else {
				fetch(endpoint, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: payload,
					keepalive: true,
				});
			}
		};

		result.push(
			<VideoCard
				customPresets={customPresets}
				key={`video-${video.id}`}
				{...video}
				onPlayClick={sendVideoClickData}
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

		result.push(
			<div className="w-full" key={`event-${event.id}`}>
				<EventCard
					buttonStyle={buttonStyle}
					customPresets={customPresets}
					event={event}
				/>
			</div>
		);

		return result;
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

		result.push(
			<ImageCard
				buttonStyle={buttonStyle}
				customPresets={customPresets}
				image={image}
				key={`image-${image.id}`}
				textStyle={textStyle}
			/>
		);
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
						{renderedContent}
					</div>
				);
			})}
		</div>
	);
}

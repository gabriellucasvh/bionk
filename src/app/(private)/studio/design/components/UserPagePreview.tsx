"use client";

import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Images,
	Lock,
	MoreVertical,
	MousePointerClick,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useReducer, useState } from "react";
import MusicCard from "@/components/MusicCard";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import VideoCard from "@/components/VideoCard";
import { cn } from "@/lib/utils";
import type { UserLink, UserProfile } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";
import { FONT_OPTIONS } from "../constants/design.constants";
import { useInstantPreview } from "../hooks/useInstantPreview";

function getFontFamily(customFont: string): string {
	const fontOption = FONT_OPTIONS.find((option) => option.value === customFont);
	return fontOption ? fontOption.fontFamily : "var(--font-sans)";
}

export type UserPagePreviewProps = {
	customizations?: any;
};

function renderUserImage(
	user: UserProfile,
	imageClasses: string,
	imageSize: string
) {
	if (!user.image) {
		return null;
	}

	return (
		<div className={`relative overflow-hidden ${imageClasses}`}>
			{user.image.toLowerCase().endsWith(".gif") ? (
				// biome-ignore lint/performance/noImgElement: <Need to use img element for gif>
				<img
					alt={user.name || user.username}
					className="h-full w-full object-cover"
					src={user.image}
				/>
			) : (
				<Image
					alt={user.name || user.username}
					className="object-cover"
					fill
					priority
					quality={100}
					sizes={imageSize}
					src={user.image}
				/>
			)}
		</div>
	);
}

function renderSocialLinks(
	user: UserProfile,
	socialClasses = "",
	customTextColor?: string
) {
	if (!Array.isArray(user.SocialLink) || user.SocialLink.length === 0) {
		return null;
	}

	return (
		<div className={`flex items-center justify-center ${socialClasses}`}>
			<UserProfileSocialIcons
				className="space-x-4"
				customColor={customTextColor}
				iconSize={24}
				socialLinks={user.SocialLink}
				theme="dark"
			/>
		</div>
	);
}

function renderDefaultHeader(
	user: UserProfile,
	textStyle?: React.CSSProperties
) {
	return (
		<header className="mb-6 w-full text-center">
			{renderUserImage(user, "mx-auto mb-4 h-26 w-26 rounded-full", "112px")}
			<h1 className="font-bold text-2xl" style={textStyle}>
				{user.name || user.username}
			</h1>
			{user.bio && (
				<p className="mt-2" style={textStyle}>
					{user.bio}
				</p>
			)}
			{renderSocialLinks(user, "mt-4", textStyle?.color as string)}
		</header>
	);
}

function renderHorizontalHeader(
	user: UserProfile,
	textStyle?: React.CSSProperties
) {
	return (
		<header className="mb-6 w-full pt-4">
			<div className="mb-4 flex items-start gap-4">
				{renderUserImage(user, "h-20 w-20 rounded-lg flex-shrink-0", "80px")}
				<div className="min-w-0 flex-1">
					<h1 className="truncate font-bold text-xl" style={textStyle}>
						{user.name || user.username}
					</h1>
					{user.bio && (
						<p className="mt-1 truncate" style={textStyle}>
							{user.bio}
						</p>
					)}
				</div>
			</div>
			{renderSocialLinks(user, "justify-center", textStyle?.color as string)}
		</header>
	);
}

function renderHeroHeader(
	user: UserProfile,
	textStyle?: React.CSSProperties,
	customizations?: UserPagePreviewProps["customizations"]
) {
	const pageBackgroundColor =
		customizations?.customBackgroundColor || "#000000";
	const pageBackgroundGradient = customizations?.customBackgroundGradient;

	return (
		<header className="mb-6 w-full text-center">
			{user.image && (
				<div className="relative mb-4 h-48 w-full overflow-hidden sm:h-64 md:h-80 lg:h-94">
					<div className="absolute inset-0">
						{user.image.toLowerCase().endsWith(".gif") ? (
							// biome-ignore lint/performance/noImgElement: <Need to use img element for gif>
							<img
								alt={user.name || user.username}
								className="h-full w-full object-cover"
								src={user.image}
							/>
						) : (
							<Image
								alt={user.name || user.username}
								className="object-cover"
								fill
								priority
								quality={100}
								sizes="100vw"
								src={user.image}
							/>
						)}
					</div>

					<div
						className="absolute inset-0"
						style={{
							background: pageBackgroundGradient
								? `linear-gradient(to bottom, transparent 0%, transparent 70%, ${pageBackgroundGradient} 100%)`
								: `linear-gradient(to bottom, transparent 0%, transparent 70%, ${pageBackgroundColor} 100%)`,
						}}
					/>
				</div>
			)}

			<div className="px-4 text-center">
				<h1 className="font-bold text-lg" style={textStyle}>
					{user.name || user.username}
				</h1>
				{user.bio && (
					<p className="mt-2 text-sm opacity-80" style={textStyle}>
						{user.bio}
					</p>
				)}
			</div>

			<div className="mt-4">
				{renderSocialLinks(user, "justify-center", textStyle?.color as string)}
			</div>
		</header>
	);
}

function UserHeader({
	user,
	textStyle,
	headerStyle = "default",
	customizations,
}: {
	user: UserProfile;
	textStyle?: React.CSSProperties;
	headerStyle?: string;
	customizations?: UserPagePreviewProps["customizations"];
}) {
	switch (headerStyle) {
		case "horizontal":
			return renderHorizontalHeader(user, textStyle);
		case "hero":
			return renderHeroHeader(user, textStyle, customizations);
		default:
			return renderDefaultHeader(user, textStyle);
	}
}

function getButtonStyle(
	customizations: UserPagePreviewProps["customizations"]
) {
	const buttonColor = customizations?.customButtonColor || "#000000";
	const textColor = customizations?.customButtonTextColor || "#ffffff";
	const buttonStyle = customizations?.customButtonStyle || "solid";
	const buttonCorners = customizations?.customButtonCorners || "12";

	const borderRadius = `${buttonCorners}px`;
	const baseStyle = {
		padding: "8px",
		borderRadius,
		transition: "all 0.2s",
	};

	switch (buttonStyle) {
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
		case "gradient":
			return {
				...baseStyle,
				backgroundColor: "transparent",
				backgroundImage:
					customizations?.customBackgroundGradient ||
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

function ContentList({
	user,
	customizations,
	textStyle,
}: {
	user: UserProfile;
	customizations: UserPagePreviewProps["customizations"];
	textStyle?: React.CSSProperties;
}) {
	const buttonStyle = getButtonStyle(customizations);

	const [carouselStates, setCarouselStates] = useState<
		Record<
			string,
			{ canLeft: boolean; canRight: boolean; isOverflowing: boolean }
		>
	>({});

	const updateCarouselStateFor = (el: HTMLElement | null) => {
		if (!el) {
			return;
		}
		const id = el.id.replace("carousel-", "");
		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		const canLeft = Math.ceil(el.scrollLeft) > 0;
		const canRight = Math.floor(el.scrollLeft) < maxScrollLeft;
		const isOverflowing = el.scrollWidth > el.clientWidth;
		setCarouselStates((prev) => {
			const current = prev[id];
			if (
				current &&
				current.canLeft === canLeft &&
				current.canRight === canRight &&
				current.isOverflowing === isOverflowing
			) {
				return prev;
			}
			return { ...prev, [id]: { canLeft, canRight, isOverflowing } };
		});
	};

	useEffect(() => {
		const updateAll = () => {
			const elements =
				document.querySelectorAll<HTMLElement>('[id^="carousel-"]');
			for (const el of elements) {
				updateCarouselStateFor(el);
			}
		};
		updateAll();
		window.addEventListener("resize", updateAll);
		return () => window.removeEventListener("resize", updateAll);
	}, [user, customizations]);

	const renderLink = (item: UserLink) => {
		const customImageUrl =
			item.customImageUrl && typeof item.customImageUrl === "string"
				? item.customImageUrl
				: null;
		const showImage = customImageUrl !== null;

		const href = normalizeExternalUrl(item?.url);
		const indicatorIcon = (() => {
			if (item?.password) {
				return <Lock className="h-4 w-4" />;
			}
			// Prioridade: compartilhamento > cliques > expiração
			if (item?.shareAllowed) {
				return <MoreVertical className="h-4 w-4" />;
			}
			if (item?.deleteOnClicks) {
				return <MousePointerClick className="h-4 w-4" />;
			}
			if (item?.expiresAt) {
				return <Clock className="h-4 w-4" />;
			}
			return null;
		})();

		const linkContent = (
			<>
				{/* Espaço reservado para imagem personalizada */}
				<div className="flex-shrink-0">
					{showImage && customImageUrl ? (
						<Image
							alt={`Ícone personalizado de ${item.title}`}
							className="ml-1 size-8 rounded object-cover"
							height={32}
							src={customImageUrl}
							width={32}
						/>
					) : (
						<div className="ml-1 size-8" />
					)}
				</div>
				<div className="flex flex-1 justify-center">
					<h3 className="line-clamp-2 px-2 font-medium leading-tight">
						{item.title}
					</h3>
				</div>
				<div className="flex w-10 flex-shrink-0 justify-center">
					{indicatorIcon ? (
						<div className="rounded-full p-2 text-current opacity-70">
							{indicatorIcon}
						</div>
					) : (
						<div className="w-6" />
					)}
				</div>
			</>
		);

		return (
			<div className="w-full" key={item.id}>
				{item.password ? (
					<button
						className="relative flex w-full items-center rounded-lg border p-4 text-left transition-all duration-200"
						style={buttonStyle}
						type="button"
					>
						{/* Espaço à esquerda para balancear o centro */}
						<div className="ml-1 size-8 flex-shrink-0" />
						<div className="flex flex-1 justify-center">
							<h3 className="line-clamp-2 px-2 font-medium leading-tight">
								{item.title}
							</h3>
						</div>
						<div className="flex w-10 flex-shrink-0 justify-center">
							<div className="rounded-full p-2 text-current opacity-70">
								<Lock className="h-4 w-4" />
							</div>
						</div>
					</button>
				) : href ? (
					<a
						className="group relative flex w-full items-center rounded-lg border p-4 text-left transition-all duration-200"
						href={href}
						rel="noopener noreferrer"
						style={buttonStyle}
						target="_blank"
					>
						{linkContent}
					</a>
				) : (
					<div
						className="group relative flex w-full items-center rounded-lg border p-4 text-left transition-all duration-200"
						style={buttonStyle}
					>
						{linkContent}
					</div>
				)}
			</div>
		);
	};

	const addContentToArray = (
		contentArray: Array<{
			type: "link" | "text" | "video" | "image" | "music";
			item: any;
			order: number;
		}>,
		items: any[] | undefined,
		type: "link" | "text" | "video" | "image" | "music"
	) => {
		if (items && items.length > 0) {
			for (const item of items) {
				contentArray.push({ type, item, order: item.order });
			}
		}
	};

	const createContentArray = () => {
		const contentArray: Array<{
			type: "link" | "text" | "video" | "image" | "music";
			item: any;
			order: number;
		}> = [];

		addContentToArray(contentArray, user.Link, "link");
		addContentToArray(contentArray, user.Text, "text");
		addContentToArray(contentArray, user.Video, "video");
		addContentToArray(contentArray, (user as any).Image, "image");
		addContentToArray(contentArray, user.Music, "music");

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

	const renderCompactText = (text: any) => {
		const getCompactTextStyle = () => {
			if (!text.hasBackground) {
				const cornerValue = customizations?.customButtonCorners || "12";
				return {
					borderRadius: `${cornerValue}px`,
				};
			}
			return getButtonStyle(customizations);
		};

		return (
			<div className="w-full" key={`text-${text.id}`}>
				<button
					className={`flex min-h-[3.5rem] w-full items-center px-1 py-3 text-left transition-all duration-200 hover:brightness-110 ${
						text.hasBackground
							? "rounded-lg border"
							: "bg-white/3 hover:bg-white/5"
					}`}
					style={getCompactTextStyle()}
					type="button"
				>
					<div className="w-10 flex-shrink-0" />
					<div className="flex flex-1 justify-center">
						<h3
							className="line-clamp-2 px-2 font-medium leading-tight"
							style={textStyle}
						>
							{text.title}
						</h3>
					</div>
					<div className="w-10 flex-shrink-0" />
				</button>
			</div>
		);
	};

	const renderExpandedText = (text: any) => {
		const cornerValue = customizations?.customButtonCorners || "12";
		const borderRadiusValue = `${cornerValue}px`;

		const getTextBackgroundStyle = () => {
			if (!(text.hasBackground && customizations)) {
				return {};
			}

			return {
				...getButtonStyle(customizations),
				borderRadius: borderRadiusValue,
			};
		};

		return (
			<div
				className={cn(
					"w-full p-4",
					text.hasBackground ? "border" : "",
					text.position === "center" && "text-center",
					text.position === "right" && "text-right"
				)}
				key={`text-${text.id}`}
				style={getTextBackgroundStyle()}
			>
				<h3 className="mb-2 font-bold text-lg" style={textStyle}>
					{text.title}
				</h3>
				<p className="text-sm" style={textStyle}>
					{text.description}
				</p>
			</div>
		);
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

		const textElement = text.isCompact
			? renderCompactText(text)
			: renderExpandedText(text);

		result.push(textElement);
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
				customPresets={customizations}
				key={`video-${video.id}`}
				{...video}
			/>
		);
		return result;
	};

	// Imagens (preview simplificado)
	const normalizeExternalUrl = (url?: string | null): string | null => {
		if (!url) {
			return null;
		}
		const trimmed = url.trim();
		if (!trimmed) {
			return null;
		}
		if (/^(https?:\/\/|mailto:|tel:|\/\/)/i.test(trimmed)) {
			return trimmed;
		}
		return `https://${trimmed}`;
	};
	const getAspectRatioStyle = (ratio?: string): React.CSSProperties => {
		switch (ratio) {
			case "square":
				return { aspectRatio: "1 / 1" };
			case "16:9":
				return { aspectRatio: "16 / 9" };
			case "3:2":
				return { aspectRatio: "3 / 2" };
			case "3:1":
				return { aspectRatio: "3 / 1" };
			default:
				if (!ratio) {
					return {};
				}
				return {
					aspectRatio: ratio.includes(":") ? ratio.replace(":", " / ") : ratio,
				};
		}
	};

	// Send image click tracking to backend
	const sendImageClickData = (imageId: number | string, itemIndex: number) => {
		try {
			const trafficSource = detectTrafficSource();
			const payload = JSON.stringify({ imageId, itemIndex, trafficSource });
			const url = "/api/image-click";
			if (navigator.sendBeacon) {
				const blob = new Blob([payload], { type: "application/json" });
				navigator.sendBeacon(url, blob);
			} else {
				fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: payload,
					keepalive: true,
				});
			}
		} catch (_) {
			// ignore errors in preview
		}
	};

	const renderImageItem = (
		img: any,
		ratio?: string,
		imageId?: number | string,
		itemIndex?: number
	) => {
		const src = img?.previewUrl || img?.url;
		if (!src) {
			return null;
		}
		const content = (
			<div
				className="relative w-full overflow-hidden"
				style={getAspectRatioStyle(ratio)}
			>
				{typeof src === "string" && src.toLowerCase().endsWith(".gif") ? (
					// biome-ignore lint/performance/noImgElement: gif rendering
					<img
						alt={img?.authorName || "Imagem"}
						className="h-full w-full object-cover"
						src={src}
					/>
				) : (
					<Image
						alt={img?.authorName || "Imagem"}
						className="object-cover"
						fill
						sizes="(max-width: 640px) 100vw, 575px"
						src={src}
					/>
				)}
			</div>
		);
		const href = normalizeExternalUrl(img?.linkUrl);
		return href ? (
			<a
				href={href}
				onClick={() => {
					if (imageId != null && itemIndex != null) {
						sendImageClickData(imageId, itemIndex);
					}
				}}
				rel="noopener noreferrer"
				target="_blank"
			>
				{content}
			</a>
		) : (
			content
		);
	};

	const renderImageBlock = (image: any) => {
		const widthPercent = Math.max(
			10,
			Math.min(100, Number(image?.sizePercent) || 100)
		);
		const wrapperStyle: React.CSSProperties = {
			width: `${widthPercent}%`,
			marginLeft: "auto",
			marginRight: "auto",
		};
		const header = (
			<div className="mb-2 text-center" style={textStyle}>
				{image?.title ? (
					<h3 className="font-semibold text-lg">{image.title}</h3>
				) : null}
				{image?.description ? (
					<p className="text-sm opacity-80">{image.description}</p>
				) : null}
			</div>
		);
		switch (image?.layout) {
			case "single":
				return (
					<div
						className="w-full"
						key={`image-${image.id}`}
						style={wrapperStyle}
					>
						{header}
						<div className="overflow-hidden" style={buttonStyle}>
							{renderImageItem(image?.items?.[0], image?.ratio, image?.id, 0)}
						</div>
					</div>
				);
			case "column": {
				const cornerValue = customizations?.customButtonCorners || "12";
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
										"group relative w-full rounded-xl p-1 transition-all duration-200 hover:cursor-pointer hover:brightness-110"
									)}
									style={buttonStyle}
								>
									<div className="relative z-10 flex h-full w-full items-center">
										<div className="flex-shrink-0">
											<div className="ml-1 size-13" />
										</div>
										<div className="flex flex-1 justify-center">
											<h3 className="line-clamp-2 select-none px-2 font-medium leading-tight">
												{image?.title || "Imagens"}
											</h3>
										</div>
										<div className="w-10 flex-shrink-0" />
									</div>

									<div
										aria-hidden
										className="-translate-y-1/2 absolute top-1/2 right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
									>
										<Images className="size-5" />
									</div>
								</div>
							</summary>

							<div style={wrapperStyle}>
								{image?.description ? (
									<p
										className="my-4 text-center text-sm opacity-80"
										style={textStyle}
									>
										{image.description}
									</p>
								) : null}

								<div className="mt-2 space-y-3">
									{(image?.items || []).map((img: any, idx: number) => (
										<div
											className="overflow-hidden"
											key={`img-${image.id}-${idx}`}
											style={{ borderRadius: `${cornerValue}px` }}
										>
											{renderImageItem(img, image?.ratio, image?.id, idx)}
										</div>
									))}
								</div>
							</div>
						</details>
					</div>
				);
			}
			// column layout moved above to match BaseTemplate design
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
								{(image?.items || []).map((img: any, idx: number) => (
									<div
										className="w-64 flex-shrink-0 snap-center overflow-hidden"
										key={`img-${image.id}-${idx}`}
										style={{
											borderRadius: `${customizations?.customButtonCorners || "12"}px`,
										}}
									>
										{renderImageItem(img, image?.ratio, image?.id, idx)}
									</div>
								))}
							</div>

							{carouselStates[String(image.id)]?.isOverflowing &&
								carouselStates[String(image.id)]?.canLeft && (
									<button
										aria-label="Anterior"
										className="-translate-y-1/2 absolute top-1/2 left-2 rounded-full bg-black/50 p-2 text-white"
										onClick={() => {
											const el = document.getElementById(
												`carousel-${image.id}`
											);
											if (el) {
												el.scrollBy({ left: -240, behavior: "smooth" });
											}
										}}
										type="button"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>
								)}

							{carouselStates[String(image.id)]?.isOverflowing &&
								carouselStates[String(image.id)]?.canRight && (
									<button
										aria-label="Próximo"
										className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-black/50 p-2 text-white"
										onClick={() => {
											const el = document.getElementById(
												`carousel-${image.id}`
											);
											if (el) {
												el.scrollBy({ left: 240, behavior: "smooth" });
											}
										}}
										type="button"
									>
										<ChevronRight className="h-4 w-4" />
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
				customPresets={customizations}
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

	const allContent = createContentArray();
	const currentSectionId = { value: null };

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

function convertUserDataToUserProfile(userData: any): UserProfile {
	if (!userData) {
		return {} as UserProfile;
	}

	// Separar links regulares dos social links
	const allLinks = Array.isArray(userData.links) ? userData.links : [];
	const now = new Date();
	const withinSchedule = (l: any) => {
		const launchesOk = !l?.launchesAt || new Date(l.launchesAt) <= now;
		const expiresOk = !l?.expiresAt || new Date(l.expiresAt) >= now;
		return launchesOk && expiresOk;
	};

	const regularLinks = allLinks
		.filter((link: any) => !link.platform)
		// Não renderizar itens do tipo seção como links
		.filter((link: any) => link?.type !== "section")
		// Ocultar inativos/arquivados e fora da janela de tempo
		.filter((link: any) => link?.active !== false && link?.archived !== true)
		.filter(withinSchedule);

	const socialLinks = allLinks
		.filter((link: any) => link.platform)
		// Social links seguem apenas flag de ativo
		.filter((link: any) => link?.active !== false);

	return {
		...userData,
		Link: regularLinks,
		Text: userData.texts || [],
		Video: (userData.videos || []).filter(
			(video: any) => video?.active !== false && video?.archived !== true
		),
		Image: userData.images || [],
		Music: (userData.musics || []).filter(
			(music: any) => music?.active !== false && music?.archived !== true
		),
		SocialLink: socialLinks,
	} as UserProfile;
}

export default function UserPagePreview() {
	const { userData, customizations } = useInstantPreview();
	const user = useMemo(
		() => convertUserDataToUserProfile(userData),
		[userData]
	);
	const [mounted, setMounted] = useState(false);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const handleUpdate = () => forceUpdate();
		window.addEventListener("designStoreUpdate", handleUpdate);
		return () => window.removeEventListener("designStoreUpdate", handleUpdate);
	}, []);

	if (!(mounted && user)) {
		return null;
	}

	const getBackgroundStyle = () => {
		// Se houver mídia de fundo, não aplicar cor/gradiente no wrapper
		if (
			customizations?.customBackgroundMediaType === "image" ||
			customizations?.customBackgroundMediaType === "video"
		) {
			return {};
		}
		// Prioriza cor sólida quando ambas existem
		if (customizations?.customBackgroundColor) {
			return {
				backgroundColor: customizations.customBackgroundColor,
			};
		}

		if (customizations?.customBackgroundGradient) {
			return {
				backgroundImage: customizations.customBackgroundGradient,
				backgroundColor: "transparent",
			};
		}

		return {};
	};

	const wrapperStyle: React.CSSProperties = {
		...getBackgroundStyle(),
		...(customizations?.customFont && {
			fontFamily: getFontFamily(customizations.customFont),
		}),
	};

	const textStyle: React.CSSProperties = {
		...(customizations?.customTextColor && {
			color: customizations.customTextColor,
		}),
	};

	const renderFixedBackground = () => {
		const type = customizations?.customBackgroundMediaType;
		const imageUrl = customizations?.customBackgroundImageUrl;
		const videoUrl = customizations?.customBackgroundVideoUrl;

		if (type === "image" && imageUrl) {
			return (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[inherit]"
					style={{
						backgroundImage: `url("${imageUrl}")`,
						backgroundSize: "cover",
						backgroundPosition: "top",
						backgroundRepeat: "no-repeat",
					}}
				/>
			);
		}

		if (type === "video" && videoUrl) {
			return (
				<video
					aria-hidden
					autoPlay
					className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[inherit] object-cover"
					controls={false}
					key={videoUrl}
					loop
					muted
					playsInline
					src={videoUrl}
				/>
			);
		}

		return null;
	};

	return (
		<div className="relative h-full w-full">
			{renderFixedBackground()}
			<div
				className={`relative z-10 h-full w-full overflow-y-auto overflow-x-hidden ${
					customizations.headerStyle === "hero" ? "" : "px-4 sm:px-6 sm:pt-4"
				}`}
				style={wrapperStyle}
			>
				<div className="relative flex flex-col">
					{customizations.headerStyle === "hero" ? (
						<>
							<UserHeader
								customizations={customizations}
								headerStyle={customizations.headerStyle}
								textStyle={textStyle}
								user={user}
							/>
							<main className="mx-auto flex w-full flex-1 flex-col items-center px-4 pt-2">
								<section className="w-full">
									<ContentList
										customizations={customizations}
										textStyle={textStyle}
										user={user}
									/>
								</section>
							</main>
						</>
					) : (
						<main
							className={
								"mx-auto flex w-full flex-1 flex-col items-center pt-4"
							}
						>
							<UserHeader
								customizations={customizations}
								headerStyle={customizations.headerStyle}
								textStyle={textStyle}
								user={user}
							/>
							<section className="w-full">
								<ContentList
									customizations={customizations}
									textStyle={textStyle}
									user={user}
								/>
							</section>
						</main>
					)}
					<footer
						className="mt-auto flex justify-center pt-2 pb-2"
						style={textStyle}
					>
						<span className="text-sm opacity-60">{user.username} | Bionk</span>
					</footer>
				</div>
			</div>
		</div>
	);
}

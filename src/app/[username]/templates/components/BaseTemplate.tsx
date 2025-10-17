"use client";

import {
	ChevronRight,
	Images,
	Lock,
	SquareArrowOutUpRight,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import { FONT_OPTIONS } from "@/app/(private)/studio/design/constants/design.constants";
import { BaseButton } from "@/components/buttons/BaseButton";
import CookieConsent from "@/components/CookieConsent";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/modals/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import VideoCard from "@/components/VideoCard";
import { cn } from "@/lib/utils";
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
import type { TemplateComponentProps, UserLink } from "@/types/user-profile";
import { getTemplatePreset } from "@/utils/templatePresets";
import ShareModal from "./ShareModal";
import TextCard from "./TextCard";

function getFontFamily(customFont: string): string {
	const fontOption = FONT_OPTIONS.find((option) => option.value === customFont);
	return fontOption ? fontOption.fontFamily : "var(--font-sans)";
}

interface BaseTemplateProps extends TemplateComponentProps {
	children?: React.ReactNode;
}

function ShareButton({ onClick }: { onClick: () => void }) {
	return (
		<div className="relative mb-4 flex w-full justify-end">
			<button
				aria-label="Compartilhar perfil"
				className="absolute z-50 flex items-center justify-center rounded-full border border-white/20 bg-white/80 p-2 shadow shadow-black/10 backdrop-blur-md transition-colors hover:bg-white/90"
				onClick={onClick}
				type="button"
			>
				<SquareArrowOutUpRight
					className="size-4.5 text-black"
					strokeWidth={1.5}
				/>
			</button>
		</div>
	);
}

function renderUserImage(
	user: TemplateComponentProps["user"],
	imageClasses: string,
	imageSize: string
) {
	if (!user.image) {
		return null;
	}

	return (
		<div className={`relative mt-10 overflow-hidden ${imageClasses}`}>
			{user.image.toLowerCase().endsWith(".gif") ? (
				// biome-ignore lint/performance/noImgElement: <necessário para GIFs>
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
	user: TemplateComponentProps["user"],
	socialClasses = "",
	customTextColor?: string
) {
	if (!Array.isArray(user.SocialLink) || user.SocialLink.length === 0) {
		return null;
	}

	return (
		<div className={`flex items-center justify-center ${socialClasses}`}>
			<UserProfileSocialIcons
				className="space-x-4 space-y-1"
				customColor={customTextColor}
				iconSize={26}
				socialLinks={user.SocialLink}
				theme="dark"
			/>
		</div>
	);
}

function renderDefaultHeader(
	user: TemplateComponentProps["user"],
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
	user: TemplateComponentProps["user"],
	textStyle?: React.CSSProperties
) {
	return (
		<header className="mb-6 w-full pt-4">
			<div className="mb-4 flex items-start gap-4">
				{renderUserImage(user, "h-20 w-20 rounded-lg flex-shrink-0", "80px")}
				<div className="mt-10 min-w-0 flex-1">
					<h1 className="font-bold text-xl" style={textStyle}>
						{user.name || user.username}
					</h1>
					{user.bio && (
						<p className="mt-1" style={textStyle}>
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
	user: TemplateComponentProps["user"],
	textStyle?: React.CSSProperties,
	customPresets?: any
) {
	const pageBackgroundColor = customPresets?.customBackgroundColor || "#000000";
	const pageBackgroundGradient = customPresets?.customBackgroundGradient;

	return (
		<header className="mb-6 w-full text-center">
			{user.image && (
				<div className="relative mb-4 h-48 w-full overflow-hidden sm:h-64 md:h-80 lg:h-94">
					<div className="absolute inset-0">
						{user.image.toLowerCase().endsWith(".gif") ? (
							// biome-ignore lint/performance/noImgElement: <necessário para GIFs>
							<img
								alt={user.name || user.username}
								className="h-full w-full object-cover sm:rounded-t-3xl"
								src={user.image}
							/>
						) : (
							<Image
								alt={user.name || user.username}
								className="object-cover sm:rounded-t-3xl"
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
				<h1 className="font-bold text-2xl" style={textStyle}>
					{user.name || user.username}
				</h1>
				{user.bio && (
					<p className="mt-2" style={textStyle}>
						{user.bio}
					</p>
				)}
				{renderSocialLinks(user, "mt-4", textStyle?.color as string)}
			</div>
		</header>
	);
}

function UserHeader({
	user,
	textStyle,
	headerStyle = "default",
	customPresets,
}: {
	user: TemplateComponentProps["user"];
	textStyle?: React.CSSProperties;
	headerStyle?: string;
	customPresets?: any;
}) {
	switch (headerStyle) {
		case "horizontal":
			return renderHorizontalHeader(user, textStyle);
		case "hero":
			return renderHeroHeader(user, textStyle, customPresets);
		default:
			return renderDefaultHeader(user, textStyle);
	}
}

function PasswordProtectedLink({
	link,
	children,
}: {
	link: UserLink;
	children: React.ReactNode;
}) {
	const [passwordInput, setPasswordInput] = useState("");
	const [error, setError] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (passwordInput === link.password) {
			if (link.url) {
				window.open(link.url, "_blank", "noopener,noreferrer");
			}
			setIsOpen(false);
			setPasswordInput("");
			setError("");
		} else {
			setError("Senha incorreta");
		}
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Link protegido por senha</DialogTitle>
					<DialogDescription>
						Este link requer uma senha para ser acessado.
					</DialogDescription>
				</DialogHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<Input
							onChange={(e) => setPasswordInput(e.target.value)}
							placeholder="Digite a senha"
							type="password"
							value={passwordInput}
						/>
						{error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
					</div>
					<div className="flex justify-end space-x-2">
						<BaseButton
							onClick={() => setIsOpen(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</BaseButton>
						<BaseButton type="submit">Acessar</BaseButton>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function LinksList({
	user,
	customPresets,
	textStyle,
	buttonStyle,
}: {
	user: TemplateComponentProps["user"];
	customPresets?: any;
	textStyle?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;
}) {
	const { animatedLinks } = useLinkAnimation();
	const [showTooltip, setShowTooltip] = useState<string | null>(null);

	const handleLockClick = (e: React.MouseEvent, linkId: string) => {
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

	const renderLink = (item: UserLink) => {
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
								"group relative w-full rounded-xl p-1 shadow-md transition-all duration-200 hover:brightness-110",
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
							"flex w-full items-center border p-1 text-left transition-all duration-200 hover:brightness-110",
							isAnimated && "animate-shake"
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
			type: "link" | "text" | "video" | "image";
			item: any;
			order: number;
		}>,
		items: any[] | undefined,
		type: "link" | "text" | "video" | "image"
	) => {
		if (items && items.length > 0) {
			for (const item of items) {
				contentArray.push({ type, item, order: item.order });
			}
		}
	};

	const createContentArray = () => {
		const contentArray: Array<{
			type: "link" | "text" | "video" | "image";
			item: any;
			order: number;
		}> = [];

		addContentToArray(contentArray, user.Link, "link");
		addContentToArray(contentArray, user.Text, "text");
		addContentToArray(contentArray, user.Video, "video");
		addContentToArray(contentArray, (user as any).Image, "image");

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
		if (/^(https?:\/\/|mailto:|tel:|\/\/)/i.test(trimmed)) {
			return trimmed;
		}
		// Caso não tenha protocolo, força https
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
				return {};
		}
	};

	const renderImageItem = (img: any, ratio?: string) => {
		const src = img.previewUrl || img.url;
		const content = (
			<div
				className="relative w-full overflow-hidden"
				style={{ ...getAspectRatioStyle(ratio) }}
			>
				{typeof src === "string" && src.toLowerCase().endsWith(".gif") ? (
					// biome-ignore lint/performance/noImgElement: gif rendering
					<img
						alt={img.authorName || "Imagem"}
						className="h-full w-full object-cover"
						src={src}
					/>
				) : (
					<Image
						alt={img.authorName || "Imagem"}
						className="object-cover"
						fill
						sizes="(max-width: 640px) 100vw, 575px"
						src={src}
					/>
				)}
			</div>
		);

		const href = normalizeExternalUrl(img.linkUrl);
		if (href) {
			return (
				<a href={href} rel="noopener noreferrer" target="_blank">
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
							{renderImageItem(image.items?.[0], image.ratio)}
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
										"group relative w-full rounded-xl p-1 shadow-md transition-all duration-200 hover:cursor-pointer hover:brightness-110"
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
											{renderImageItem(img, image.ratio)}
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
								className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-3"
								id={`carousel-${image.id}`}
							>
								{(image.items || []).map((img: any, idx: number) => (
									<div
										className="w-64 flex-shrink-0 snap-center overflow-hidden"
										key={`img-${image.id}-${idx}`}
										style={{ borderRadius: `${cornerValue}px` }}
									>
										{renderImageItem(img, image.ratio)}
									</div>
								))}
							</div>
							<button
								aria-label="Avançar"
								className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-white/80 p-2 shadow-md"
								onClick={() => {
									const el = document.getElementById(`carousel-${image.id}`);
									el?.scrollBy({ left: 240, behavior: "smooth" });
								}}
								type="button"
							>
								<ChevronRight className="h-5 w-5 text-black" />
							</button>
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

export default function BaseTemplate({ user, children }: BaseTemplateProps) {
	const [isShareModalOpen, setShareModalOpen] = useState(false);

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

	const renderFixedBackground = () => {
		const type = customPresets?.customBackgroundMediaType;
		const imageUrl = customPresets?.customBackgroundImageUrl;
		const videoUrl = customPresets?.customBackgroundVideoUrl;

		if (type === "image" && imageUrl) {
			return (
				<div
					aria-hidden
					className="pointer-events-none fixed top-0 right-0 left-0 z-0 mx-auto w-full max-w-[575px] rounded-[inherit]"
					style={{
						height: "100dvh",
						backgroundImage: `url("${imageUrl}")`,
						backgroundAttachment: "fixed",
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				/>
			);
		}

		if (type === "video" && videoUrl) {
			return (
				<video
					aria-hidden
					autoPlay
					className="pointer-events-none fixed top-0 right-0 left-0 z-0 mx-auto w-full max-w-[575px] rounded-[inherit] object-cover"
					controls={false}
					key={videoUrl}
					loop
					muted
					playsInline
					src={videoUrl}
					style={{ height: "100dvh" }}
				/>
			);
		}

		return null;
	};

	return (
		<>
			{/* Container principal com aspect ratio de celular em telas maiores */}
			<div
				className={`relative min-h-dvh sm:flex sm:items-start sm:justify-center sm:pt-4 ${
					shouldUseBlurredBackground ? "" : "bg-neutral-900"
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
					className={`relative z-10 min-h-dvh w-full sm:min-h-[calc(100vh-2rem)] sm:w-[575px] sm:overflow-hidden sm:rounded-t-3xl sm:shadow-2xl sm:shadow-black/20 ${
						customPresets.headerStyle === "hero" ? "pt-0" : "px-4"
					} ${customPresets.headerStyle !== "hero" ? "sm:px-6 sm:pt-4" : ""}`}
					style={wrapperStyle}
				>
					{renderFixedBackground()}
					<ProfileViewTracker userId={user.id} />

					<div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
						<ShareButton onClick={() => setShareModalOpen(true)} />
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
								customPresets.headerStyle === "hero" ? "pt-2" : "pt-4"
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

			<CookieConsent userId={user.id} />
		</>
	);
}

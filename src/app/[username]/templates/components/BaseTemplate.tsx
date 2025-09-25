// src/app/[username]/templates/components/BaseTemplate.tsx

"use client";

import { Lock, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import CookieConsent from "@/components/CookieConsent";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/modals/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import { Badge } from "@/components/ui/badge";
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
import ShareModal from "./ShareModal";
import TextCard from "./TextCard";

interface BaseTemplateProps extends TemplateComponentProps {
	classNames?: {
		image?: string;
		name?: string;
		bio?: string;
		wrapper?: string;
		header?: string;
		footer?: string;
		cardLink?: string;
		link?: string;
		theme?: "light" | "dark";
	};
	children?: React.ReactNode;
	customPresets?: {
		customBackgroundColor: string;
		customBackgroundGradient: string;
		customTextColor: string;
		customFont: string;
		customButton: string;
		customButtonFill: string;
		customButtonCorners: string;
		headerStyle: string;
	};
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

function UserHeader({
	user,
	classNames,
	textStyle,
	headerStyle = "default",
	customPresets,
}: {
	user: TemplateComponentProps["user"];
	classNames?: BaseTemplateProps["classNames"];
	textStyle?: React.CSSProperties;
	headerStyle?: string;
	customPresets?: BaseTemplateProps["customPresets"];
}) {
	const renderUserImage = (imageClasses: string, imageSize: string) => {
		if (!user.image) {
			return null;
		}

		return (
			<div className={`relative overflow-hidden ${imageClasses}`}>
				{user.image.toLowerCase().endsWith(".gif") ? (
					// biome-ignore lint/performance/noImgElement: <next/image não lida bem com gifs, <img> para segurança>
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
	};

	const renderSocialLinks = (socialClasses = "") => {
		if (!Array.isArray(user.SocialLink) || user.SocialLink.length === 0) {
			return null;
		}

		return (
			<div className={`flex items-center justify-center ${socialClasses}`}>
				<UserProfileSocialIcons
					className="space-x-4 space-y-1"
					iconSize={26}
					socialLinks={user.SocialLink}
					theme={classNames?.theme}
				/>
			</div>
		);
	};

	// Estilo padrão: foto redonda, nome, bio e socialLinks centralizados
	if (headerStyle === "default") {
		return (
			<header className={`mb-8 w-full text-center ${classNames?.header || ""}`}>
				{renderUserImage("mx-auto mb-4 h-26 w-26 rounded-full", "112px")}
				<h1
					className={`font-bold text-2xl ${classNames?.name || ""}`}
					style={textStyle}
				>
					{user.name || user.username}
				</h1>
				{user.bio && (
					<p
						className={`mt-2 text-sm ${classNames?.bio || ""}`}
						style={textStyle}
					>
						{user.bio}
					</p>
				)}
				{renderSocialLinks("mt-4")}
			</header>
		);
	}

	// Estilo horizontal: foto à esquerda, nome e bio à direita, socialLinks embaixo
	if (headerStyle === "horizontal") {
		return (
			<header className={`mb-8 w-full ${classNames?.header || ""}`}>
				<div className="mb-4 flex items-start gap-4">
					{renderUserImage("h-20 w-20 rounded-lg flex-shrink-0", "80px")}
					<div className="min-w-0 flex-1">
						<h1
							className={`font-bold text-xl ${classNames?.name || ""}`}
							style={textStyle}
						>
							{user.name || user.username}
						</h1>
						{user.bio && (
							<p
								className={`mt-1 text-sm ${classNames?.bio || ""}`}
								style={textStyle}
							>
								{user.bio}
							</p>
						)}
					</div>
				</div>
				{renderSocialLinks("justify-center")}
			</header>
		);
	}

	// Estilo hero: foto incorporada com fundo, gradiente, nome e bio embaixo
	if (headerStyle === "hero") {
		// Obter a cor de fundo da página para criar o gradiente
		const pageBackgroundColor =
			customPresets?.customBackgroundColor || "#000000";
		const pageBackgroundGradient = customPresets?.customBackgroundGradient;

		return (
			<header className={`mb-12 w-full ${classNames?.header || ""}`}>
				{user.image && (
					<div className="-mx-3.5 -mt-3.5 relative mb-8 h-64 overflow-hidden">
						{/* Imagem de fundo */}
						<div className="absolute inset-0">
							{user.image.toLowerCase().endsWith(".gif") ? (
								// biome-ignore lint/performance/noImgElement: <next/image não lida bem com gifs, <img> para segurança>
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
									src={user.image}
								/>
							)}
						</div>

						{/* Gradiente que faz a foto "surgir" do fundo da página - apenas na parte inferior */}
						<div
							className="absolute inset-0"
							style={{
								background: pageBackgroundGradient
									? `linear-gradient(to bottom, transparent 0%, transparent 70%, ${pageBackgroundGradient} 100%)`
									: `linear-gradient(to bottom, transparent 0%, transparent 70%, ${pageBackgroundColor} 100%)`,
							}}
						/>

						{/* Conteúdo sobreposto */}
						<div className="absolute right-6 bottom-6 left-6 text-center">
							<h1
								className={`font-bold text-2xl text-white drop-shadow-lg ${classNames?.name || ""}`}
								style={{
									...textStyle,
									color: "white",
									textShadow: "0 2px 4px rgba(0,0,0,0.8)",
								}}
							>
								{user.name || user.username}
							</h1>
							{user.bio && (
								<p
									className={`mt-2 text-sm text-white/90 drop-shadow-md ${classNames?.bio || ""}`}
									style={{
										color: "rgba(255,255,255,0.9)",
										textShadow: "0 1px 2px rgba(0,0,0,0.8)",
									}}
								>
									{user.bio}
								</p>
							)}
						</div>
					</div>
				)}
				<div className="mt-6 text-center">
					{renderSocialLinks("justify-center")}
				</div>
			</header>
		);
	}

	// Fallback para o estilo padrão
	return (
		<header className={`mb-8 w-full text-center ${classNames?.header || ""}`}>
			{renderUserImage("mx-auto mb-4 h-26 w-26 rounded-full", "112px")}
			<h1
				className={`font-bold text-2xl ${classNames?.name || ""}`}
				style={textStyle}
			>
				{user.name || user.username}
			</h1>
			{user.bio && (
				<p
					className={`mt-2 text-sm ${classNames?.bio || ""}`}
					style={textStyle}
				>
					{user.bio}
				</p>
			)}
			{renderSocialLinks("mt-4")}
		</header>
	);
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
				window.open(link.url, "_blank");
			}
			setIsOpen(false);
			setPasswordInput("");
			setError("");
		} else {
			setError("Senha incorreta. Tente novamente.");
		}
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Link Protegido</DialogTitle>
					<DialogDescription>
						Este link é protegido por senha. Por favor, insira a senha para
						continuar.
					</DialogDescription>
				</DialogHeader>
				<form className="grid gap-4 py-4" onSubmit={handleSubmit}>
					<Input
						id="password"
						onChange={(e) => setPasswordInput(e.target.value)}
						placeholder="••••••••"
						required
						type="password"
						value={passwordInput}
					/>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<BaseButton fullWidth type="submit">
						Desbloquear Link
					</BaseButton>
				</form>
			</DialogContent>
		</Dialog>
	);
}

// COMPONENTE LinksList UNIFICADO
function LinksList({
	user,
	classNames,
	buttonStyle,
	textStyle,
	customPresets,
}: {
	user: TemplateComponentProps["user"];
	classNames?: BaseTemplateProps["classNames"];
	buttonStyle?: React.CSSProperties;
	textStyle?: React.CSSProperties;
	customPresets?: BaseTemplateProps["customPresets"];
}) {
	const { animatedLinks } = useLinkAnimation();
	const textClasses = customPresets?.customTextColor
		? ""
		: classNames?.name || "";
	const cardClasses = customPresets?.customButtonFill
		? ""
		: classNames?.cardLink || "";

	const extractTextClasses = (classes: string) => {
		return classes
			.split(" ")
			.filter((cls) => cls.startsWith("text-"))
			.join(" ");
	};

	const cardTextClasses = customPresets?.customTextColor
		? ""
		: extractTextClasses(classNames?.cardLink || "");

	const renderLink = (item: UserLink) => {
		const isAnimated = animatedLinks.has(item.id.toString());
		// Se for um link, renderiza como botão
		const linkContent = (
			<div className="w-full p-3.5 text-center">
				<div className="flex h-10 items-center justify-center gap-2 px-14">
					<h4 className="line-clamp-2 font-semibold" style={textStyle}>
						{item.title}
					</h4>
					{item.badge && <Badge variant="secondary">{item.badge}</Badge>}
				</div>
			</div>
		);

		return (
			<div className={cn("mb-3 w-full")} key={item.id}>
				{item.password ? (
					<PasswordProtectedLink link={item}>
						<button
							className={cn(
								"group relative w-full",
								classNames?.cardLink,
								isAnimated && "animate-pulse"
							)}
							style={buttonStyle}
							type="button"
						>
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
								<Lock className="h-8 w-8 text-white" />
							</div>
							{linkContent}
						</button>
					</PasswordProtectedLink>
				) : (
					<InteractiveLink
						className={cn(classNames?.cardLink, isAnimated && "animate-pulse")}
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
		allContent: Array<{
			type: "link" | "text" | "video";
			item: any;
			order: number;
		}>,
		items: any[] | undefined,
		type: "link" | "text" | "video"
	) => {
		if (items && items.length > 0) {
			for (const item of items) {
				allContent.push({ type, item, order: item.order });
			}
		}
	};

	const createContentArray = () => {
		const allContent: Array<{
			type: "link" | "text" | "video";
			item: any;
			order: number;
		}> = [];

		addContentToArray(allContent, user.Link, "link");
		addContentToArray(allContent, user.Text, "text");
		addContentToArray(allContent, user.Video, "video");

		return allContent.sort((a, b) => a.order - b.order);
	};

	const renderSectionHeader = (link: any, sectionId: number, index: number) => {
		if (!link.section) {
			return null;
		}

		return (
			<div
				className="mt-8 mb-6 w-full first:mt-0"
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
		currentSectionId: { value: number | null }
	) => {
		const result: JSX.Element[] = [];
		const linkSectionId = link.sectionId || null;

		if (linkSectionId !== currentSectionId.value && linkSectionId !== null) {
			currentSectionId.value = linkSectionId;
			const sectionHeader = renderSectionHeader(link, linkSectionId, index);
			if (sectionHeader) {
				result.push(sectionHeader);
			}
		}

		result.push(renderLink(link));
		return result;
	};

	const renderTextContent = (text: any) => {
		return [
			<TextCard
				buttonStyle={buttonStyle}
				classNames={{
					...classNames,
					textClasses,
					cardClasses,
					cardTextClasses,
				}}
				customPresets={customPresets}
				key={`text-${text.id}`}
				text={text}
				textStyle={textStyle}
			/>,
		];
	};

	const renderVideoContent = (video: any) => {
		return [
			<VideoCard
				className="mb-3"
				classNames={{
					name: classNames?.name,
					bio: classNames?.bio,
				}}
				customPresets={customPresets}
				description={video.description}
				id={video.id}
				key={`video-${video.id}`}
				title={video.title}
				type={video.type}
				url={video.url}
			/>,
		];
	};

	const renderContentItem = (
		content: any,
		index: number,
		currentSectionId: { value: number | null }
	) => {
		if (content.type === "link") {
			return renderLinkContent(content.item, index, currentSectionId);
		}

		if (content.type === "text") {
			currentSectionId.value = null;
			return renderTextContent(content.item);
		}

		if (content.type === "video") {
			currentSectionId.value = null;
			return renderVideoContent(content.item);
		}

		return [];
	};

	const renderOrderedContent = () => {
		const allContent = createContentArray();

		if (allContent.length === 0) {
			return null;
		}

		const result: JSX.Element[] = [];
		const currentSectionId = { value: null as number | null };

		for (const [index, content] of allContent.entries()) {
			const contentItems = renderContentItem(content, index, currentSectionId);
			result.push(...contentItems);
		}

		return result;
	};

	return <div className="space-y-0">{renderOrderedContent()}</div>;
}

export default function BaseTemplate({
	user,
	classNames,
	children,
	customPresets,
}: BaseTemplateProps) {
	const [isShareModalOpen, setShareModalOpen] = useState(false);

	const wrapperStyle = {
		...(customPresets?.customBackgroundColor && {
			backgroundColor: customPresets.customBackgroundColor,
			backgroundImage: "none",
		}),
		...(customPresets?.customBackgroundGradient && {
			backgroundImage: customPresets.customBackgroundGradient,
		}),
		...(customPresets?.customTextColor && {
			color: customPresets.customTextColor,
		}),
		...(customPresets?.customFont && {
			fontFamily: `var(--${customPresets.customFont})`,
		}),
	};

	const textStyle = {
		...(customPresets?.customTextColor && {
			color: customPresets.customTextColor,
		}),
		...(customPresets?.customFont && {
			fontFamily: `var(--${customPresets.customFont})`,
		}),
	};

	const getButtonStyleByType = (buttonType: string) => {
		const baseStyle = {
			...(customPresets?.customButtonFill && {
				backgroundColor: customPresets.customButtonFill,
			}),
			...(customPresets?.customButtonCorners && {
				borderRadius: `${customPresets.customButtonCorners}px`,
			}),
		};

		switch (buttonType) {
			case "solid":
				return {
					...baseStyle,
					border: "none",
				};
			case "outline":
				return {
					...baseStyle,
					border: "2px solid currentColor",
				};
			case "soft":
				return {
					...baseStyle,
					border: "1px solid rgba(0,0,0,0.1)",
					filter: "opacity(0.8)",
				};
			case "shadow":
				return {
					...baseStyle,
					border: "1px solid rgba(0,0,0,0.1)",
					boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
				};
			case "neon":
				return {
					...baseStyle,
					border: "2px solid currentColor",
					boxShadow:
						"0 0 10px currentColor, inset 0 0 10px rgba(255,255,255,0.1)",
				};
			case "dashed":
				return {
					...baseStyle,
					border: "2px dashed currentColor",
				};
			case "double":
				return {
					...baseStyle,
					border: "4px double currentColor",
				};
			case "raised":
				return {
					...baseStyle,
					borderTop: "2px solid rgba(255,255,255,0.8)",
					borderLeft: "2px solid rgba(255,255,255,0.8)",
					borderRight: "1px solid rgba(0,0,0,0.2)",
					borderBottom: "1px solid rgba(0,0,0,0.2)",
					boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
				};
			case "inset":
				return {
					...baseStyle,
					borderTop: "1px solid rgba(0,0,0,0.2)",
					borderLeft: "1px solid rgba(0,0,0,0.2)",
					borderRight: "2px solid rgba(255,255,255,0.8)",
					borderBottom: "2px solid rgba(255,255,255,0.8)",
					boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.2)",
				};
			default:
				return baseStyle;
		}
	};

	const buttonStyle = getButtonStyleByType(
		customPresets?.customButton || "solid"
	);

	return (
		<>
			<div
				className={`flex min-h-dvh flex-col items-center px-3.5 ${
					customPresets?.headerStyle === "hero" ? "pt-0 pb-8" : "py-8"
				} ${classNames?.wrapper || ""}`}
				style={wrapperStyle}
			>
				<ProfileViewTracker userId={user.id} />

				{/* ShareButton posicionado de forma fixa */}
				<div className="fixed top-4 right-4 z-50">
					<ShareButton onClick={() => setShareModalOpen(true)} />
				</div>

				<main className="flex w-full max-w-md flex-grow flex-col items-center">
					<UserHeader
						classNames={classNames}
						customPresets={customPresets}
						headerStyle={customPresets?.headerStyle}
						textStyle={textStyle}
						user={user}
					/>
					<section className="w-full">
						{children ?? (
							<LinksList
								buttonStyle={buttonStyle}
								classNames={classNames}
								customPresets={customPresets}
								textStyle={textStyle}
								user={user}
							/>
						)}
					</section>
				</main>
				<footer className={`${classNames?.footer || ""}`} style={textStyle}>
					<JoinBionkModal>{user.username}</JoinBionkModal>
				</footer>
			</div>

			<ShareModal
				isOpen={isShareModalOpen}
				onOpenChange={setShareModalOpen}
				user={user}
			/>

			{/* Cookie Consent Popup */}
			<CookieConsent userId={user.id} />
		</>
	);
}

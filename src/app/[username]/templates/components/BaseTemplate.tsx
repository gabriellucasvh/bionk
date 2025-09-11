// src/app/[username]/templates/components/BaseTemplate.tsx

"use client";

import { Lock, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
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
import { cn } from "@/lib/utils";
import type { TemplateComponentProps, UserLink } from "@/types/user-profile";
import ShareModal from "./ShareModal";

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
	};
}

function ShareButton({ onClick }: { onClick: () => void }) {
	return (
		<div className="relative mb-4 flex w-full justify-end">
			<button
				aria-label="Compartilhar perfil"
				className="absolute z-50 flex items-center justify-center rounded-full border bg-white p-2 shadow transition-colors hover:bg-gray-100"
				onClick={onClick}
				type="button"
			>
				<SquareArrowOutUpRight className="size-6 text-gray-700" />
			</button>
		</div>
	);
}

function UserHeader({
	user,
	classNames,
	textStyle,
}: {
	user: TemplateComponentProps["user"];
	classNames?: BaseTemplateProps["classNames"];
	textStyle?: React.CSSProperties;
}) {
	return (
		<header className={`mb-8 w-full text-center ${classNames?.header || ""}`}>
			{user.image && (
				<div
					className={`relative mx-auto mb-4 h-26 w-26 overflow-hidden rounded-full border-2 ${
						classNames?.image || ""
					}`}
				>
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
							sizes="112px"
							src={user.image}
						/>
					)}
				</div>
			)}
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
			{Array.isArray(user.SocialLink) && user.SocialLink.length > 0 && (
				<div className="mt-4 flex items-center justify-center">
					<UserProfileSocialIcons
						className="space-x-4 space-y-1"
						iconSize={26}
						socialLinks={user.SocialLink}
						theme={classNames?.theme}
					/>
				</div>
			)}
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
			window.open(link.url, "_blank");
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

// COMPONENTE LinksList ATUALIZADO
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
	const renderLink = (link: UserLink) => {
		const linkContent = (
			<div className="w-full p-3.5 text-center">
				<div className="flex h-10 items-center justify-center gap-2 px-14">
					<h4 className="line-clamp-2 font-semibold" style={textStyle}>
						{link.title}
					</h4>
					{link.badge && <Badge variant="secondary">{link.badge}</Badge>}
				</div>
			</div>
		);

		return (
			<li className="w-full" key={link.id}>
				{link.password ? (
					<PasswordProtectedLink link={link}>
						<button
							className={cn("group relative w-full", classNames?.cardLink)}
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
						className={classNames?.cardLink}
						customPresets={customPresets}
						href={link.url}
						link={link}
						style={buttonStyle}
					>
						{linkContent}
					</InteractiveLink>
				)}
			</li>
		);
	};

	return (
		<div className="space-y-6">
			{/* CORREÇÃO: Usando 'user.Section' (maiúscula) */}
			{user.Section?.map(
				(section) =>
					section.links.length > 0 && (
						<section className="space-y-4" key={section.id}>
							<h2 className="text-center font-bold text-xl" style={textStyle}>
								{section.title}
							</h2>
							<ul className="space-y-3">{section.links.map(renderLink)}</ul>
						</section>
					)
			)}

			{/* CORREÇÃO: Usando 'user.Link' (maiúscula) */}
			{user.Link?.length > 0 && (
				<section className="space-y-4">
					<ul className="space-y-3">{user.Link.map(renderLink)}</ul>
				</section>
			)}
		</div>
	);
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
				className={`flex min-h-dvh flex-col items-center px-3.5 py-8 ${
					classNames?.wrapper || ""
				}`}
				style={wrapperStyle}
			>
				<ProfileViewTracker userId={user.id} />
				<main className="flex w-full max-w-md flex-grow flex-col items-center">
					<ShareButton onClick={() => setShareModalOpen(true)} />
					<UserHeader
						classNames={classNames}
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
		</>
	);
}

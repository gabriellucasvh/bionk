"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/JoinBionkModal";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import ProfileViewTracker from "@/components/ProfileViewTracker";
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
import { Lock, Share2 } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
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
		<div className="mb-4 flex w-full justify-end">
			<button
				aria-label="Compartilhar perfil"
				className="absolute flex items-center justify-center rounded-full border bg-white p-2 shadow transition-colors hover:bg-gray-100"
				onClick={onClick}
				type="button"
			>
				<Share2 className="size-6 text-gray-700" />
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
					className={`relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-2 ${classNames?.image || ""}`}
				>
					<Image
						alt={user.name || user.username}
						className="object-cover"
						fill
						priority
						quality={100}
						sizes="112px"
						src={user.image}
					/>
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
						className="space-x-4"
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

function LinksList({
	user,
	classNames,
	buttonStyle,
	textStyle,
}: {
	user: TemplateComponentProps["user"];
	classNames?: BaseTemplateProps["classNames"];
	buttonStyle?: React.CSSProperties;
	textStyle?: React.CSSProperties;
}) {
	const groupedLinks = useMemo(() => {
		return user.Link.reduce(
			(acc, link) => {
				const section = link.sectionTitle || "";
				if (!acc[section]) {
					acc[section] = [];
				}
				acc[section].push(link);
				return acc;
			},
			{} as Record<string, UserLink[]>
		);
	}, [user.Link]);

	return (
		<div className="space-y-6">
			{Object.entries(groupedLinks).map(([sectionTitle, links]) => (
				<section className="space-y-4" key={sectionTitle}>
					{(sectionTitle !== "" || Object.keys(groupedLinks).length === 1) && (
						<h2 className="text-center font-bold text-xl" style={textStyle}>
							{sectionTitle}
						</h2>
					)}
					<ul className="space-y-3">
						{links.map((link) => {
							const linkContent = link.isProduct ? (
								<div className="w-full overflow-hidden text-left">
									{link.productImageUrl && (
										<div className="relative h-48 w-full">
											<Image
												alt={link.title}
												className="object-cover"
												fill
												src={link.productImageUrl}
											/>
										</div>
									)}
									<div className="p-4">
										<div className="flex h-10 items-center justify-between gap-2">
											<h4
												className="line-clamp-2 font-semibold"
												style={textStyle}
											>
												{link.title}
											</h4>
											{link.badge && (
												<Badge className="flex-shrink-0" variant="secondary">
													{link.badge}
												</Badge>
											)}
										</div>
										<p className="mt-1 font-semibold text-lg" style={textStyle}>
											R$ {link.price?.toFixed(2).replace(".", ",")}
										</p>
									</div>
								</div>
							) : (
								<div className="w-full p-4 text-center">
									<div className="flex h-10 items-center justify-center gap-2 px-10">
										<h4
											className="line-clamp-2 font-semibold"
											style={textStyle}
										>
											{link.title}
										</h4>
										{link.badge && (
											<Badge variant="secondary">{link.badge}</Badge>
										)}
									</div>
								</div>
							);

							return (
								<li className="w-full" key={link.id}>
									{link.password ? (
										<PasswordProtectedLink link={link}>
											<button
												className={cn(
													"group relative w-full",
													classNames?.cardLink
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
											className={classNames?.cardLink}
											href={link.url}
											link={link}
											sensitive={link.sensitive}
											style={buttonStyle}
										>
											{linkContent}
										</InteractiveLink>
									)}
								</li>
							);
						})}
					</ul>
				</section>
			))}
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
	};

	const textStyle = {
		...(customPresets?.customTextColor && {
			color: customPresets.customTextColor,
		}),
	};
	const buttonStyle = {
		...(customPresets?.customButtonFill && {
			backgroundColor: customPresets.customButtonFill,
		}),
		...(customPresets?.customButtonCorners && {
			borderRadius: `${customPresets.customButtonCorners}px`,
		}),
	};

	return (
		<>
			<div
				className={`flex min-h-dvh flex-col items-center px-4 py-8 ${classNames?.wrapper || ""}`}
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

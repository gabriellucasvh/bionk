"use client";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import type { TemplateComponentProps } from "@/types/user-profile";
import { Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

// --- Subcomponentes ---
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
					className={`relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 ${classNames?.image || ""}`}
				>
					<Image
						alt={user.name || user.username}
						className="object-cover"
						fill
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
						className="space-x-3 sm:space-x-4"
						iconSize={22}
						socialLinks={user.SocialLink}
						theme={classNames?.theme}
					/>
				</div>
			)}
		</header>
	);
}

function LinksList({
	user,
	classNames,
	buttonStyle,
}: {
	user: TemplateComponentProps["user"];
	classNames?: BaseTemplateProps["classNames"];
	buttonStyle?: React.CSSProperties;
}) {
	return (
		<ul className="space-y-3">
			{user.Link.map((link) => (
				<li className="w-full" key={link.id}>
					<InteractiveLink
						className={
							classNames?.cardLink ||
							"transition-all duration-200 hover:scale-105"
						}
						href={link.url}
						linkId={link.id}
						sensitive={link.sensitive}
						style={buttonStyle}
					>
						{link.title}
						<span className={`block text-xs ${classNames?.link || ""}`}>
							{link.url}
						</span>
					</InteractiveLink>
				</li>
			))}
		</ul>
	);
}

// --- Componente principal ---
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
				className={`flex min-h-screen flex-col items-center px-4 py-8 ${classNames?.wrapper || ""}`}
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
								user={user}
							/>
						)}
					</section>
				</main>

				<footer
					className={`mt-10 w-full max-w-md text-center font-bold text-sm ${classNames?.footer || ""}`}
					style={textStyle}
				>
					<JoinBionkModal>{user.username}</JoinBionkModal>
				</footer>
			</div>

			{isShareModalOpen && (
				<ShareModal onClose={() => setShareModalOpen(false)} user={user} />
			)}
		</>
	);
}

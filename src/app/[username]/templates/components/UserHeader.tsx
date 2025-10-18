"use client";

import Image from "next/image";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import type { TemplateComponentProps } from "@/types/user-profile";

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
				// biome-ignore lint/performance/noImgElement: necessário para GIFs
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
							// biome-ignore lint/performance/noImgElement: necessário para GIFs
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

export default function UserHeader({
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

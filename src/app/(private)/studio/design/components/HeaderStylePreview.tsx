"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HEADER_STYLES } from "../constants/design.constants";

interface HeaderStylePreviewProps {
	style: string;
	name: string;
	username: string;
	bio: string;
	image?: string;
	backgroundImage?: string;
	backgroundColor?: string;
	textColor?: string;
	buttonColor?: string;
	buttonTextColor?: string;
	buttonStyle?: string;
	fontFamily?: string;
}

export function HeaderStylePreview({
	style,
	name,
	username,
	bio,
	image,
	backgroundImage,
	textColor,
	fontFamily,
}: HeaderStylePreviewProps) {
	const renderDefaultStyle = () => (
		<div
			className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-neutral-800 p-4 dark:bg-neutral-900"
			style={{
				backgroundImage: backgroundImage || undefined,
				backgroundSize: "cover",
				backgroundPosition: "center",
				color: textColor || undefined,
				fontFamily: fontFamily || undefined,
			}}
		>
			<Avatar className="mb-2 h-12 w-12">
				<AvatarImage alt={name} src={image} />
				<AvatarFallback>{name.charAt(0)}</AvatarFallback>
			</Avatar>
			<h3 className="mb-1 font-semibold text-neutral-100 text-sm">
				{name.length > 13 ? `${name.substring(0, 13)}...` : name}
			</h3>
			<p className="mb-2 text-neutral-300 text-xs">
				@{username.length > 13 ? `${username.substring(0, 13)}...` : username}
			</p>
			<p className="mb-3 text-center text-neutral-300 text-xs">
				{bio.length > 13 ? `${bio.substring(0, 13)}...` : bio}
			</p>
			<div className="mb-2 flex space-x-1">
				<div className="h-3 w-3 rounded-full bg-neutral-400" />
				<div className="h-3 w-3 rounded-full bg-neutral-400" />
				<div className="h-3 w-3 rounded-full bg-neutral-400" />
			</div>
		</div>
	);

	const renderHorizontalStyle = () => (
		<div
			className="flex h-full w-full items-center rounded-lg bg-neutral-800 p-4 dark:bg-neutral-900"
			style={{
				backgroundImage: backgroundImage || undefined,
				backgroundSize: "cover",
				backgroundPosition: "center",
				color: textColor || undefined,
				fontFamily: fontFamily || undefined,
			}}
		>
			<Avatar className="mr-3 h-10 w-10">
				<AvatarImage alt={name} src={image} />
				<AvatarFallback>{name.charAt(0)}</AvatarFallback>
			</Avatar>
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-semibold text-neutral-100 text-xs">
					{name.length > 10 ? `${name.substring(0, 10)}...` : name}
				</h3>
				<p className="truncate text-neutral-300 text-xs">
					@{username.length > 10 ? `${username.substring(0, 10)}...` : username}
				</p>
				<p className="truncate text-neutral-300 text-xs">
					{bio.length > 15 ? `${bio.substring(0, 15)}...` : bio}
				</p>
				<div className="mt-1 flex space-x-1">
					<div className="h-2 w-2 rounded-full bg-neutral-400" />
					<div className="h-2 w-2 rounded-full bg-neutral-400" />
					<div className="h-2 w-2 rounded-full bg-neutral-400" />
				</div>
			</div>
		</div>
	);

	const renderHeroStyle = () => (
		<div
			className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-lg p-4"
			style={{
				backgroundImage: image
					? `url(${image})`
					: backgroundImage ||
						"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				fontFamily: fontFamily || undefined,
			}}
		>
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
			<div className="relative z-10 flex flex-col items-center text-center">
				<h3 className="mb-1 font-bold text-sm text-white">
					{name.length > 13 ? `${name.substring(0, 13)}...` : name}
				</h3>
				<p className="mb-1 text-white/80 text-xs">
					@{username.length > 13 ? `${username.substring(0, 13)}...` : username}
				</p>
				<p className="mb-2 text-white/70 text-xs">
					{bio.length > 13 ? `${bio.substring(0, 13)}...` : bio}
				</p>
				<div className="flex space-x-1">
					<div className="h-2 w-2 rounded-full bg-white/60" />
					<div className="h-2 w-2 rounded-full bg-white/60" />
					<div className="h-2 w-2 rounded-full bg-white/60" />
				</div>
			</div>
		</div>
	);

	switch (style) {
		case "horizontal":
			return renderHorizontalStyle();
		case "hero":
			return renderHeroStyle();
		default:
			return renderDefaultStyle();
	}
}

export function HeaderStyleButtons({
	selectedStyle,
	onStyleChange,
	name,
	username,
	bio,
	image,
	backgroundImage,
	backgroundColor,
	textColor,
	buttonColor,
	buttonTextColor,
	buttonStyle,
	fontFamily,
}: {
	selectedStyle: string;
	onStyleChange: (style: string) => void;
	name: string;
	username: string;
	bio: string;
	image?: string;
	backgroundImage?: string;
	backgroundColor?: string;
	textColor?: string;
	buttonColor?: string;
	buttonTextColor?: string;
	buttonStyle?: string;
	fontFamily?: string;
}) {
	return (
		<div className="max-w-full overflow-x-auto overscroll-x-contain px-1">
			<div className="flex snap-x snap-mandatory gap-3">
				{HEADER_STYLES.map((style) => (
					<button
						className={`relative w-32 flex-shrink-0 snap-start rounded-lg border-2 p-2 transition-all duration-200 md:w-36 lg:w-40 ${
							selectedStyle === style.value
								? "border-green-500 bg-green-50 dark:bg-green-950"
								: "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
						}`}
						key={style.value}
						onClick={() => onStyleChange(style.value)}
						type="button"
					>
						<div className="h-48 w-full md:h-52 lg:h-56">
							<HeaderStylePreview
								backgroundColor={backgroundColor}
								backgroundImage={backgroundImage}
								bio={bio}
								buttonColor={buttonColor}
								buttonStyle={buttonStyle}
								buttonTextColor={buttonTextColor}
								fontFamily={fontFamily}
								image={image}
								name={name}
								style={style.value}
								textColor={textColor}
								username={username}
							/>
						</div>
						<p className="mt-2 text-center font-medium text-neutral-700 text-xs dark:text-neutral-300">
							{style.label}
						</p>
					</button>
				))}
			</div>
		</div>
	);
}

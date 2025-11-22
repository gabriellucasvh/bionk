import type React from "react";
import VideoPlayer from "@/components/VideoPlayer";
import type { CustomPresets } from "./utils/style";
import { toForeground } from "./utils/style";

interface VideoCardProps {
	id: number;
	title?: string;
	description?: string;
	type: string;
	url: string;
	className?: string;
	classNames?: {
		name?: string;
		bio?: string;
	};
	customPresets?: CustomPresets;
}

export default function VideoCard({
	title,
	description,
	type,
	url,
	className = "",
	classNames,
	customPresets,
}: VideoCardProps) {
	const isTikTok = type === "tiktok";
	const videoContainerClass = isTikTok ? "flex justify-center" : "";
	const videoPlayerClass = isTikTok ? "max-w-sm" : "";

	const displayTitle =
		title && title.length > 640 ? `${title.slice(0, 640)}...` : title;
	const displayDescription =
		description && description.length > 1000
			? `${description.slice(0, 1000)}...`
			: description;

	const cornerValue = customPresets?.customButtonCorners || "12";
	const buttonColor = customPresets?.customButtonColor || "#ffffff";
	const textColorButton = customPresets?.customButtonTextColor || "#000000";
	const descColor = toForeground(textColorButton, 0.8);

	const hasInfoArea = !!(displayTitle || displayDescription);
	const topRadiusStyle = {
		borderTopLeftRadius: `${cornerValue}px`,
		borderTopRightRadius: `${cornerValue}px`,
	} as React.CSSProperties;
	const bottomRadiusStyle = {
		borderBottomLeftRadius: `${cornerValue}px`,
		borderBottomRightRadius: `${cornerValue}px`,
	} as React.CSSProperties;

	return (
		<div className={`w-full pb-4 ${className}`}>
			<div className={videoContainerClass}>
				<div
					className="overflow-hidden"
					style={hasInfoArea ? topRadiusStyle : undefined}
				>
					<VideoPlayer
						className={
							hasInfoArea
								? `rounded-none ${videoPlayerClass}`
								: videoPlayerClass
						}
						customButtonCorners={
							hasInfoArea ? undefined : customPresets?.customButtonCorners
						}
						title={title}
						type={type}
						url={url}
					/>
				</div>
			</div>
			{hasInfoArea && (
				<div
					className="px-4 py-3 text-center"
					style={{ backgroundColor: buttonColor, ...bottomRadiusStyle }}
				>
					{displayTitle && (
						<h3
							className={`font-bold text-lg ${classNames?.name || ""}`}
							style={{ color: textColorButton }}
						>
							{displayTitle}
						</h3>
					)}
					{displayDescription && (
						<p
							className={`mt-1 ${classNames?.bio || ""}`}
							style={{ color: descColor }}
						>
							{displayDescription}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

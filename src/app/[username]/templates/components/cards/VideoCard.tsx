import type React from "react";
import VideoPlayer from "@/components/VideoPlayer";
import type { CustomPresets } from "./utils/style";
import { buildCompactButtonStyle, toForeground } from "./utils/style";

interface VideoCardProps {
	id: number;
	title?: string;
	description?: string;
	type: string;
	url: string;
	thumbnailUrl?: string | null;
	className?: string;
	classNames?: {
		name?: string;
		bio?: string;
	};
	customPresets?: CustomPresets;
	onPlayClick?: () => void;
}

export default function VideoCard({
	title,
	description,
	type,
	url,
	thumbnailUrl,
	className = "",
	classNames,
	customPresets,
	onPlayClick,
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
	const fullRadiusStyle = {
		borderTopLeftRadius: `${cornerValue}px`,
		borderTopRightRadius: `${cornerValue}px`,
		borderBottomLeftRadius: `${cornerValue}px`,
		borderBottomRightRadius: `${cornerValue}px`,
	} as React.CSSProperties;

	const baseStyle = customPresets
		? (buildCompactButtonStyle(customPresets) as any)
		: ({ backgroundColor: buttonColor } as any);
	const baseBorder = (baseStyle as any).border;
	const baseBg = (baseStyle as any).backgroundColor;

	const topStyle: React.CSSProperties = {
		...(hasInfoArea ? topRadiusStyle : fullRadiusStyle),
		backgroundColor: baseBg,
	};
	if (baseBorder) {
		if (hasInfoArea) {
			(topStyle as any).borderTop = baseBorder;
			(topStyle as any).borderLeft = baseBorder;
			(topStyle as any).borderRight = baseBorder;
		} else {
			(topStyle as any).border = baseBorder;
		}
	}

	return (
		<div className={`w-full pb-4 ${className}`}>
			<div
				className={`${videoContainerClass} overflow-hidden`}
				style={topStyle}
			>
				<VideoPlayer
					className={
						hasInfoArea ? `rounded-none ${videoPlayerClass}` : videoPlayerClass
					}
					customButtonCorners={
						hasInfoArea ? undefined : customPresets?.customButtonCorners
					}
					onPlayClick={onPlayClick}
					thumbnailUrl={thumbnailUrl || undefined}
					title={title}
					type={type}
					url={url}
				/>
			</div>
			{hasInfoArea && (
				<div
					className="px-4 py-3 text-center"
					style={{
						...(() => {
							const infoAreaBaseStyle = customPresets
								? buildCompactButtonStyle(customPresets)
								: { backgroundColor: buttonColor };
							const { border: infoAreaBorder, ...infoAreaRest } =
								infoAreaBaseStyle as any;
							const style: React.CSSProperties = {
								...infoAreaRest,
								borderRadius: 0,
								...bottomRadiusStyle,
								borderTop: "none",
							};
							if (infoAreaBorder) {
								(style as any).borderLeft = infoAreaBorder;
								(style as any).borderRight = infoAreaBorder;
								(style as any).borderBottom = infoAreaBorder;
							}
							const btnStyle = customPresets?.customButtonStyle || "";
							if (btnStyle === "neon") {
								style.boxShadow = `0 4px 8px ${buttonColor}40`;
							} else if (btnStyle === "shadow") {
								style.boxShadow = "0 4px 6px rgba(0,0,0,0.12)";
							} else if (btnStyle === "raised" || btnStyle === "inset") {
								style.boxShadow = "none";
							}
							return style;
						})(),
					}}
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

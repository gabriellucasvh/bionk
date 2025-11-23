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

	return (
		<div className={`w-full pb-4 ${className}`}>
			<div
				className={`${videoContainerClass} overflow-hidden bg-black`}
				style={hasInfoArea ? topRadiusStyle : fullRadiusStyle}
			>
                <VideoPlayer
                    className={
                        hasInfoArea ? `rounded-none ${videoPlayerClass}` : videoPlayerClass
                    }
                    customButtonCorners={
                        hasInfoArea ? undefined : customPresets?.customButtonCorners
                    }
                    title={title}
                    type={type}
                    url={url}
                    thumbnailUrl={thumbnailUrl || undefined}
                    onPlayClick={onPlayClick}
                />
			</div>
			{hasInfoArea && (
				<div
					className="px-4 py-3 text-center"
					style={{
						...(() => {
							const baseStyle = customPresets
								? buildCompactButtonStyle(customPresets)
								: { backgroundColor: buttonColor };
							const { border: baseBorder, ...restBase } = baseStyle as any;
							const style: React.CSSProperties = {
								...restBase,
								borderRadius: 0,
								...bottomRadiusStyle,
								borderTop: "none",
							};
							if (baseBorder) {
								(style as any).borderLeft = baseBorder;
								(style as any).borderRight = baseBorder;
								(style as any).borderBottom = baseBorder;
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

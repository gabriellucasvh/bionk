import VideoPlayer from "./VideoPlayer";

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
	customPresets?: {
		customBackgroundColor?: string;
		customBackgroundGradient?: string;
		customTextColor?: string;
		customFont?: string;
		customButton?: string;
		customButtonFill?: string;
		customButtonCorners?: string;
		customButtonColor?: string;
	};
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
	const videoContainerClass = isTikTok
		? "flex justify-center"
		: "";
	const videoPlayerClass = isTikTok
		? "max-w-sm"
		: "";

	const getTitleClasses = () => {
		if (customPresets?.customTextColor) {
			return "text-center font-extrabold text-lg";
		}
		return `text-center font-extrabold text-lg ${classNames?.name || "text-gray-900 dark:text-white"}`;
	};

	const getDescriptionClasses = () => {
		if (customPresets?.customTextColor) {
			return "text-center";
		}
		return `text-center ${classNames?.bio || "text-gray-600 dark:text-gray-300"}`;
	};

	const textStyle = customPresets?.customTextColor
		? { color: customPresets.customTextColor }
		: {};

	const displayTitle = title && title.length > 64
		? `${title.slice(0, 64)}...`
		: title;

	const displayDescription = description && description.length > 100
		? `${description.slice(0, 100)}...`
		: description;

	return (
		<div className={`w-full space-y-2 pb-4 ${className}`}>
			{displayTitle && (
				<h3 className={getTitleClasses()} style={textStyle}>
					{displayTitle}
				</h3>
			)}

			{displayDescription && (
				<p className={getDescriptionClasses()} style={textStyle}>
					{displayDescription}
				</p>
			)}

			<div className={videoContainerClass}>
				<VideoPlayer
					className={videoPlayerClass}
					customButtonCorners={customPresets?.customButtonCorners}
					title={title}
					type={type}
					url={url}
				/>
			</div>
		</div>
	);
}

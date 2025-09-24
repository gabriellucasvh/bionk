import VideoPlayer from "./VideoPlayer";

interface VideoCardProps {
	id: number;
	title?: string;
	description?: string;
	type: string;
	url: string;
	className?: string;
	customPresets?: {
		customButtonCorners?: string;
	};
}

export default function VideoCard({
	title,
	description,
	type,
	url,
	className = "",
	customPresets,
}: VideoCardProps) {
	return (
		<div className={`w-full space-y-2 pb-4 ${className}`}>
			{title && (
				<h3 className="text-center font-semibold text-gray-900 text-lg dark:text-white">
					{title}
				</h3>
			)}

			{description && (
				<p className="text-center text-gray-600 dark:text-gray-300">
					{description}
				</p>
			)}

			<VideoPlayer 
				customButtonCorners={customPresets?.customButtonCorners}
				title={title} 
				type={type} 
				url={url} 
			/>
		</div>
	);
}

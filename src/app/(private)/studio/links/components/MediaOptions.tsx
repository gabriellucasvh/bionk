"use client";

import { Video } from "lucide-react";
import Image from "next/image";

interface MediaOptionsProps {
	onOptionSelect: (
		option: "video" | "youtube" | "vimeo" | "tiktok" | "twitch"
	) => void;
}

const MediaOptions = ({ onOptionSelect }: MediaOptionsProps) => {
	return (
		<div className="space-y-6 py-4">
			<div className="mx-auto grid max-w-md grid-cols-2 gap-4">
				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("video")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-white">
						<Video
							className="h-8 w-8 brightness-0 invert filter"
							strokeWidth={1.5}
						/>
					</div>
					<span className="font-medium text-sm">Vídeo</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("youtube")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
						<Image
							alt="YouTube"
							className="h-8 w-8 brightness-0 invert filter"
							height={32}
							src="/icons/youtube.svg"
							width={32}
						/>
					</div>
					<span className="font-medium text-sm">YouTube</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("vimeo")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
						<Image
							alt="Vimeo"
							className="h-8 w-8 brightness-0 invert filter"
							height={32}
							src="/icons/vimeo.svg"
							width={32}
						/>
					</div>
					<span className="font-medium text-sm">Vimeo</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("tiktok")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
						<Image
							alt="TikTok"
							className="h-8 w-8 brightness-0 invert filter"
							height={32}
							src="/icons/tiktok.svg"
							width={32}
						/>
					</div>
					<span className="font-medium text-sm">TikTok</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("twitch")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
						<Image
							alt="Twitch"
							className="h-8 w-8 brightness-0 invert filter"
							height={32}
							src="/icons/twitch.svg"
							width={32}
						/>
					</div>
					<span className="font-medium text-sm">Twitch</span>
				</button>
			</div>
		</div>
	);
};

export default MediaOptions;

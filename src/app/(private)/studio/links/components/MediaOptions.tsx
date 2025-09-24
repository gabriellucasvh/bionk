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
		<div>
			<div className="grid grid-cols-3 gap-4">
				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("video")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500">
						<Video className="h-6 w-6 text-white" />
					</div>
					<span className="font-medium text-sm">Vídeo</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("youtube")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
						<Image
							alt="YouTube"
							className="brightness-0 invert"
							height={24}
							src="/icons/youtube.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">YouTube</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("vimeo")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
						<Image
							alt="Vimeo"
							className="brightness-0 invert"
							height={24}
							src="/icons/vimeo.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">Vimeo</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("tiktok")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-black">
						<Image
							alt="TikTok"
							className="brightness-0 invert"
							height={24}
							src="/icons/tiktok.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">TikTok</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("twitch")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600">
						<Image
							alt="Twitch"
							className="brightness-0 invert"
							height={24}
							src="/icons/twitch.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">Twitch</span>
				</button>
			</div>
		</div>
	);
};

export default MediaOptions;

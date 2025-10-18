"use client";

import Image from "next/image";

interface VideoOptionsProps {
	onOptionSelect: (
		option: "video" | "youtube" | "vimeo" | "tiktok" | "twitch"
	) => void;
}

const VideoOptions = ({ onOptionSelect }: VideoOptionsProps) => {
	return (
		<div>
			<div className="grid grid-cols-3 gap-4">
				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("video")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Vídeo"
							className="object-cover"
							fill
							src="/images/video.png"
						/>
					</div>
					<span className="font-medium text-sm">Vídeo</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("youtube")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border bg-red-500"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="YouTube"
							className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 brightness-0 invert"
							height={24}
							src="/icons/youtube.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">YouTube</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("vimeo")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border bg-blue-600"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Vimeo"
							className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 brightness-0 invert"
							height={24}
							src="/icons/vimeo.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">Vimeo</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("tiktok")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border bg-black"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="TikTok"
							className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 brightness-0 invert"
							height={24}
							src="/icons/tiktok.svg"
							width={24}
						/>
					</div>
					<span className="font-medium text-sm">TikTok</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("twitch")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border bg-violet-600"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Twitch"
							className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 brightness-0 invert"
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

export default VideoOptions;

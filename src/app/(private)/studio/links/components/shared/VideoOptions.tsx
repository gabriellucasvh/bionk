"use client";

import Image from "next/image";

interface VideoOptionsProps {
	onOptionSelect: (
		option: "video" | "youtube" | "vimeo" | "tiktok" | "twitch clip"
	) => void;
}

type Option = {
	value: "video" | "youtube" | "vimeo" | "tiktok" | "twitch clip";
	title: string;
	description: string;
	imageSrc: string;
	bg: string;
};

const OptionItem = ({
	opt,
	onSelect,
}: {
	opt: Option;
	onSelect: (v: Option["value"]) => void;
}) => {
	return (
		<button
			className="relative flex w-full max-w-full items-center justify-between gap-4 overflow-hidden py-2 transition-colors"
			onClick={() => onSelect(opt.value)}
			type="button"
		>
			<div className="flex items-center gap-4">
				<div
					className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}
				>
					<Image
						alt={opt.title}
						className="object-contain p-2 invert"
						fill
						src={opt.imageSrc}
					/>
				</div>
				<div className="flex min-w-0 max-w-md flex-1 flex-col">
					<span className="text-left font-medium">{opt.title}</span>
					<span className="max-w-md truncate break-words text-left font-normal text-gray-500 text-sm dark:text-gray-300">
						{opt.description}
					</span>
				</div>
			</div>
			<div
				className={
					"-translate-y-1/2 absolute top-1/2 right-0 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background dark:from-transparent dark:via-zinc-900 dark:to-zinc-900"
				}
			>
				<svg
					aria-hidden="true"
					className="text-black dark:text-white"
					fill="none"
					height="20"
					viewBox="0 0 24 24"
					width="20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Seta para a direita</title>
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					/>
				</svg>
			</div>
		</button>
	);
};

const VideoOptions = ({ onOptionSelect }: VideoOptionsProps) => {
	const options: Option[] = [
		{
			value: "video",
			title: "Vídeo",
			description: "Vídeos direto na sua página, sem sair.",
			imageSrc: "/icons/video.svg",
			bg: "bg-yellow-300",
		},
		{
			value: "youtube",
			title: "YouTube",
			description: "Mostre vídeos do YouTube direto no seu Link.",
			imageSrc: "/icons/youtube.svg",
			bg: "bg-red-500",
		},
		{
			value: "tiktok",
			title: "TikTok",
			description: "Destaque um TikTok ou incorpore vídeos do TikTok.",
			imageSrc: "/icons/tiktok.svg",
			bg: "bg-black",
		},
		{
			value: "vimeo",
			title: "Vimeo",
			description: "Compartilhe vídeos do Vimeo e assista sem sair.",
			imageSrc: "/icons/vimeo.svg",
			bg: "bg-blue-600",
		},
		{
			value: "twitch clip",
			title: "Twitch Clip",
			description: "Integre clipes da Twitch.",
			imageSrc: "/icons/twitch.svg",
			bg: "bg-violet-600",
		},
	];

	return (
		<div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
			{options.map((opt) => (
				<OptionItem
					key={opt.value}
					onSelect={(v) => onOptionSelect(v)}
					opt={opt}
				/>
			))}
		</div>
	);
};

export default VideoOptions;

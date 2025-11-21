"use client";

import Image from "next/image";

interface MusicOptionsProps {
	onOptionSelect: (
		option: "spotify" | "deezer" | "apple" | "soundcloud" | "audiomack"
	) => void;
}

type Option = {
	value: "spotify" | "deezer" | "apple" | "soundcloud" | "audiomack";
	title: string;
	description: string;
	imageSrc?: string;
	bg: string;
	useSvg?: boolean;
	invert?: boolean;
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
						className={`object-contain p-2 ${opt.invert ? "invert" : ""}`}
						fill
						src={opt.imageSrc || ""}
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

const MusicOptions = ({ onOptionSelect }: MusicOptionsProps) => {
	const options: Option[] = [
		{
			value: "spotify",
			title: "Spotify",
			description: "Adicione uma faixa ou álbum do Spotify.",
			imageSrc: "/icons/spotify.svg",
			bg: "bg-[#1ED760]",
			invert: false,
		},
		{
			value: "deezer",
			title: "Deezer",
			description: "Compartilhe músicas do Deezer no seu Link.",
			imageSrc: "/icons/deezer.png",
			bg: "bg-white",
			invert: false,
		},
		{
			value: "apple",
			title: "Apple Music",
			description: "Exiba conteúdo do Apple Music.",
			imageSrc: "/icons/applemusic.svg",
			bg: "bg-[#FA243C]",
			invert: true,
		},
		{
			value: "soundcloud",
			title: "SoundCloud",
			description: "Incorpore faixas do SoundCloud.",
			imageSrc: "/icons/soundcloud.svg",
			bg: "bg-[#ff5500]",
			invert: true,
		},
		{
			value: "audiomack",
			title: "Audiomack",
			description: "Integre conteúdos do Audiomack.",
			bg: "bg-neutral-900",
			imageSrc: "/icons/audiomack.svg",
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

export default MusicOptions;

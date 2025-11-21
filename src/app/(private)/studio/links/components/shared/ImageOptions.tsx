"use client";

import {
	GalleryHorizontal,
	GalleryVertical,
	Image as ImageIcon,
} from "lucide-react";

interface ImageOptionsProps {
	onOptionSelect: (
		option: "image_single" | "image_column" | "image_carousel"
	) => void;
}

type Option = {
	value: "image_single" | "image_column" | "image_carousel";
	title: string;
	description: string;
	bg: string;
	renderIcon: () => JSX.Element;
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
					{opt.renderIcon()}
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

const ImageOptions = ({ onOptionSelect }: ImageOptionsProps) => {
	const options: Option[] = [
		{
			value: "image_single",
			title: "Única",
			description: "Uma única imagem destacada.",
			bg: "bg-teal-400",
			renderIcon: () => (
				<ImageIcon className="h-6 w-6 text-black" strokeWidth={1.5} />
			),
		},
		{
			value: "image_column",
			title: "Coluna",
			description: "Imagens empilhadas em coluna.",
			bg: "bg-yellow-400",
			renderIcon: () => (
				<GalleryVertical className="h-6 w-6 text-black" strokeWidth={1.5} />
			),
		},
		{
			value: "image_carousel",
			title: "Carrossel",
			description: "Várias imagens em carrossel.",
			bg: "bg-pink-400",
			renderIcon: () => (
				<GalleryHorizontal className="h-6 w-6 text-black" strokeWidth={1.5} />
			),
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

export default ImageOptions;

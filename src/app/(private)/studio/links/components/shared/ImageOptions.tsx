"use client";

import { Columns, GalleryHorizontal, GalleryVertical, Image as ImageIcon, Rows } from "lucide-react";

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

const OptionItem = ({ opt, onSelect }: { opt: Option; onSelect: (v: Option["value"]) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(opt.value)}
            className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 transition-colors  overflow-hidden"
        >
            <div className="flex items-center gap-4">
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}>
                    {opt.renderIcon()}
                </div>
                <div className="flex min-w-0 flex-1 flex-col  max-w-md">
                    <span className="font-medium text-left">{opt.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">
                        {opt.description}
                    </span>
                </div>
            </div>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900`}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-black dark:text-white"
                >
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            renderIcon: () => <ImageIcon className="h-6 w-6 text-black" strokeWidth={1.5} />,
        },
        {
            value: "image_column",
            title: "Coluna",
            description: "Imagens empilhadas em coluna.",
            bg: "bg-yellow-400",
            renderIcon: () => <GalleryVertical className="h-6 w-6 text-black" strokeWidth={1.5} />,
        },
        {
            value: "image_carousel",
            title: "Carrossel",
            description: "Várias imagens em carrossel.",
            bg: "bg-pink-400",
            renderIcon: () => <GalleryHorizontal className="h-6 w-6 text-black" strokeWidth={1.5} />,
        },
    ];

    return (
        <div className="flex w-full max-w-full flex-col gap-2">
            {options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} onSelect={(v) => onOptionSelect(v)} />
            ))}
        </div>
    );
};

export default ImageOptions;

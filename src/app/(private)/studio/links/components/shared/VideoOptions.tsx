"use client";

import Image from "next/image";

interface VideoOptionsProps {
    onOptionSelect: (
        option: "video" | "youtube" | "vimeo" | "tiktok" | "twitch"
    ) => void;
}

type Option = {
    value: "video" | "youtube" | "vimeo" | "tiktok" | "twitch";
    title: string;
    description: string;
    imageSrc: string;
    bg: string;
};

const OptionItem = ({ opt, onSelect }: { opt: Option; onSelect: (v: Option["value"]) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(opt.value)}
            className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 transition-colors  overflow-hidden"
        >
            <div className="flex items-center gap-4">
                <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}
                >
                    <Image alt={opt.title} src={opt.imageSrc} fill className="object-contain p-2 invert" />
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

const VideoOptions = ({ onOptionSelect }: VideoOptionsProps) => {
    const options: Option[] = [
        {
            value: "video",
            title: "Vídeo",
            description:
                "Vídeos direto na sua página, sem sair.",
            imageSrc: "/icons/video.svg",
            bg: "bg-yellow-300",
        },
        {
            value: "youtube",
            title: "YouTube",
            description:
                "Mostre vídeos do YouTube direto no seu Link.",
            imageSrc: "/icons/youtube.svg",
            bg: "bg-red-500",
        },
        {
            value: "tiktok",
            title: "TikTok",
            description:
                "Destaque um TikTok ou incorpore vídeos do TikTok.",
            imageSrc: "/icons/tiktok.svg",
            bg: "bg-black",
        },
        {
            value: "vimeo",
            title: "Vimeo",
            description:
                "Compartilhe vídeos do Vimeo e assista sem sair.",
            imageSrc: "/icons/vimeo.svg",
            bg: "bg-blue-600",
        },
        {
            value: "twitch",
            title: "Twitch",
            description: "Integre transmissões ou clipes da Twitch.",
            imageSrc: "/icons/twitch.svg",
            bg: "bg-violet-600",
        },
    ];

    return (
        <div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
            {options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} onSelect={(v) => onOptionSelect(v)} />
            ))}
        </div>
    );
};

export default VideoOptions;

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

const OptionItem = ({ opt, onSelect }: { opt: Option; onSelect: (v: Option["value"]) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(opt.value)}
            className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 transition-colors hover:bg-gray-50 overflow-hidden"
        >
            <div className="flex items-center gap-4">
                <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}
                >

                        <Image alt={opt.title} src={opt.imageSrc || ""} fill className={`object-contain p-2 ${opt.invert ? "invert" : ""}`} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col  max-w-md">
                    <span className="font-medium text-left">{opt.title}</span>
                    <span className="text-sm text-gray-500 truncate break-words max-w-md font-normal text-left">
                        {opt.description}
                    </span>
                </div>
            </div>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background`}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-black"
                >
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="flex w-full max-w-full flex-col gap-2">
            {options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} onSelect={(v) => onOptionSelect(v)} />
            ))}
        </div>
    );
};

export default MusicOptions;


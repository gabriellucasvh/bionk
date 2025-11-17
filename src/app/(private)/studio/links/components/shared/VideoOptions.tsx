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
                    className="flex flex-col items-center gap-2 rounded-2xl p-6"
                    onClick={() => onOptionSelect("video")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border transition-colors hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Vídeo"
                            className="object-cover"
                            fill
                            src="/images/video-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Vídeo</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("youtube")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-red-500 transition-colors hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="YouTube"
                            className="object-cover"
                            fill
                            src="/images/youtube-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">YouTube</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("vimeo")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-blue-600 transition-colors hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Vimeo"
                            className="object-cover"
                            fill
                            src="/images/vimeo-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Vimeo</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("tiktok")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-black transition-colors hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="TikTok"
                            className="object-cover"
                            fill
                            src="/images/tiktok-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">TikTok</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("twitch")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-violet-600 transition-colors hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Twitch"
                            className="object-cover"
                            fill
                            src="/images/twitch-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Twitch</span>
                </button>
            </div>
        </div>
    );
};

export default VideoOptions;
"use client";

import Image from "next/image";

interface ImageOptionsProps {
    onOptionSelect: (
        option: "image_single" | "image_column" | "image_carousel"
    ) => void;
}

const ImageOptions = ({ onOptionSelect }: ImageOptionsProps) => {
    return (
        <div>
            <div className="grid grid-cols-3 gap-4">
                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("image_single")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Imagem Única"
                            className="object-cover"
                            fill
                            src="/images/única-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Única</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("image_column")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Imagem em Coluna"
                            className="object-cover"
                            fill
                            src="/images/coluna-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Coluna</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl p-6 "
                    onClick={() => onOptionSelect("image_carousel")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border hover:brightness-110"
                        style={{ aspectRatio: "6 / 7" }}
                    >
                        <Image
                            alt="Imagem em Carrossel"
                            className="object-cover"
                            fill
                            src="/images/carrossel-content.png"
                        />
                    </div>
                    <span className="font-medium text-sm">Carrossel</span>
                </button>
            </div>
        </div>
    );
};

export default ImageOptions;
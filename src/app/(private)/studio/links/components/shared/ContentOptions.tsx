"use client";

import { Layers2, Plus, Type } from "lucide-react";

interface ContentOptionsProps {
    onOptionSelect: (option: "link" | "section" | "text") => void;
}

const ContentOptions = ({ onOptionSelect }: ContentOptionsProps) => {
    return (
        <div>
            <div className="grid grid-cols-3 gap-4">
                <button
                    className="flex flex-col items-center gap-2 rounded-2xl "
                    onClick={() => onOptionSelect("link")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-avocado-400 transition-all hover:ring-2 hover:ring-black ring-offset-2 duration-300"
                        style={{ aspectRatio: "7 / 7" }}
                    >
                        <Plus className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 text-black" />
                    </div>
                    <span className="font-medium text-sm">Link</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl "
                    onClick={() => onOptionSelect("section")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-gray-200 transition-all hover:ring-2 hover:ring-black ring-offset-2 duration-300"
                        style={{ aspectRatio: "7 / 7" }}
                    >
                        <Layers2 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 text-gray-600" />
                    </div>
                    <span className="font-medium text-sm">Seção</span>
                </button>

                <button
                    className="flex flex-col items-center gap-2 rounded-2xl "
                    onClick={() => onOptionSelect("text")}
                    type="button"
                >
                    <div
                        className="relative w-20 overflow-hidden rounded-2xl border bg-blue-500 transition-all hover:ring-2 hover:ring-black ring-offset-2 duration-300"
                        style={{ aspectRatio: "7 / 7" }}
                    >
                        <Type className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium text-sm">Texto</span>
                </button>
            </div>
        </div>
    );
};

export default ContentOptions;

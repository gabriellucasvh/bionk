"use client";

import { Image as ImageIcon, Music, Plus, Ticket, Video } from "lucide-react";

interface CategorySelectorProps {
    selectedCategory: "content" | "video" | "image" | "music" | "event" | null;
    onCategorySelect: (
        category: "content" | "video" | "image" | "music" | "event"
    ) => void;
}

const CategorySelector = ({
    selectedCategory,
    onCategorySelect,
}: CategorySelectorProps) => {
    return (
        <div className="space-y-2">
            <button
                aria-pressed={selectedCategory === "content"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 dark:hover:bg-zinc-700 ${
                    selectedCategory === "content"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                        : ""
                }`}
                onClick={() => onCategorySelect("content")}
                type="button"
            >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Conteúdo</span>
            </button>

            <button
                aria-pressed={selectedCategory === "video"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 dark:hover:bg-zinc-700 ${
                    selectedCategory === "video"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                        : ""
                }`}
                onClick={() => onCategorySelect("video")}
                type="button"
            >
                <Video className="h-5 w-5" />
                <span className="font-medium">Vídeo</span>
            </button>

            <button
                aria-pressed={selectedCategory === "music"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 dark:hover:bg-zinc-700 ${
                    selectedCategory === "music"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                        : ""
                }`}
                onClick={() => onCategorySelect("music")}
                type="button"
            >
                <Music className="h-5 w-5" />
                <span className="font-medium">Música</span>
            </button>

            <button
                aria-pressed={selectedCategory === "image"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 dark:hover:bg-zinc-700 ${
                    selectedCategory === "image"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                        : ""
                }`}
                onClick={() => onCategorySelect("image")}
                type="button"
            >
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">Imagem</span>
            </button>

            <button
                aria-pressed={selectedCategory === "event"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 dark:hover:bg-zinc-700 ${
                    selectedCategory === "event"
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white"
                        : ""
                }`}
                onClick={() => onCategorySelect("event")}
                type="button"
            >
                <Ticket className="h-5 w-5" />
                <span className="font-medium">Eventos</span>
            </button>
        </div>
    );
};

export default CategorySelector;

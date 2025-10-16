"use client";

import { Image as ImageIcon, Plus, Video } from "lucide-react";

interface CategorySelectorProps {
    selectedCategory: "content" | "video" | "image" | null;
    onCategorySelect: (category: "content" | "video" | "image") => void;
}

const CategorySelector = ({
    selectedCategory,
    onCategorySelect,
}: CategorySelectorProps) => {
    return (
        <div className="space-y-2">
            <button
                aria-pressed={selectedCategory === "content"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 dark:hover:bg-neutral-700 ${
                    selectedCategory === "content"
                        ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300"
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
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 dark:hover:bg-neutral-700 ${
                    selectedCategory === "video"
                        ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300"
                        : ""
                }`}
                onClick={() => onCategorySelect("video")}
                type="button"
            >
                <Video className="h-5 w-5" />
                <span className="font-medium">Vídeo</span>
            </button>

            <button
                aria-pressed={selectedCategory === "image"}
                className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 dark:hover:bg-neutral-700 ${
                    selectedCategory === "image"
                        ? "bg-neutral-200 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300"
                        : ""
                }`}
                onClick={() => onCategorySelect("image")}
                type="button"
            >
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">Imagem</span>
            </button>
        </div>
    );
};

export default CategorySelector;

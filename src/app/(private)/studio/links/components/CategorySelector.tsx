"use client";

import { Play, Plus } from "lucide-react";

interface CategorySelectorProps {
	selectedCategory: "content" | "media" | null;
	onCategorySelect: (category: "content" | "media") => void;
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
				aria-pressed={selectedCategory === "media"}
				className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 dark:hover:bg-neutral-700 ${
					selectedCategory === "media"
						? "bg-neutral-200 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300"
						: ""
				}`}
				onClick={() => onCategorySelect("media")}
				type="button"
			>
				<Play className="h-5 w-5" />
				<span className="font-medium">Mídia</span>
			</button>
		</div>
	);
};

export default CategorySelector;

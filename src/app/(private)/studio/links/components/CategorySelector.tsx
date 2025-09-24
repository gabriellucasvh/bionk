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
				className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50 ${
					selectedCategory === "content" ? "bg-muted" : ""
				}`}
				onClick={() => onCategorySelect("content")}
				type="button"
			>
				<Plus className="h-5 w-5" />
				<span className="font-medium">Conteúdo</span>
			</button>

			<button
				className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50 ${
					selectedCategory === "media" ? "bg-muted" : ""
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

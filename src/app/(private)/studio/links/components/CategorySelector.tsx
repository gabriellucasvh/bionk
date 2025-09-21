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
		<div className="mb-4 w-full border-border border-b pr-0 pb-4 sm:mb-0 sm:w-48 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0">
			<div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
				<button
					className={`flex flex-1 items-center justify-center space-x-3 rounded-lg p-3 text-center transition-colors hover:bg-muted/50 sm:w-full sm:justify-start sm:text-left ${
						selectedCategory === "content" ? "bg-muted" : ""
					}`}
					onClick={() => onCategorySelect("content")}
					type="button"
				>
					<Plus className="h-5 w-5" />
					<span className="font-medium">Conteúdo</span>
				</button>

				<button
					className={`flex flex-1 items-center justify-center space-x-3 rounded-lg p-3 text-center transition-colors hover:bg-muted/50 sm:w-full sm:justify-start sm:text-left ${
						selectedCategory === "media" ? "bg-muted" : ""
					}`}
					onClick={() => onCategorySelect("media")}
					type="button"
				>
					<Play className="h-5 w-5" />
					<span className="font-medium">Mídia</span>
				</button>
			</div>
		</div>
	);
};

export default CategorySelector;
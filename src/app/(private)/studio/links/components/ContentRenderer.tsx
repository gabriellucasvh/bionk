"use client";

import CategorySelector from "./CategorySelector";
import ContentOptions from "./ContentOptions";
import MediaOptions from "./MediaOptions";

interface ContentRendererProps {
	selectedCategory: "content" | "media" | null;
	selectedOption: string | null;
	onCategorySelect: (category: "content" | "media") => void;
	onOptionSelect: (option: string) => void;
	showCategorySelector?: boolean;
}

const ContentRenderer = ({
	selectedCategory,
	selectedOption,
	onCategorySelect,
	onOptionSelect,
	showCategorySelector = true,
}: ContentRendererProps) => {
	if (!selectedCategory) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<p>Selecione uma categoria na barra lateral</p>
			</div>
		);
	}

	return (
		<>
			{showCategorySelector && (
				<CategorySelector
					onCategorySelect={onCategorySelect}
					selectedCategory={selectedCategory}
				/>
			)}

			{selectedCategory === "content" && !selectedOption && (
				<ContentOptions onOptionSelect={onOptionSelect} />
			)}

			{selectedCategory === "media" && !selectedOption && (
				<MediaOptions onOptionSelect={onOptionSelect} />
			)}
		</>
	);
};

export default ContentRenderer;
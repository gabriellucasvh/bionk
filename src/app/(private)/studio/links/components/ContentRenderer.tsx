"use client";

import CategorySelector from "./CategorySelector";
import ContentOptions from "./ContentOptions";
import ImageOptions from "./ImageOptions";
import VideoOptions from "./VideoOptions";
import MusicOptions from "./MusicOptions";

interface ContentRendererProps {
	selectedCategory: "content" | "video" | "image" | "music" | null;
	selectedOption: string | null;
	onCategorySelect: (category: "content" | "video" | "image" | "music") => void;
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

			{selectedCategory === "video" && !selectedOption && (
				<VideoOptions onOptionSelect={onOptionSelect} />
			)}

			{selectedCategory === "music" && !selectedOption && (
				<MusicOptions onOptionSelect={onOptionSelect} />
			)}

			{selectedCategory === "image" && !selectedOption && (
				<ImageOptions
					onOptionSelect={(option) => {
						// ContentRenderer não controla formulários;
						// apenas repassa a opção selecionada
						onOptionSelect(option);
					}}
				/>
			)}
		</>
	);
};

export default ContentRenderer;

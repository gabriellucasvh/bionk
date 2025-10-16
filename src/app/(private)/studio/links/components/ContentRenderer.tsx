"use client";

import CategorySelector from "./CategorySelector";
import ContentOptions from "./ContentOptions";
import MediaOptions from "./MediaOptions";
import ImageOptions from "./ImageOptions";

interface ContentRendererProps {
    selectedCategory: "content" | "video" | "image" | null;
    selectedOption: string | null;
    onCategorySelect: (category: "content" | "video" | "image") => void;
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
                <MediaOptions onOptionSelect={onOptionSelect} />
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

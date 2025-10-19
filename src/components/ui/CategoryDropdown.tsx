"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CategoryDropdownProps {
	categories: string[];
	selectedCategory: string | null;
	onCategorySelect: (category: string) => void;
	getCategoryDisplayName?: (category: string) => string;
}

export default function CategoryDropdown({
	categories,
	selectedCategory,
	onCategorySelect,
	getCategoryDisplayName,
}: CategoryDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleCategorySelect = (category: string) => {
		onCategorySelect(category);
		setIsOpen(false);
	};

	return (
		<div className="relative w-full">
			{/* Dropdown Button */}
			<Button
				className="h-12 w-full justify-between px-4 py-2 text-left"
				onClick={() => setIsOpen(!isOpen)}
				variant="outline"
			>
				<span className="truncate capitalize">
					{selectedCategory
						? getCategoryDisplayName
							? getCategoryDisplayName(selectedCategory)
							: selectedCategory.replace(/-/g, " ")
						: "Selecionar Categoria"}
				</span>
				<ChevronDown
					className={`h-4 w-4 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</Button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-zinc-800">
					{categories.map((category) => (
						<button
							className={`w-full px-4 py-3 text-left text-sm capitalize transition-colors hover:bg-gray-100 dark:hover:bg-zinc-700 ${
								selectedCategory === category
									? "bg-gray-100 font-medium dark:bg-zinc-700"
									: ""
							}`}
							key={category}
							onClick={() => handleCategorySelect(category)}
							type="button"
						>
							{getCategoryDisplayName
								? getCategoryDisplayName(category)
								: category.replace(/-/g, " ")}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

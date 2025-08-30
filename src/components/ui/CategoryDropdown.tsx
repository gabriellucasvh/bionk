"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryDropdownProps {
	categories: string[];
	selectedCategory: string | null;
	onCategorySelect: (category: string) => void;
}

export default function CategoryDropdown({
	categories,
	selectedCategory,
	onCategorySelect,
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
				variant="outline"
				className="w-full justify-between h-12 px-4 py-2 text-left"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="capitalize truncate">
					{selectedCategory ? selectedCategory.replace(/-/g, " ") : "Selecionar Categoria"}
				</span>
				<ChevronDown
					className={`h-4 w-4 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</Button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
					{categories.map((category) => (
						<button
							key={category}
							className={`w-full px-4 py-3 text-left text-sm capitalize transition-colors hover:bg-gray-100 ${
								selectedCategory === category
									? "bg-gray-100 font-medium"
									: ""
							}`}
							onClick={() => handleCategorySelect(category)}
							type="button"
						>
							{category.replace(/-/g, " ")}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
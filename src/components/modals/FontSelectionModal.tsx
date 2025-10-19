"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FontOption {
	label: string;
	value: string;
	fontFamily?: string;
}

interface FontSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	fontOptions: FontOption[];
	selectedFont: string;
	onFontSelect: (fontValue: string) => void;
}

export default function FontSelectionModal({
	isOpen,
	onClose,
	fontOptions,
	selectedFont,
	onFontSelect,
}: FontSelectionModalProps) {
	const handleFontSelect = (fontValue: string) => {
		onFontSelect(fontValue);
		onClose();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="relative mx-4 max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl dark:bg-zinc-800">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4">
					<h2 className="font-semibold text-lg">Selecionar Fonte</h2>
					<Button
						className="h-8 w-8 p-0"
						onClick={onClose}
						size="sm"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Font Options */}
				<div className="max-h-96 overflow-y-auto p-4">
					<div className="grid grid-cols-2 gap-2">
						{fontOptions.map((font) => (
							<button
								className={`flex w-full items-center justify-center rounded border p-3 text-left text-xs transition-colors ${
									selectedFont === font.value
										? "border-gray-300 bg-zinc-200 dark:border-gray-600 dark:bg-zinc-700"
										: "border-gray-200 hover:bg-zinc-100 dark:border-gray-500 dark:hover:bg-zinc-700"
								}`}
								key={font.value}
								onClick={() => handleFontSelect(font.value)}
								style={{ fontFamily: font.fontFamily || "inherit" }}
								type="button"
							>
								<span className="break-words">{font.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

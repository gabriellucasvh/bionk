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
	if (!isOpen) return null;

	const handleFontSelect = (fontValue: string) => {
		onFontSelect(fontValue);
		onClose();
	};

	return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div className="relative mx-4 max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
					{/* Header */}
					<div className="flex items-center justify-between border-b p-4">
						<h2 className="text-lg font-semibold">Selecionar Fonte</h2>
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="h-8 w-8 p-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Font Options */}
					<div className="max-h-96 overflow-y-auto p-4">
						<div className="grid grid-cols-2 gap-2">
							{fontOptions.map((font) => (
								<button
									key={font.value}
									className={`w-full rounded border p-3 text-left text-xs transition-colors flex items-center justify-center ${
										selectedFont === font.value
											? "border-gray-300 bg-neutral-200"
											: "border-gray-200 hover:bg-neutral-100"
									}`}
									onClick={() => handleFontSelect(font.value)}
									type="button"
									style={{ fontFamily: font.fontFamily || 'inherit' }}
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

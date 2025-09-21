"use client";

import { Layers2, Plus, Type } from "lucide-react";

interface ContentOptionsProps {
	onOptionSelect: (option: "link" | "section" | "text") => void;
}

const ContentOptions = ({ onOptionSelect }: ContentOptionsProps) => {
	return (
		<div className="space-y-6 py-4">
			<div className="flex justify-center gap-6">
				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("link")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 text-black">
						<Plus className="h-8 w-8" strokeWidth={1.5} />
					</div>
					<span className="font-medium text-sm">Link</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("section")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
						<Layers2 className="h-8 w-8" strokeWidth={1.5} />
					</div>
					<span className="font-medium text-sm">Seção</span>
				</button>

				<button
					className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
					onClick={() => onOptionSelect("text")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
						<Type className="h-8 w-8" strokeWidth={1.5} />
					</div>
					<span className="font-medium text-sm">Texto</span>
				</button>
			</div>
		</div>
	);
};

export default ContentOptions;
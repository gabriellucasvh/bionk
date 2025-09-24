"use client";

import { Layers2, Plus, Type } from "lucide-react";

interface ContentOptionsProps {
	onOptionSelect: (option: "link" | "section" | "text") => void;
}

const ContentOptions = ({ onOptionSelect }: ContentOptionsProps) => {
	return (
		<div>
			<div className="grid grid-cols-3 gap-4">
				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("link")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400">
						<Plus className="h-6 w-6 text-black" />
					</div>
					<span className="font-medium text-sm">Link</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("section")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
						<Layers2 className="h-6 w-6 text-gray-600" />
					</div>
					<span className="font-medium text-sm">Seção</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("text")}
					type="button"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
						<Type className="h-6 w-6 text-white" />
					</div>
					<span className="font-medium text-sm">Texto</span>
				</button>
			</div>
		</div>
	);
};

export default ContentOptions;

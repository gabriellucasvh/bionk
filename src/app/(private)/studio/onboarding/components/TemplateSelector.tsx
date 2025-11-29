"use client";

import Image from "next/image";
import { ALL_TEMPLATES } from "@/app/(public)/templates/templates.constants";

export default function TemplateSelector({
	selectedTemplateId,
	onSelect,
}: {
	selectedTemplateId: string;
	onSelect: (templateId: string) => void;
}) {
	return (
		<div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{ALL_TEMPLATES.map((tpl) => {
					const isActive = tpl.id === selectedTemplateId;
					return (
						<button
							className={`group relative overflow-hidden rounded-lg border text-left transition ${
								isActive
									? "ring-3 ring-black"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							}`}
							key={tpl.id}
							onClick={() => onSelect(tpl.id)}
							type="button"
						>
					<div className="aspect-[3/4] w-full bg-gray-100 dark:bg-gray-800">
						<Image
							alt={tpl.name}
							className="h-full w-full object-cover"
							height={240}
							src={tpl.image}
							width={180}
						/>
					</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

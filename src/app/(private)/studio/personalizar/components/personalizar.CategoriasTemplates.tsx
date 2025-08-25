// src/app/(private)/studio/personalizar/CategoriasTemplates.tsx
"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/personalizar.data";

interface TemplateSettingsProps {
	onTemplateChange?: () => void; // Callback para notificar mudança de template
}

export default function TemplateSettings({
	onTemplateChange,
}: TemplateSettingsProps = {}) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [currentTemplate, setCurrentTemplate] = useState<{
		template: string;
		templateCategory: string;
	} | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	useEffect(() => {
		const fetchTemplate = async () => {
			const response = await fetch("/api/user-template");
			const data = await response.json();

			if (data.template) {
				setCurrentTemplate({
					template: data.template,
					templateCategory: data.templateCategory,
				});
			}
		};

		fetchTemplate();
	}, []);

	const handleSave = async () => {
		if (!(selectedTemplate && selectedCategory)) {
			return;
		}

		setIsSaving(true);
		const startTime = Date.now();

		try {
			const response = await fetch("/api/update-template", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					template: selectedTemplate,
					templateCategory: selectedCategory,
				}),
			});

			if (response.ok) {
				setCurrentTemplate({
					template: selectedTemplate,
					templateCategory: selectedCategory,
				});

				// Notificar o componente pai sobre a mudança de template
				if (onTemplateChange) {
					onTemplateChange();
				}

				// Recarregar a página para refletir as mudanças
				window.location.reload();
			}
		} finally {
			const elapsedTime = Date.now() - startTime;
			const remainingTime = Math.max(0, 2000 - elapsedTime);

			setTimeout(() => {
				setIsSaving(false);
			}, remainingTime);
		}
	};

	const renderContent = () => (
		<>
			<div className="mb-10 flex flex-wrap gap-2">
				{Object.keys(CATEGORIES).map((category) => (
					<Button
						className={`rounded-lg border-2 px-6 py-3 font-medium text-sm capitalize transition-colors hover:border-lime-500 hover:bg-green-950 hover:text-white md:py-5 ${
							selectedCategory === category
								? "border-lime-500 bg-green-950 text-white"
								: ""
						}`}
						key={category}
						onClick={() => setSelectedCategory(category)}
						variant="ghost"
					>
						{category.replace(/-/g, " ")}
					</Button>
				))}
			</div>

			{selectedCategory && (
				<div className="mt-4">
					<div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center">
						<h2 className="font-semibold text-xl">Templates Disponíveis</h2>
						<div className="flex items-center gap-2">
							<BaseButton
								loading={!selectedTemplate || isSaving}
								onClick={handleSave}
							>
								{isSaving ? "Salvando..." : "Salvar Template"}
							</BaseButton>
							{selectedTemplate && (
								<p className="text-orange-600 text-sm">
									⚠️ Isso resetará suas personalizações
								</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.map(
							(template) => (
								<div
									className={`max-w-[150px] cursor-pointer rounded-lg border-2 p-2 transition-all ${
										selectedTemplate === template.id
											? "border-green-600 bg-green-50"
											: "border-gray-300 hover:border-green-400 hover:bg-gray-50"
									}`}
									key={template.id}
								>
									<Button
										className="flex h-full w-full flex-col p-0"
										onClick={() => setSelectedTemplate(template.id)}
										variant="ghost"
									>
										<Image
											alt={template.name}
											className="aspect-[9/16] w-full max-w-[150px] rounded-lg object-cover"
											height={120}
											quality={100}
											src={template.image}
											unoptimized
											width={200}
										/>
										<p className="mt-2 text-center font-medium text-sm">
											{template.name}
										</p>
									</Button>
								</div>
							)
						)}
					</div>
				</div>
			)}
		</>
	);

	return (
		<div>
			{currentTemplate && (
				<div className="mb-6 md:inline-block">
					<span className="rounded-full bg-green-100 px-4 py-2 font-medium text-green-800 text-sm capitalize">
						Tema atual:{" "}
						{currentTemplate.templateCategory.charAt(0) +
							currentTemplate.templateCategory.slice(1)}{" "}
						-{" "}
						{CATEGORIES[
							currentTemplate.templateCategory as keyof typeof CATEGORIES
						]?.find((t) => t.id === currentTemplate.template)?.name ||
							currentTemplate.template}
					</span>
				</div>
			)}
			<div className="block">{renderContent()}</div>
		</div>
	);
}

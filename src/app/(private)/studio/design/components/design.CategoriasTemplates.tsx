// src/app/(private)/studio/design/CategoriasTemplates.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import CategoryDropdown from "@/components/ui/CategoryDropdown";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIES } from "../data/design.data";

interface TemplateSettingsProps {
	onTemplateChange?: () => void; // Callback para notificar mudança de template
}

export default function TemplateSettings({
	onTemplateChange,
}: TemplateSettingsProps = {}) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		"classicos"
	);
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
	const [pendingTemplate, setPendingTemplate] = useState<{
		template: string;
		category: string;
	} | null>(null);

	const handleTemplateSelect = (templateId: string) => {
		if (selectedCategory) {
			setPendingTemplate({
				template: templateId,
				category: selectedCategory,
			});
			setShowConfirmModal(true);
		}
	};

	const handleConfirmTemplate = async () => {
		if (!pendingTemplate) {
			return;
		}

		setIsSaving(true);
		setShowConfirmModal(false);
		const startTime = Date.now();

		try {
			const response = await fetch("/api/update-template", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					template: pendingTemplate.template,
					templateCategory: pendingTemplate.category,
				}),
			});

			if (response.ok) {
				setSelectedTemplate(pendingTemplate.template);
				setPendingTemplate(null);

				if (onTemplateChange) {
					onTemplateChange();
				}
			}
		} catch (error) {
			console.error("Erro ao salvar template:", error);
		} finally {
			const elapsedTime = Date.now() - startTime;
			const minDelay = 1000;
			const remainingTime = Math.max(0, minDelay - elapsedTime);

			setTimeout(() => {
				setIsSaving(false);
			}, remainingTime);
		}
	};

	const renderContent = () => (
		<>
			{/* Mobile: Dropdown */}
			<div className="mb-10 block sm:hidden">
				<CategoryDropdown
					categories={Object.keys(CATEGORIES)}
					onCategorySelect={setSelectedCategory}
					selectedCategory={selectedCategory}
				/>
			</div>
			{/* Desktop: Grid */}
			<div className="mb-10 hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-3 md:grid-cols-4">
				{Object.keys(CATEGORIES).map((category) => (
					<Button
						className={`flex h-12 w-full items-center justify-center rounded-lg border-2 px-2 py-1 text-center font-medium text-xs capitalize transition-colors hover:border-lime-500 hover:bg-green-950 hover:text-white ${
							selectedCategory === category
								? "border-lime-500 bg-green-950 text-white"
								: ""
						}`}
						key={category}
						onClick={() => setSelectedCategory(category)}
						variant="ghost"
					>
						<span className="break-words">{category.replace(/-/g, " ")}</span>
					</Button>
				))}
			</div>

			{selectedCategory && (
				<div className="mt-4">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
						{CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.map(
							(template) => (
								<div
									className={`max-w-[150px] cursor-pointer rounded-lg border-2 p-2 transition-all ${
										selectedTemplate === template.id
											? "border-green-600 bg-green-50"
											: "border-gray-300 hover:border-green-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-green-400 dark:hover:bg-gray-600"
									}`}
									key={template.id}
								>
									<Button
										className="flex h-full w-full flex-col p-0"
										onClick={() => handleTemplateSelect(template.id)}
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
			<div className="block">{renderContent()}</div>

			<Dialog
				onOpenChange={(open) => {
					setShowConfirmModal(open);
					if (!open) {
						setPendingTemplate(null);
					}
				}}
				open={showConfirmModal}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirmar Alteração de Template</DialogTitle>
						<DialogDescription>
							Ao selecionar este template, todas as suas personalizações atuais
							serão resetadas. Deseja continuar?
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end pt-4">
						<BaseButton disabled={isSaving} onClick={handleConfirmTemplate}>
							{isSaving ? "Aplicando..." : "Aplicar"}
						</BaseButton>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

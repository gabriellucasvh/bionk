// src/app/(private)/studio/design/CategoriasTemplates.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

const getCategoryDisplayName = (category: string): string => {
	const categoryNames: Record<string, string> = {
		classicos: "Clássicos",
		unicos: "Únicos",
		criativo: "Criativo",
		moderno: "Moderno",
	};
	return categoryNames[category] || category.replace(/-/g, " ");
};

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
	const [showLeftGradient, setShowLeftGradient] = useState(false);
	const [showRightGradient, setShowRightGradient] = useState(true);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const handleScroll = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } =
				scrollContainerRef.current;

			const isAtStart = scrollLeft <= 5;
			const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 5;
			const hasOverflow = scrollWidth > clientWidth;

			if (hasOverflow) {
				setShowLeftGradient(!isAtStart);
				setShowRightGradient(!isAtEnd);
			} else {
				setShowLeftGradient(false);
				setShowRightGradient(false);
			}
		}
	};

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);

			setTimeout(() => {
				handleScroll();
			}, 100);

			return () => {
				container.removeEventListener("scroll", handleScroll);
			};
		}
	}, [selectedCategory]);

	useEffect(() => {
		setTimeout(() => {
			handleScroll();
		}, 100);
	}, []);

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
					getCategoryDisplayName={getCategoryDisplayName}
					onCategorySelect={setSelectedCategory}
					selectedCategory={selectedCategory}
				/>
			</div>
			{/* Desktop: Grid */}
			<div className="mb-10 hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-3 md:grid-cols-4">
				{Object.keys(CATEGORIES).map((category) => (
					<Button
						className={`flex h-12 w-full items-center justify-center rounded-2xl border px-2 py-1 text-center font-medium capitalize transition-colors hover:bg-bunker-100 dark:hover:bg-bunker-950 dark:hover:text-white ${
							selectedCategory === category
								? " bg-black text-white hover:bg-black hover:text-white dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
								: " bg-white dark:bg-zinc-900 dark:text-white"
						}`}
						key={category}
						onClick={() => setSelectedCategory(category)}
						variant="ghost"
					>
						<span className="break-words">
							{getCategoryDisplayName(category)}
						</span>
					</Button>
				))}
			</div>

			{selectedCategory && (
				<div className="mt-4">
					<div className="relative">
						<div
							className=" flex gap-3 overflow-x-auto p-2"
							ref={scrollContainerRef}
						>
							{CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.map(
								(template) => (
									<div
										className={`min-w-[150px] cursor-pointer rounded-2xl transition-all ${
											selectedTemplate === template.id
												? ""
												: "ring-offset-2 transition-all duration-200 hover:ring-2 hover:ring-black dark:hover:ring-white dark:hover:ring-offset-0"
										}`}
										key={template.id}
									>
										<Button
											className="flex h-full w-full flex-col p-0"
											onClick={() => handleTemplateSelect(template.id)}
											variant="ghost"
										>
											<div className="relative h-[200px] w-[150px] overflow-hidden rounded-xl">
												<Image
													alt={template.name}
													className="object-cover"
													fill
													quality={100}
													src={template.image}
													unoptimized
												/>
											</div>
										</Button>
									</div>
								)
							)}
						</div>
						{showLeftGradient && (
							<div className="pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-white to-transparent sm:hidden dark:from-zinc-800" />
						)}
						{showRightGradient && (
							<div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent sm:hidden dark:from-zinc-800" />
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

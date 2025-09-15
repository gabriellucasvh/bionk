"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ContentType } from "../../types/content.types";
import {
	detectUrlFromText,
	getCategoryItems,
	getContentCategories,
	getQuickAddItems,
} from "../../utils/content.helpers";

interface ContentSelectorProps {
	searchQuery: string;
	onTypeSelect: (type: ContentType) => void;
	onUrlDetected: (url: string) => void;
}

const ContentSelector = ({
	searchQuery,
	onTypeSelect,
	onUrlDetected,
}: ContentSelectorProps) => {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const quickAddItems = getQuickAddItems();
	const categories = getContentCategories();

	// URL detection logic
	const detectedUrl = useMemo(() => {
		if (!searchQuery.trim()) {
			return null;
		}
		return detectUrlFromText(searchQuery);
	}, [searchQuery]);

	// Handle URL detection
	const handleUrlDetection = () => {
		if (detectedUrl) {
			onUrlDetected(detectedUrl);
		}
	};

	// Filter quick add items based on search query
	const filteredQuickAdd = useMemo(() => {
		if (!searchQuery.trim()) {
			return quickAddItems;
		}
		return quickAddItems.filter(
			(item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description?.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [quickAddItems, searchQuery]);

	const categoryItems = selectedCategory
		? getCategoryItems(selectedCategory)
		: [];

	return (
		<div className="p-6">
			{/* URL Detection Banner */}
			{detectedUrl && (
				<div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
					<p className="mb-2 text-green-700 text-sm dark:text-green-300">
						Link detectado:{" "}
						<span className="font-mono text-xs">{detectedUrl}</span>
					</p>
					<Button
						className="bg-green-600 hover:bg-green-700"
						onClick={handleUrlDetection}
						size="sm"
					>
						Adicionar como Link
					</Button>
				</div>
			)}

			{/* Desktop Layout (2 columns) */}
			<div className="hidden lg:flex lg:gap-8">
				{/* Left Column - Categories */}
				<div className="w-1/3">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-gray-100">
						Categorias
					</h3>
					<div className="space-y-2">
						{categories.map((category) => {
							const Icon = category.icon;
							const isSelected = selectedCategory === category.id;
							return (
								<button
									className={cn(
										"flex w-full items-center rounded-lg border p-3 text-left transition-all duration-200",
										isSelected
											? "border-green-500 bg-green-50 dark:bg-green-950/20"
											: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
									)}
									key={category.id}
									onClick={() =>
										setSelectedCategory(isSelected ? null : category.id)
									}
									type="button"
								>
									<Icon
										className={cn(
											"mr-3 h-5 w-5",
											isSelected
												? "text-green-600"
												: "text-gray-600 dark:text-gray-400"
										)}
									/>
									<span
										className={cn(
											"flex-1 font-medium text-sm",
											isSelected
												? "text-green-900 dark:text-green-100"
												: "text-gray-900 dark:text-gray-100"
										)}
									>
										{category.name}
									</span>
									{isSelected && (
										<ChevronRight className="h-4 w-4 text-green-600" />
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Right Column - Content */}
				<div className="flex-1">
					{selectedCategory && categoryItems.length > 0 ? (
						/* Category Items */
						<div>
							<div className="mb-4 flex items-center gap-2">
								<button
									className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
									onClick={() => setSelectedCategory(null)}
									type="button"
								>
									← Voltar
								</button>
								<h3 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
									{categories.find((c) => c.id === selectedCategory)?.name}
								</h3>
							</div>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{categoryItems.map((item, index) => {
									const Icon = item.icon;
									return (
										<button
											className="group flex w-full items-center rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
											key={`${item.type}-${index}`}
											onClick={() => onTypeSelect(item.type)}
											type="button"
										>
											<div
												className={cn(
													"mr-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
													item.color
												)}
											>
												<Icon className="h-6 w-6 text-white" />
											</div>
											<div className="flex-1 text-left">
												<div className="font-medium text-gray-900 dark:text-gray-100">
													{item.name}
												</div>
												{item.description && (
													<div className="text-gray-500 text-sm dark:text-gray-400">
														{item.description}
													</div>
												)}
											</div>
											<ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
										</button>
									);
								})}
							</div>
						</div>
					) : (
						<>
							{/* Quick Add Section */}
							<div className="mb-8">
								<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-gray-100">
									Adição rápida
								</h3>
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
									{filteredQuickAdd.map((item) => {
										const Icon = item.icon;
										return (
											<button
												className="group flex flex-col items-center bg-white p-2 dark:bg-gray-800"
												key={item.type}
												onClick={() => onTypeSelect(item.type)}
												type="button"
											>
												<div
													className={cn(
														"mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110",
														item.color
													)}
												>
													<Icon className="h-6 w-6 text-white" />
												</div>
												<span className="text-center font-medium text-gray-900 text-sm dark:text-gray-100">
													{item.name}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Recommended Section */}
							<div className="mb-8">
								<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-gray-100">
									Recomendado
								</h3>
								<div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-100 to-green-100 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-green-900/20">
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										{/* Affiliate Products */}
										<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
											<div className="mb-3 flex items-center justify-between">
												<h4 className="font-semibold text-gray-900 dark:text-gray-100">
													Produtos afiliados
												</h4>
												<Button
													className="bg-black text-white hover:bg-gray-800"
													onClick={() => onTypeSelect("integration")}
													size="sm"
												>
													ADD
												</Button>
											</div>
											<div className="grid grid-cols-3 gap-2">
												<div className="rounded-lg bg-red-100 p-2 text-center dark:bg-red-900/20">
													<div className="font-medium text-red-700 text-xs dark:text-red-300">
														15% comissão
													</div>
												</div>
												<div className="rounded-lg bg-green-100 p-2 text-center dark:bg-green-900/20">
													<div className="font-medium text-green-700 text-xs dark:text-green-300">
														12% comissão
													</div>
												</div>
												<div className="rounded-lg bg-orange-100 p-2 text-center dark:bg-orange-900/20">
													<div className="font-medium text-orange-700 text-xs dark:text-orange-300">
														8% comissão
													</div>
												</div>
											</div>
										</div>

										{/* Templates */}
										<div className="rounded-xl border border-pink-200 bg-gradient-to-br from-pink-100 to-purple-100 p-4 dark:border-pink-800 dark:from-pink-900/20 dark:to-purple-900/20">
											<div className="grid grid-cols-2 gap-2">
												<div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
													<div className="mb-2 h-16 w-full rounded bg-gradient-to-br from-green-400 to-purple-500" />
													<div className="font-medium text-gray-700 text-xs dark:text-gray-300">
														Template
													</div>
												</div>
												<div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
													<div className="mb-2 h-16 w-full rounded bg-gradient-to-br from-yellow-400 to-orange-500" />
													<div className="font-medium text-gray-700 text-xs dark:text-gray-300">
														Design
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Mobile/Tablet Layout */}
			<div className="lg:hidden">
				{/* Quick Add Section */}
				<div className="mb-8">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-gray-100">
						Adição rápida
					</h3>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{filteredQuickAdd.map((item) => {
							const Icon = item.icon;
							return (
								<button
									className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
									key={item.type}
									onClick={() => onTypeSelect(item.type)}
									type="button"
								>
									<div
										className={cn(
											"mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110",
											item.color
										)}
									>
										<Icon className="h-6 w-6 text-white" />
									</div>
									<span className="text-center font-medium text-gray-900 text-sm dark:text-gray-100">
										{item.name}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Recommended Section */}
				<div className="mb-8">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-gray-100">
						Recomendado
					</h3>
					<div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-100 to-green-100 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-green-900/20">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{/* Affiliate Products */}
							<div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
								<div className="mb-3 flex items-center justify-between">
									<h4 className="font-semibold text-gray-900 dark:text-gray-100">
										Produtos afiliados
									</h4>
									<Button
										className="bg-black text-white hover:bg-gray-800"
										onClick={() => onTypeSelect("integration")}
										size="sm"
									>
										ADD
									</Button>
								</div>
								<div className="grid grid-cols-3 gap-2">
									<div className="rounded-lg bg-red-100 p-2 text-center dark:bg-red-900/20">
										<div className="font-medium text-red-700 text-xs dark:text-red-300">
											15% comissão
										</div>
									</div>
									<div className="rounded-lg bg-green-100 p-2 text-center dark:bg-green-900/20">
										<div className="font-medium text-green-700 text-xs dark:text-green-300">
											12% comissão
										</div>
									</div>
									<div className="rounded-lg bg-orange-100 p-2 text-center dark:bg-orange-900/20">
										<div className="font-medium text-orange-700 text-xs dark:text-orange-300">
											8% comissão
										</div>
									</div>
								</div>
							</div>

							{/* Templates */}
							<div className="rounded-xl border border-pink-200 bg-gradient-to-br from-pink-100 to-purple-100 p-4 dark:border-pink-800 dark:from-pink-900/20 dark:to-purple-900/20">
								<div className="grid grid-cols-2 gap-2">
									<div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
										<div className="mb-2 h-16 w-full rounded bg-gradient-to-br from-green-400 to-purple-500" />
										<div className="font-medium text-gray-700 text-xs dark:text-gray-300">
											Template
										</div>
									</div>
									<div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
										<div className="mb-2 h-16 w-full rounded bg-gradient-to-br from-yellow-400 to-orange-500" />
										<div className="font-medium text-gray-700 text-xs dark:text-gray-300">
											Design
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Categories Section */}
				<div>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
						{categories.map((category) => {
							const Icon = category.icon;
							const isSelected = selectedCategory === category.id;

							return (
								<button
									className={cn(
										"flex flex-col items-center rounded-xl border p-4 transition-all duration-200",
										isSelected
											? "border-green-500 bg-green-50 dark:bg-green-950/20"
											: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750"
									)}
									key={category.id}
									onClick={() =>
										setSelectedCategory(isSelected ? null : category.id)
									}
									type="button"
								>
									<Icon
										className={cn(
											"mb-2 h-6 w-6",
											isSelected
												? "text-green-600"
												: "text-gray-600 dark:text-gray-400"
										)}
									/>
									<span
										className={cn(
											"text-center font-medium text-sm",
											isSelected
												? "text-green-900 dark:text-green-100"
												: "text-gray-900 dark:text-gray-100"
										)}
									>
										{category.name}
									</span>
									{isSelected && (
										<ChevronRight className="mt-1 h-4 w-4 text-green-600" />
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Category Items for Mobile */}
				{selectedCategory && categoryItems.length > 0 && (
					<div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
						<h4 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
							{categories.find((c) => c.id === selectedCategory)?.name}
						</h4>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{categoryItems.map((item, index) => {
								const Icon = item.icon;
								return (
									<button
										className="group flex items-center rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-650"
										key={`${item.type}-${index}`}
										onClick={() => onTypeSelect(item.type)}
										type="button"
									>
										<div
											className={cn(
												"mr-3 flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
												item.color
											)}
										>
											<Icon className="h-5 w-5 text-white" />
										</div>
										<div className="flex-1 text-left">
											<div className="font-medium text-gray-900 dark:text-gray-100">
												{item.name}
											</div>
											{item.description && (
												<div className="text-gray-500 text-xs dark:text-gray-400">
													{item.description}
												</div>
											)}
										</div>
										<ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ContentSelector;

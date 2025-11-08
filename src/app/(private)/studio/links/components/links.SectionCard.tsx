// links/components/links.SectionCard.tsx
"use client";

import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Grip, MoreHorizontal, Plus, Trash2, Ungroup } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import LinkCard from "./links.LinkCard";
import SortableItem from "./links.SortableItem";

interface SectionCardProps {
	section: SectionItem;
	onSectionUpdate: (id: number, payload: Partial<SectionItem>) => void;
	onSectionDelete: (id: number) => void;
	onSectionUngroup: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onToggleActive: (id: number, isActive: boolean) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	isDragging: boolean;
	archivingLinkId?: number | null;
	onAddLinkToSection?: (sectionId: number) => void;
	linksManager?: any;
	onUpdateCustomImage?: (id: number, imageUrl: string) => void;
	onRemoveCustomImage?: (id: number) => void;
	isTogglingActive?: boolean;
}

const SectionCard = ({
	section,
	onSectionUpdate,
	onSectionDelete,
	onSectionUngroup,
	listeners,
	setActivatorNodeRef,
	isDragging,
	onAddLinkToSection,
	linksManager,
	isTogglingActive,
	...linkCardProps
}: SectionCardProps) => {
	const [isAddingLink, setIsAddingLink] = useState(false);
	return (
		<section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
			{/* Header reorganizado para dispositivos móveis */}
			<div className="space-y-3">
				{/* Primeira linha: Grip, Título e Menu de opções */}
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<div
							ref={setActivatorNodeRef}
							{...listeners}
							className="flex-shrink-0 cursor-grab touch-none p-1"
						>
							<Grip className="h-4 w-4 text-muted-foreground" />
						</div>
						<h2 className="truncate font-bold text-foreground text-lg">
							{section.title}
						</h2>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger className="p-1">
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="space-y-2 py-2">
							<DropdownMenuItem onClick={() => onSectionUngroup(section.dbId)}>
								<Ungroup className="mr-2 h-4 w-4" />
								<span>Desagrupar</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => onSectionDelete(section.dbId)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								<span>Deletar</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Segunda linha: Botão adicionar link e Toggle ativo/inativo */}
				<div className="flex flex-wrap items-center justify-between gap-3">
					{!isAddingLink && (
						<Button
							className="h-8 flex-shrink-0 rounded-full"
							onClick={() => setIsAddingLink(true)}
							size="sm"
							variant="outline"
						>
							<Plus className="mr-1 h-3 w-3" />
							<span className="hidden sm:inline">Adicionar link</span>
							<span className="sm:hidden">Adicionar</span>
						</Button>
					)}
					<div className="flex flex-shrink-0 items-center space-x-2">
						<Switch
							checked={section.active}
							disabled={isTogglingActive}
							id={`section-switch-${section.id}`}
							onCheckedChange={(checked) =>
								onSectionUpdate(section.dbId, { active: checked })
							}
						/>
						<Label
							className={`cursor-pointer text-sm ${isTogglingActive ? "opacity-50" : ""}`}
							htmlFor={`section-switch-${section.id}`}
						>
							{section.active ? "Ativa" : "Inativa"}
						</Label>
					</div>
				</div>
			</div>

			{!isDragging && (
				<>
					{isAddingLink && linksManager && (
						<div className="mb-4">
							<AddNewLinkForm
								isSaveDisabled={
									!isValidUrl(linksManager.formData.url) ||
									linksManager.formData.title.trim().length === 0
								}
								linksManager={{
									...linksManager,
									handleAddNewLink: async () => {
										if (onAddLinkToSection) {
											await onAddLinkToSection(section.dbId);
										}
										setIsAddingLink(false);
									},
									setIsAdding: setIsAddingLink,
									isAdding: isAddingLink,
								}}
							/>
						</div>
					)}

					<SortableContext
						items={section.links.map((l) => `link-${l.id}`)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-3">
							{section.links.map((linkItem) => (
								<SortableItem id={`link-${linkItem.id}`} key={linkItem.id}>
									{({
										listeners: linkListeners,
										setActivatorNodeRef: linkSetActivatorNodeRef,
									}) => (
										<LinkCard
											link={linkItem}
											listeners={linkListeners}
											setActivatorNodeRef={linkSetActivatorNodeRef}
											{...linkCardProps}
										/>
									)}
								</SortableItem>
							))}
						</div>
					</SortableContext>
				</>
			)}
		</section>
	);
};

export default SectionCard;

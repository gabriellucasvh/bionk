// src/app/(private)/studio/links/components/links.SectionCard.tsx
"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Grip, MoreHorizontal, Trash2, Ungroup } from "lucide-react";
import type { SectionItem } from "../types/links.types";
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
	onToggleSensitive: (id: number) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
}

const SectionCard = ({
	section,
	onSectionUpdate,
	onSectionDelete,
	onSectionUngroup,
	listeners,
	setActivatorNodeRef,
	...linkCardProps
}: SectionCardProps) => {
	return (
		<section className="space-y-4 rounded-lg bg-gray-100 p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						ref={setActivatorNodeRef}
						{...listeners}
						className="cursor-grab touch-none p-2"
					>
						<Grip className="h-5 w-5 text-muted-foreground" />
					</div>
					<h2 className="font-bold text-foreground text-xl">{section.title}</h2>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={section.active}
							id={`section-switch-${section.id}`}
							onCheckedChange={(checked) =>
								onSectionUpdate(section.dbId, { active: checked })
							}
						/>
						<Label
							className="cursor-pointer text-sm"
							htmlFor={`section-switch-${section.id}`}
						>
							{section.active ? "Ativa" : "Inativa"}
						</Label>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<MoreHorizontal className="h-5 w-5" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
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
			</div>

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
		</section>
	);
};

export default SectionCard;

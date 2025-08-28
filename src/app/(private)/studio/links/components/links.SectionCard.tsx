"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
	Eye,
	EyeOff,
	Grip,
	MoreHorizontal,
	Trash2,
	Ungroup,
} from "lucide-react";
import type { SectionItem } from "../types/links.types";
import LinkCard from "./links.LinkCard";
import SortableItem from "./links.SortableItem";

// Adicionamos as 4 props que estavam faltando na interface
interface SectionCardProps {
	section: SectionItem;
	onSectionUpdate: (id: string, payload: Partial<SectionItem>) => void;
	onSectionDelete: (id: string) => void;
	onSectionUngroup: (id: string) => void;
	// Funções para os links
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onToggleActive: (id: number, isActive: boolean) => void;
	onToggleSensitive: (id: number) => void;
	// Props que faltavam para o LinkCard
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
}

const SectionCard = ({
	section,
	onSectionUpdate,
	onSectionDelete,
	onSectionUngroup,
	...linkCardProps // Agora o '...linkCardProps' contém todas as funções necessárias
}: SectionCardProps) => {
	return (
		<section className="space-y-4 rounded-lg bg-gray-100 p-4">
			<div className="flex items-center justify-between">
				<div className="flex cursor-grab items-center gap-2">
					<Grip className="h-5 w-5 text-muted-foreground" />
					<h2 className="font-bold text-foreground text-xl">{section.title}</h2>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreHorizontal className="h-5 w-5" />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem
							onClick={() =>
								onSectionUpdate(section.id, { active: !section.active })
							}
						>
							{section.active ? (
								<EyeOff className="mr-2 h-4 w-4" />
							) : (
								<Eye className="mr-2 h-4 w-4" />
							)}
							<span>{section.active ? "Desativar" : "Ativar"}</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSectionUngroup(section.id)}>
							<Ungroup className="mr-2 h-4 w-4" />
							<span>Desagrupar</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onSectionDelete(section.id)}>
							<Trash2 className="mr-2 h-4 w-4" />
							<span>Deletar</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<SortableContext
				items={section.links.map((l) => `link-${l.id}`)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-3">
					{section.links.map((link) => (
						<SortableItem id={`link-${link.id}`} key={link.id}>
							{({ listeners, setActivatorNodeRef }) => (
								<LinkCard
									link={link}
									listeners={listeners}
									setActivatorNodeRef={setActivatorNodeRef}
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

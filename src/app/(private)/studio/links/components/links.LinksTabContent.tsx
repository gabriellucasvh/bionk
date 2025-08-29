// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Session } from "next-auth";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { LinkItem, SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import LinkCard from "./links.LinkCard";
import SectionCard from "./links.SectionCard";
import SortableItem from "./links.SortableItem";

// --- TIPOS E CONSTANTES ---
type LinkFormData = {
	title: string;
	url: string;
	sectionTitle: string;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
};

const initialFormData: LinkFormData = {
	title: "",
	url: "",
	sectionTitle: "",
	badge: "",
	password: "",
	deleteOnClicks: undefined,
	expiresAt: undefined,
	launchesAt: undefined,
};

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	mutateLinks: () => Promise<any>;
	session: Session | null;
}

type UnifiedItem = {
	id: string;
	type: "section" | "link";
	data: SectionItem | LinkItem;
};

const urlRegex = /^https?:\/\//;

// --- COMPONENTE PRINCIPAL ---
const LinksTabContent = ({
	initialLinks,
	mutateLinks,
}: LinksTabContentProps) => {
	const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState<LinkFormData>(initialFormData);
	const [originalLink, setOriginalLink] = useState<LinkItem | null>(null);

	useEffect(() => {
		const sortedLinks = [...initialLinks].sort((a, b) => a.order - b.order);
		const sections: Record<string, SectionItem> = {};
		const generalLinks: LinkItem[] = [];

		for (const link of sortedLinks) {
			if (link.sectionTitle) {
				const sectionId = `section-${link.sectionTitle.replace(/\s+/g, "-")}`;
				if (!sections[sectionId]) {
					sections[sectionId] = {
						id: sectionId,
						title: link.sectionTitle,
						links: [],
						active: true,
						order: link.order,
					};
				}
				sections[sectionId].links.push(link);
			} else {
				generalLinks.push(link);
			}
		}

		const newUnifiedItems: UnifiedItem[] = [
			...Object.values(sections).map(
				(s) => ({ id: s.id, type: "section", data: s }) as UnifiedItem
			),
			...generalLinks.map(
				(l) => ({ id: `link-${l.id}`, type: "link", data: l }) as UnifiedItem
			),
		];

		newUnifiedItems.sort((a, b) => a.data.order - b.data.order);
		setUnifiedItems(newUnifiedItems);
	}, [initialLinks]);

	const existingSections = useMemo(() => {
		return unifiedItems
			.filter((item) => item.type === "section")
			.map((item) => (item.data as SectionItem).title);
	}, [unifiedItems]);

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	// --- LÓGICA DE DRAG AND DROP ---

	const findContainerId = (itemId: string): string | null => {
		if (itemId.startsWith("section-")) return itemId;
		for (const item of unifiedItems) {
			if (item.type === "section") {
				const section = item.data as SectionItem;
				if (section.links.some((link) => `link-${link.id}` === itemId)) {
					return section.id;
				}
			}
		}
		return null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (
			!over ||
			active.id === over.id ||
			!active.id.toString().startsWith("link-")
		)
			return;

		const activeContainerId = findContainerId(active.id.toString());
		const overContainerId = findContainerId(over.id.toString());

		if (
			!(activeContainerId && overContainerId) ||
			activeContainerId === overContainerId
		)
			return;

		setUnifiedItems((prev) => {
			const activeSectionIndex = prev.findIndex(
				(item) => item.id === activeContainerId
			);
			const overSectionIndex = prev.findIndex(
				(item) => item.id === overContainerId
			);
			if (activeSectionIndex === -1 || overSectionIndex === -1) return prev;

			const activeSection = prev[activeSectionIndex].data as SectionItem;
			const overSection = prev[overSectionIndex].data as SectionItem;
			const linkIndex = activeSection.links.findIndex(
				(link) => `link-${link.id}` === active.id
			);
			const [movedLink] = activeSection.links.splice(linkIndex, 1);
			overSection.links.push(movedLink);
			return [...prev];
		});
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);
		if (!over || active.id === over.id) return;

		const oldIndex = unifiedItems.findIndex((item) => item.id === active.id);
		const newIndex = unifiedItems.findIndex((item) => item.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const newOrderedItems = arrayMove(unifiedItems, oldIndex, newIndex);
		setUnifiedItems(newOrderedItems);

		const linksPayload: { id: number; sectionTitle: string | null }[] = [];
		for (const item of newOrderedItems) {
			if (item.type === "section") {
				const section = item.data as SectionItem;
				for (const link of section.links) {
					linksPayload.push({
						id: link.id,
						sectionTitle: section.title,
					});
				}
			} else {
				const link = item.data as LinkItem;
				linksPayload.push({
					id: link.id,
					sectionTitle: null,
				});
			}
		}

		console.log("Enviando para API de reordenação:", { links: linksPayload });

		try {
			const res = await fetch("/api/links/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ links: linksPayload }),
			});

			if (res.ok) {
				toast.success("Ordem salva com sucesso!");
			} else {
				// Se a resposta não for OK, tentamos ler o corpo do erro
				const errorBody = await res.json();
				console.error("Erro da API ao reordenar:", errorBody);
				toast.error("Falha ao salvar: " + (errorBody.error || res.statusText));
				setUnifiedItems(unifiedItems); // Reverte a mudança visual
			}
		} catch (error) {
			console.error("Erro de rede ou JSON ao reordenar:", error);
			toast.error("Erro de comunicação com o servidor.");
			setUnifiedItems(unifiedItems); // Reverte a mudança visual
		}

		await mutateLinks();
	};

	// --- Funções de Manipulação ---
	const handleSectionUpdate = (id: string, payload: Partial<SectionItem>) => {
		toast.info(`Função (ainda não implementada): Atualizar seção ${id}`);
	};
	const handleSectionDelete = (id: string) => {
		toast.info(`Função (ainda não implementada): Deletar seção ${id}`);
	};
	const handleSectionUngroup = (id: string) => {
		toast.info(`Função (ainda não implementada): Desagrupar seção ${id}`);
	};
	const handleAddNewLink = async () => {
		let formattedUrl = formData.url.trim();
		if (!urlRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (!isValidUrl(formattedUrl)) return;

		const res = await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData }),
		});

		if (res.ok) {
			toast.success("Link adicionado com sucesso!");
			await mutateLinks();
			setFormData(initialFormData);
			setIsAdding(false);
		} else {
			toast.error("Falha ao adicionar o link.");
		}
	};
	const handleLinkUpdate = async (id: number, payload: Partial<LinkItem>) => {
		await fetch(`/api/links/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		await mutateLinks();
	};

	const saveEditing = (id: number, title: string, url: string) => {
		handleLinkUpdate(id, { title, url, isEditing: false });
		setOriginalLink(null);
	};

	const handleDeleteLink = async (id: number) => {
		const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
		if (res.ok) {
			toast.success("Link deletado com sucesso.");
			await mutateLinks();
		}
	};
	const handleArchiveLink = (id: number) => {
		handleLinkUpdate(id, { archived: true });
		toast.success("Link arquivado.");
	};
	const toggleActive = (id: number, isActive: boolean) => {
		return handleLinkUpdate(id, { active: isActive });
	};
	const toggleSensitive = (id: number) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { sensitive: !link.sensitive });
		}
	};
	// --- Novas Funções ---
	const handleStartEditing = (id: number) => {
		const linkToEdit = initialLinks.find((l) => l.id === id);
		if (linkToEdit) {
			setOriginalLink(linkToEdit); // Salva o estado original
			handleLinkUpdate(id, { isEditing: true });
		}
	};

	const handleCancelEditing = (id: number) => {
		if (originalLink) {
			// Restaura o link para o estado original
			handleLinkUpdate(id, {
				...originalLink,
				isEditing: false,
			});
		} else {
			// Caso geral, apenas desativa a edição
			handleLinkUpdate(id, { isEditing: false });
		}
		setOriginalLink(null); // Limpa o estado original salvo
	};
	const handleLinkChange = (id: number, field: "title" | "url", value: string) => {
		handleLinkUpdate(id, { [field]: value });
	};
	const handleClickLink = (id: number) => {
		handleLinkUpdate(id, { clicks: initialLinks.find(l => l.id === id)!.clicks + 1 });
	};
	return (
		<div className="space-y-4">
			{!isAdding && (
				<BaseButton
					className="w-full sm:w-auto"
					onClick={() => setIsAdding(true)}
				>
					<span className="flex items-center justify-center">
						<Plus className="mr-1 h-4 w-4" /> Adicionar novo link
					</span>
				</BaseButton>
			)}
			{isAdding && (
				<AddNewLinkForm
					existingSections={existingSections}
					formData={formData}
					isSaveDisabled={
						!isValidUrl(formData.url) || formData.title.trim().length === 0
					}
					onCancel={() => setIsAdding(false)}
					onSave={handleAddNewLink}
					setFormData={setFormData}
				/>
			)}
			<div className="space-y-6 border-t pt-6">
				<DndContext
					onDragEnd={handleDragEnd}
					onDragOver={handleDragOver}
					onDragStart={handleDragStart}
					sensors={sensors}
				>
					<SortableContext
						items={unifiedItems.map((item) => item.id)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-3">
							{unifiedItems.map((item) => (
								<SortableItem id={item.id} key={item.id}>
									{({ listeners, setActivatorNodeRef }) => {
										if (item.type === "section") {
											return (
												<div
													ref={setActivatorNodeRef}
													{...listeners}
													className="touch-none"
												>
													<SectionCard
														section={item.data as SectionItem}
														onSectionUpdate={handleSectionUpdate}
														onSectionDelete={handleSectionDelete}
														onSectionUngroup={handleSectionUngroup}
														onArchiveLink={handleArchiveLink}
														onDeleteLink={handleDeleteLink}
														onSaveEditing={saveEditing}
														onToggleActive={toggleActive}
														onToggleSensitive={toggleSensitive}
														onLinkChange={handleLinkChange}
														onCancelEditing={handleCancelEditing}
														onStartEditing={handleStartEditing}
														onClickLink={handleClickLink}
													/>
												</div>
											);
										}
										return (
											<LinkCard
												link={item.data as LinkItem}
												listeners={listeners}
												setActivatorNodeRef={setActivatorNodeRef}
												onLinkChange={handleLinkChange}
												onSaveEditing={saveEditing}
												onCancelEditing={handleCancelEditing}
												onStartEditing={handleStartEditing}
												onToggleActive={toggleActive}
												onToggleSensitive={toggleSensitive}
												onArchiveLink={handleArchiveLink}
												onDeleteLink={handleDeleteLink}
												onClickLink={handleClickLink}
											/>
										);
									}}
								</SortableItem>
							))}
						</div>
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
};

export default LinksTabContent;

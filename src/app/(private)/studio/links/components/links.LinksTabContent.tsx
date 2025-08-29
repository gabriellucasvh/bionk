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

// --- HELPERS ---
const reorderItems = (
	unifiedItems: UnifiedItem[],
	activeId: string,
	overId: string
) => {
	const oldIndex = unifiedItems.findIndex((item) => item.id === activeId);
	const newIndex = unifiedItems.findIndex((item) => item.id === overId);

	if (oldIndex === -1 || newIndex === -1) {
		return unifiedItems;
	}

	return arrayMove(unifiedItems, oldIndex, newIndex);
};

const buildLinksPayload = (items: UnifiedItem[]) => {
	const payload: { id: number; sectionTitle: string | null }[] = [];

	for (const item of items) {
		if (item.type === "section") {
			const section = item.data as SectionItem;
			for (const link of section.links) {
				payload.push({ id: link.id, sectionTitle: section.title });
			}
		} else {
			const link = item.data as LinkItem;
			payload.push({ id: link.id, sectionTitle: null });
		}
	}

	return payload;
};

const persistReorder = async (
	items: UnifiedItem[],
	mutateLinks: () => Promise<any>
) => {
	const linksPayload = buildLinksPayload(items);

	await fetch("/api/links/reorder", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ links: linksPayload }),
	});

	await mutateLinks();
};

// --- COMPONENTE PRINCIPAL ---
const LinksTabContent = ({
	initialLinks,
	mutateLinks,
}: LinksTabContentProps) => {
	const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
	const [_activeId, setActiveId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState<LinkFormData>(initialFormData);
	const [originalLink, setOriginalLink] = useState<LinkItem | null>(null);

	useEffect(() => {
		const sortedLinks = [...initialLinks].sort((a, b) => a.order - b.order);
		const sections: Record<string, SectionItem> = {};
		const generalLinks: LinkItem[] = [];

		for (const link of sortedLinks) {
			if (link.sectionTitle && link.sectionId) {
				const sectionId = `section-${link.sectionTitle.replace(/\s+/g, "-")}`;
				if (!sections[sectionId]) {
					sections[sectionId] = {
						id: sectionId,
						dbId: link.sectionId,
						title: link.sectionTitle,
						links: [],
						active: link.active,
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

	// --- DRAG HELPERS ---
	const findContainerId = (itemId: string): string | null => {
		if (itemId.startsWith("section-")) {
			return itemId;
		}
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

	const moveLinkBetweenSections = (
		activeId: string,
		overId: string,
		items: UnifiedItem[]
	) => {
		const activeContainerId = findContainerId(activeId);
		const overContainerId = findContainerId(overId);

		if (!(activeContainerId && overContainerId)) {
			return items;
		}
		if (activeContainerId === overContainerId) {
			return items;
		}

		const updated = [...items];
		const activeSectionIndex = updated.findIndex(
			(item) => item.id === activeContainerId
		);
		const overSectionIndex = updated.findIndex(
			(item) => item.id === overContainerId
		);

		if (activeSectionIndex === -1 || overSectionIndex === -1) {
			return items;
		}

		const activeSection = updated[activeSectionIndex].data as SectionItem;
		const overSection = updated[overSectionIndex].data as SectionItem;

		const linkIndex = activeSection.links.findIndex(
			(link) => `link-${link.id}` === activeId
		);

		if (linkIndex === -1) {
			return items;
		}

		const [movedLink] = activeSection.links.splice(linkIndex, 1);
		overSection.links.push(movedLink);

		return updated;
	};

	// --- HANDLERS ---
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) {
			return;
		}
		if (active.id === over.id) {
			return;
		}
		if (!active.id.toString().startsWith("link-")) {
			return;
		}

		setUnifiedItems((prev) =>
			moveLinkBetweenSections(active.id.toString(), over.id.toString(), prev)
		);
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) {
			return;
		}
		if (active.id === over.id) {
			return;
		}

		const newOrderedItems = reorderItems(
			unifiedItems,
			active.id.toString(),
			over.id.toString()
		);

		if (newOrderedItems === unifiedItems) {
			return;
		}

		setUnifiedItems(newOrderedItems);
		await persistReorder(newOrderedItems, mutateLinks);
	};

	// --- Manipulação de Seções e Links ---
	const handleSectionUpdate = async (
		id: number,
		payload: Partial<SectionItem>
	) => {
		await fetch(`/api/sections/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		await mutateLinks();
	};

	const handleSectionDelete = async (id: number) => {
		await fetch(`/api/sections/${id}`, { method: "DELETE" });
		await mutateLinks();
	};

	const handleSectionUngroup = async (id: number) => {
		await fetch(`/api/sections/${id}/ungroup`, { method: "POST" });
		await mutateLinks();
	};

	const handleAddNewLink = async () => {
		let formattedUrl = formData.url.trim();
		if (!urlRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (!isValidUrl(formattedUrl)) {
			return;
		}

		await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData }),
		});

		await mutateLinks();
		setFormData(initialFormData);
		setIsAdding(false);
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
		await fetch(`/api/links/${id}`, { method: "DELETE" });
		await mutateLinks();
	};

	const handleArchiveLink = (id: number) => {
		handleLinkUpdate(id, { archived: true });
	};

	const toggleActive = (id: number, isActive: boolean) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { active: isActive });
		}
	};

	const toggleSensitive = (id: number) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { sensitive: !link.sensitive });
		}
	};

	const handleStartEditing = (id: number) => {
		const linkToEdit = initialLinks.find((l) => l.id === id);
		if (linkToEdit) {
			setOriginalLink(linkToEdit);
			setUnifiedItems((items) =>
				items.map((item) => {
					if (item.type === "link" && item.data.id === id) {
						return { ...item, data: { ...item.data, isEditing: true } };
					}
					if (item.type === "section") {
						const sectionData = item.data as SectionItem;
						const newLinks = sectionData.links.map((link) => {
							if (link.id === id) {
								return { ...link, isEditing: true };
							}
							return link;
						});
						return { ...item, data: { ...sectionData, links: newLinks } };
					}
					return item;
				})
			);
		}
	};

	const handleCancelEditing = (id: number) => {
		if (originalLink) {
			const linkToRestore = initialLinks.find((l) => l.id === id);
			if (linkToRestore) {
				setUnifiedItems((items) =>
					items.map((item) => {
						if (item.type === "link" && item.data.id === id) {
							return { ...item, data: { ...linkToRestore, isEditing: false } };
						}
						if (item.type === "section") {
							const sectionData = item.data as SectionItem;
							const newLinks = sectionData.links.map((link) => {
								if (link.id === id) {
									return { ...linkToRestore, isEditing: false };
								}
								return link;
							});
							return { ...item, data: { ...sectionData, links: newLinks } };
						}
						return item;
					})
				);
			}
		}
		setOriginalLink(null);
	};

	const handleLinkChange = (
		id: number,
		field: "title" | "url",
		value: string
	) => {
		setUnifiedItems((items) =>
			items.map((item) => {
				if (item.type === "link" && item.data.id === id) {
					return { ...item, data: { ...item.data, [field]: value } };
				}
				if (item.type === "section") {
					const sectionData = item.data as SectionItem;
					const newLinks = sectionData.links.map((link) => {
						if (link.id === id) {
							return { ...link, [field]: value };
						}
						return link;
					});
					return { ...item, data: { ...sectionData, links: newLinks } };
				}
				return item;
			})
		);
	};

	const handleClickLink = (id: number) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { clicks: link.clicks + 1 });
		}
	};

	// --- RENDER ---
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
												<SectionCard
													listeners={listeners}
													onArchiveLink={handleArchiveLink}
													onCancelEditing={handleCancelEditing}
													onClickLink={handleClickLink}
													onDeleteLink={handleDeleteLink}
													onLinkChange={handleLinkChange}
													onSaveEditing={saveEditing}
													onSectionDelete={handleSectionDelete}
													onSectionUngroup={handleSectionUngroup}
													onSectionUpdate={handleSectionUpdate}
													onStartEditing={handleStartEditing}
													onToggleActive={toggleActive}
													onToggleSensitive={toggleSensitive}
													section={item.data as SectionItem}
													setActivatorNodeRef={setActivatorNodeRef}
												/>
											);
										}
										return (
											<LinkCard
												link={item.data as LinkItem}
												listeners={listeners}
												onArchiveLink={handleArchiveLink}
												onCancelEditing={handleCancelEditing}
												onClickLink={handleClickLink}
												onDeleteLink={handleDeleteLink}
												onLinkChange={handleLinkChange}
												onSaveEditing={saveEditing}
												onStartEditing={handleStartEditing}
												onToggleActive={toggleActive}
												onToggleSensitive={toggleSensitive}
												setActivatorNodeRef={setActivatorNodeRef}
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

// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
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

// Regex para verificar se a URL já começa com http:// ou https://
const urlProtocolRegex = /^(https?:\/\/)/;

// --- HELPERS ---
const buildLinksPayload = (items: UnifiedItem[]) => {
	const payload: { id: number; sectionTitle: string | null }[] = [];
	const _order = 0;
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

	const findContainerId = (
		itemId: string,
		items: UnifiedItem[]
	): string | undefined => {
		if (itemId.startsWith("section-")) {
			return itemId;
		}

		for (const item of items) {
			if (item.type === "section") {
				const section = item.data as SectionItem;
				if (section.links.some((link) => `link-${link.id}` === itemId)) {
					return item.id;
				}
			}
		}
		return "root"; // It's a root-level item if not in any section
	};

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			setActiveId(null);
			return;
		}

		const activeId = active.id.toString();
		const overId = over.id.toString();

		setUnifiedItems((items) => {
			const activeContainerId = findContainerId(activeId, items);
			const overContainerId = findContainerId(over?.id.toString(), items);
			const overIsASectionContainer = overId.startsWith("section-");

			if (!(activeContainerId && overContainerId)) {
				return items;
			}

			let newItems = JSON.parse(JSON.stringify(items));

			if (activeContainerId === overContainerId) {
				// Reordering within the same container
				if (activeContainerId === "root") {
					// Reordering root items
					const activeIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === activeId
					);
					const overIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === overId
					);
					if (activeIndex !== -1 && overIndex !== -1) {
						newItems = arrayMove(newItems, activeIndex, overIndex);
					}
				} else {
					// Reordering links within a section
					const sectionIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === activeContainerId
					);
					if (sectionIndex !== -1) {
						const section = newItems[sectionIndex].data as SectionItem;
						const activeIndex = section.links.findIndex(
							(l) => `link-${l.id}` === activeId
						);
						const overIndex = section.links.findIndex(
							(l) => `link-${l.id}` === overId
						);

						if (activeIndex !== -1 && overIndex !== -1) {
							section.links = arrayMove(section.links, activeIndex, overIndex);
						}
					}
				}
			} else {
				// Moving between containers
				let activeLinkData: LinkItem | undefined;

				// 1. Find and remove the link from its source
				if (activeContainerId === "root") {
					const activeIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === activeId
					);
					if (activeIndex !== -1) {
						activeLinkData = newItems[activeIndex].data as LinkItem;
						newItems.splice(activeIndex, 1);
					}
				} else {
					const sectionIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === activeContainerId
					);
					if (sectionIndex !== -1) {
						const section = newItems[sectionIndex].data as SectionItem;
						const linkIndex = section.links.findIndex(
							(l: LinkItem) => `link-${l.id}` === activeId
						);
						if (linkIndex !== -1) {
							[activeLinkData] = section.links.splice(linkIndex, 1);
						}
					}
				}

				if (!activeLinkData) {
					return items;
				}

				const targetContainerId = overIsASectionContainer
					? overId
					: overContainerId;

				if (targetContainerId === "root") {
					const overIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === overId
					);
					if (overIndex !== -1) {
						newItems.splice(overIndex, 0, {
							id: activeId,
							type: "link",
							data: activeLinkData,
						});
					} else {
						newItems.push({ id: activeId, type: "link", data: activeLinkData });
					}
				} else {
					const sectionIndex = newItems.findIndex(
						(item: UnifiedItem) => item.id === targetContainerId
					);
					if (sectionIndex !== -1) {
						const section = newItems[sectionIndex].data as SectionItem;
						const overIndex = section.links.findIndex(
							(l: LinkItem) => `link-${l.id}` === overId
						);

						if (overIndex !== -1) {
							section.links.splice(overIndex, 0, activeLinkData);
						} else {
							section.links.push(activeLinkData);
						}
					}
				}
			}
			persistReorder(newItems, mutateLinks);
			return newItems;
		});

		setActiveId(null);
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
		// Usa o regex do top-level
		if (!urlProtocolRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (!isValidUrl(formattedUrl)) {
			return;
		}

		await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData, url: formattedUrl }),
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
		let formattedUrl = url.trim();
		// Usa o regex do top-level
		if (!urlProtocolRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		handleLinkUpdate(id, { title, url: formattedUrl, isEditing: false });
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
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
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

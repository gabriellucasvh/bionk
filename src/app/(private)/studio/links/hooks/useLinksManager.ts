// src/app/(private)/studio/links/hooks/useLinksManager.ts

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import type { LinkItem, SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";

// --- TIPOS E CONSTANTES ---
export type LinkFormData = {
	title: string;
	url: string;
	sectionTitle: string;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
};

export type SectionFormData = {
	title: string;
};

export type UnifiedItem = {
	id: string;
	type: "section" | "link";
	data: SectionItem | LinkItem;
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

const initialSectionFormData: SectionFormData = {
	title: "",
};

const urlProtocolRegex = /^(https?:\/\/)/;

// --- FUNÇÕES AUXILIARES PARA DRAG AND DROP ---

/**
 * Remove um item da sua posição original.
 * Retorna a lista de itens atualizada e os dados do item removido.
 */
const findAndRemoveItem = (
	items: UnifiedItem[],
	itemId: string,
	containerId: string
): { updatedItems: UnifiedItem[]; removedItemData: LinkItem | null } => {
	let removedItemData: LinkItem | null = null;
	if (containerId === "root") {
		const itemIndex = items.findIndex((item) => item.id === itemId);
		if (itemIndex !== -1) {
			removedItemData = items[itemIndex].data as LinkItem;
			items.splice(itemIndex, 1);
		}
	} else {
		const sectionIndex = items.findIndex((item) => item.id === containerId);
		if (sectionIndex !== -1) {
			const section = items[sectionIndex].data as SectionItem;
			const linkIndex = section.links.findIndex(
				(l) => `link-${l.id}` === itemId
			);
			if (linkIndex !== -1) {
				[removedItemData] = section.links.splice(linkIndex, 1);
			}
		}
	}
	return { updatedItems: items, removedItemData };
};

/**
 * Adiciona um item de link à sua nova posição.
 */
const findAndAddItem = (
	items: UnifiedItem[],
	itemData: LinkItem,
	itemId: string,
	overId: string,
	containerId: string
): UnifiedItem[] => {
	const overIsASectionContainer = overId.startsWith("section-");
	const targetContainerId = overIsASectionContainer ? overId : containerId;

	if (targetContainerId === "root") {
		const overIndex = items.findIndex((item) => item.id === overId);
		const newItem = { id: itemId, type: "link", data: itemData } as UnifiedItem;
		if (overIndex !== -1) {
			items.splice(overIndex, 0, newItem);
		} else {
			items.push(newItem);
		}
	} else {
		const sectionIndex = items.findIndex(
			(item) => item.id === targetContainerId
		);
		if (sectionIndex !== -1) {
			const section = items[sectionIndex].data as SectionItem;
			const overIndex = section.links.findIndex(
				(l) => `link-${l.id}` === overId
			);
			if (overIndex !== -1) {
				section.links.splice(overIndex, 0, itemData);
			} else {
				section.links.push(itemData);
			}
		}
	}
	return items;
};

/**
 * Lida com a reordenação de um item dentro do mesmo container.
 */
const reorderInSameContainer = (
	items: UnifiedItem[],
	activeId: string,
	overId: string,
	containerId: string
): UnifiedItem[] => {
	if (containerId === "root") {
		const activeIndex = items.findIndex((item) => item.id === activeId);
		const overIndex = items.findIndex((item) => item.id === overId);
		if (activeIndex !== -1 && overIndex !== -1) {
			return arrayMove(items, activeIndex, overIndex);
		}
	} else {
		const sectionIndex = items.findIndex((item) => item.id === containerId);
		if (sectionIndex !== -1) {
			const section = items[sectionIndex].data as SectionItem;
			const activeLinkIndex = section.links.findIndex(
				(l) => `link-${l.id}` === activeId
			);
			const overLinkIndex = section.links.findIndex(
				(l) => `link-${l.id}` === overId
			);

			if (activeLinkIndex !== -1 && overLinkIndex !== -1) {
				section.links = arrayMove(
					section.links,
					activeLinkIndex,
					overLinkIndex
				);
			}
		}
	}
	return items;
};

/**
 * Lida com a movimentação de um item entre diferentes containers.
 */
const moveBetweenContainers = (
	items: UnifiedItem[],
	activeId: string,
	overId: string,
	activeContainerId: string,
	overContainerId: string
): UnifiedItem[] => {
	const { updatedItems, removedItemData } = findAndRemoveItem(
		items,
		activeId,
		activeContainerId
	);

	if (!removedItemData) {
		return items; // Retorna os itens originais se nada foi removido
	}

	return findAndAddItem(
		updatedItems,
		removedItemData,
		activeId,
		overId,
		overContainerId
	);
};

// --- HOOK ---
export const useLinksManager = (
	initialLinks: LinkItem[],
	initialSections: SectionItem[],
	mutateLinks: () => Promise<any>,
	mutateSections: () => Promise<any>
) => {
	// ... (useState, useEffect, useMemo, findContainerId, etc. continuam iguais)
	const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [isAddingSection, setIsAddingSection] = useState(false);
	const [formData, setFormData] = useState<LinkFormData>(initialFormData);
	const [sectionFormData, setSectionFormData] = useState<SectionFormData>(
		initialSectionFormData
	);
	const [_originalLink, setOriginalLink] = useState<LinkItem | null>(null);

	useEffect(() => {
		const sortedLinks = [...initialLinks].sort((a, b) => a.order - b.order);
		const sections: Record<string, SectionItem> = {};
		const generalLinks: LinkItem[] = [];

		// Primeiro, criar seções a partir dos links
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

		// Depois, adicionar seções vazias que não têm links
		for (const section of initialSections) {
			const sectionId = `section-${section.title.replace(/\s+/g, "-")}`;
			if (!sections[sectionId]) {
				sections[sectionId] = {
					id: sectionId,
					dbId: Number(section.id),
					title: section.title,
					links: [],
					active: section.active,
					order: section.order,
				};
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
	}, [initialLinks, initialSections]);

	const existingSections = useMemo(() => {
		return unifiedItems
			.filter((item) => item.type === "section")
			.map((item) => (item.data as SectionItem).title);
	}, [unifiedItems]);

	const findContainerId = (itemId: string): string => {
		if (itemId.startsWith("section-")) {
			return itemId;
		}
		for (const item of unifiedItems) {
			if (
				item.type === "section" &&
				(item.data as SectionItem).links.some(
					(link) => `link-${link.id}` === itemId
				)
			) {
				return item.id;
			}
		}
		return "root";
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

	const persistReorder = async (items: UnifiedItem[]) => {
		const linksPayload = buildLinksPayload(items);
		await fetch("/api/links/reorder", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ links: linksPayload }),
		});
		await mutateLinks();
		await mutateSections();
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			setActiveId(null);
			return;
		}

		const activeIdStr = active.id.toString();
		const overIdStr = over.id.toString();

		const activeContainerId = findContainerId(activeIdStr);
		const overContainerId = findContainerId(overIdStr);

		if (!(activeContainerId && overContainerId)) {
			setActiveId(null);
			return;
		}

		setUnifiedItems((currentItems) => {
			const newItems = JSON.parse(JSON.stringify(currentItems));
			let processedItems: UnifiedItem[];

			if (activeContainerId === overContainerId) {
				processedItems = reorderInSameContainer(
					newItems,
					activeIdStr,
					overIdStr,
					activeContainerId
				);
			} else {
				processedItems = moveBetweenContainers(
					newItems,
					activeIdStr,
					overIdStr,
					activeContainerId,
					overContainerId
				);
			}
			persistReorder(processedItems);
			return processedItems;
		});

		setActiveId(null);
	};

	// ... O resto dos handlers continuam aqui ...
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
		await mutateSections();
	};

	const handleSectionDelete = async (id: number) => {
		await fetch(`/api/sections/${id}`, { method: "DELETE" });
		await mutateLinks();
		await mutateSections();
	};

	const handleSectionUngroup = async (id: number) => {
		await fetch(`/api/sections/${id}/ungroup`, { method: "POST" });
		await mutateLinks();
		await mutateSections();
	};

	const handleAddNewLink = async () => {
		let formattedUrl = formData.url.trim();
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

	const handleAddNewSection = async () => {
		if (!sectionFormData.title.trim()) {
			return;
		}

		await fetch("/api/sections", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ title: sectionFormData.title.trim() }),
		});

		await mutateLinks();
		await mutateSections();
		setSectionFormData(initialSectionFormData);
		setIsAddingSection(false);
	};

	const handleAddLinkToSection = async (sectionTitle: string) => {
		let formattedUrl = formData.url.trim();
		if (!urlProtocolRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (!isValidUrl(formattedUrl)) {
			return;
		}

		await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData, url: formattedUrl, sectionTitle }),
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

	const handleArchiveLink = (id: number) =>
		handleLinkUpdate(id, { archived: true });

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

	const handleUpdateCustomImage = async (id: number, imageUrl: string) => {
		try {
			// A imagem já foi salva na API, agora só precisamos atualizar o estado local
			handleLinkUpdate(id, { customImageUrl: imageUrl });
			// Revalidar os dados para garantir sincronização
			await mutateLinks();
		} catch (error) {
			console.error("Erro ao atualizar imagem personalizada:", error);
		}
	};

	const handleStartEditing = (id: number) => {
		const linkToEdit = initialLinks.find((l) => l.id === id);
		if (linkToEdit) {
			setOriginalLink(linkToEdit);
			const updateEditingStatus = (items: UnifiedItem[]) =>
				items.map((item) => {
					if (item.type === "link" && item.data.id === id) {
						return { ...item, data: { ...item.data, isEditing: true } };
					}
					if (item.type === "section") {
						const sectionData = item.data as SectionItem;
						return {
							...item,
							data: {
								...sectionData,
								links: sectionData.links.map((link) =>
									link.id === id ? { ...link, isEditing: true } : link
								),
							},
						};
					}
					return item;
				});
			setUnifiedItems(updateEditingStatus);
		}
	};

	const handleCancelEditing = (id: number) => {
		const linkToRestore = initialLinks.find((l) => l.id === id);
		if (linkToRestore) {
			const updateItems = (items: UnifiedItem[]) =>
				items.map((item) => {
					if (item.type === "link" && item.data.id === id) {
						return { ...item, data: { ...linkToRestore, isEditing: false } };
					}
					if (item.type === "section") {
						const sectionData = item.data as SectionItem;
						return {
							...item,
							data: {
								...sectionData,
								links: sectionData.links.map((link) =>
									link.id === id ? { ...linkToRestore, isEditing: false } : link
								),
							},
						};
					}
					return item;
				});
			setUnifiedItems(updateItems);
		}
		setOriginalLink(null);
	};

	const handleLinkChange = (
		id: number,
		field: "title" | "url",
		value: string
	) => {
		const updateItems = (items: UnifiedItem[]) =>
			items.map((item) => {
				if (item.type === "link" && item.data.id === id) {
					return { ...item, data: { ...item.data, [field]: value } };
				}
				if (item.type === "section") {
					const sectionData = item.data as SectionItem;
					return {
						...item,
						data: {
							...sectionData,
							links: sectionData.links.map((link) =>
								link.id === id ? { ...link, [field]: value } : link
							),
						},
					};
				}
				return item;
			});
		setUnifiedItems(updateItems);
	};

	const handleClickLink = (id: number) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { clicks: link.clicks + 1 });
		}
	};

	return {
		unifiedItems,
		activeId,
		isAdding,
		isAddingSection,
		formData,
		sectionFormData,
		existingSections,
		setActiveId,
		setIsAdding,
		setIsAddingSection,
		setFormData,
		setSectionFormData,
		handleDragEnd,
		handleSectionUpdate,
		handleSectionDelete,
		handleSectionUngroup,
		handleAddNewLink,
		handleAddNewSection,
		handleAddLinkToSection,
		saveEditing,
		handleDeleteLink,
		handleArchiveLink,
		toggleActive,
		toggleSensitive,
		handleStartEditing,
		handleCancelEditing,
		handleLinkChange,
		handleClickLink,
		handleUpdateCustomImage,
	};
};

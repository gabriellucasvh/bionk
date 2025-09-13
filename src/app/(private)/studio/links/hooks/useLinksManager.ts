// src/app/(private)/studio/links/hooks/useLinksManager.ts

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	LinkItem,
	SectionItem,
	UnifiedDragItem,
} from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";

// --- TIPOS E CONSTANTES ---
export type LinkFormData = {
	title: string;
	url: string;
	sectionId?: number | null;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
};

export type SectionFormData = {
	title: string;
};

export type UnifiedItem = UnifiedDragItem;

const initialFormData: LinkFormData = {
	title: "",
	url: "",
	sectionId: null,
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
	const [archivingLinkId, setArchivingLinkId] = useState<number | null>(null);
	// Flag para controlar chamadas simultâneas da API
	const isReorderingRef = useRef(false);

	useEffect(() => {
		// Se estamos reordenando, não atualizar o estado para evitar conflitos visuais
		if (isReorderingRef.current) {
			return;
		}

		// Converter seções em LinkItems unificados
		const sectionItems: UnifiedItem[] = initialSections.map((section) => ({
			id: section.dbId || Number(section.id),
			title: section.title,
			url: "", // Seções não têm URL
			active: section.active,
			clicks: 0,
			sensitive: false,
			order: section.order,
			isSection: true,
			children: initialLinks.filter(
				(link) => link.sectionId === (section.dbId || Number(section.id))
			),
			dbId: section.dbId || Number(section.id),
		}));

		// Links gerais (sem seção)
		const generalLinks: UnifiedItem[] = initialLinks
			.filter((link) => !link.sectionId)
			.map((link) => ({ ...link }));

		// Combinar seções e links gerais
		const newUnifiedItems: UnifiedItem[] = [...sectionItems, ...generalLinks];

		newUnifiedItems.sort((a, b) => a.order - b.order);
		setUnifiedItems(newUnifiedItems);
	}, [initialLinks, initialSections]);

	const existingSections = useMemo(() => {
		return unifiedItems
			.filter((item) => item.isSection)
			.map((item) => item.title);
	}, [unifiedItems]);

	const persistReorder = useCallback(
		async (items: UnifiedItem[]) => {
			// Evitar chamadas simultâneas
			if (isReorderingRef.current) {
				return;
			}

			isReorderingRef.current = true;

			try {
				// Tratar tudo como links unificados - seções são links com type: 'section'
				const unifiedPayload = items.map((item, index) => ({
					id: item.id,
					order: index,
					type: item.isSection ? "section" : "link",
					sectionId: item.isSection ? null : item.sectionId || null,
				}));

				// Usar apenas a API de links para tudo
				await fetch("/api/links/reorder", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ items: unifiedPayload }),
				});

				// Atualizar o estado local imediatamente para refletir as mudanças
				setUnifiedItems(
					items.map((item, index) => ({
						...item,
						order: index,
					}))
				);

				// Aguardar um pouco antes de atualizar os dados para evitar conflitos
				setTimeout(async () => {
					await mutateLinks();
					// Não precisamos mais de mutateSections pois tudo é tratado como links
					isReorderingRef.current = false;
				}, 200);
			} catch (error) {
				console.error("Erro ao persistir reordenação:", error);
				isReorderingRef.current = false;
			}
		},
		[mutateLinks]
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) {
			return;
		}

		const draggedItemId = active.id.toString();
		const overId = over.id.toString();

		if (draggedItemId === overId) {
			return;
		}

		setUnifiedItems((prevItems) => {
			// Encontrar os índices dos itens
			const activeIndex = prevItems.findIndex((item) => {
				if (item.isSection) {
					return item.id.toString() === draggedItemId;
				}
				return `link-${item.id}` === draggedItemId;
			});

			const overIndex = prevItems.findIndex((item) => {
				if (item.isSection) {
					return item.id.toString() === overId;
				}
				return `link-${item.id}` === overId;
			});

			if (activeIndex === -1 || overIndex === -1) {
				return prevItems;
			}

			// Usar arrayMove para reordenar
			const newItems = arrayMove(prevItems, activeIndex, overIndex);

			// Persistir as mudanças
			persistReorder(newItems);

			return newItems;
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

	const handleAddLinkToSection = async (sectionId: number) => {
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
			body: JSON.stringify({ ...formData, url: formattedUrl, sectionId }),
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

	const handleArchiveLink = async (id: number) => {
		setArchivingLinkId(id);
		try {
			await handleLinkUpdate(id, { archived: true });
		} finally {
			setArchivingLinkId(null);
		}
	};

	const toggleActive = (id: number, isActive: boolean) => {
		const link = initialLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { active: isActive });
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

	const handleRemoveCustomImage = async (id: number) => {
		try {
			// Fazer a requisição DELETE para remover a imagem do servidor
			const response = await fetch(`/api/links/${id}/upload`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Erro ao remover imagem");
			}

			// Atualizar o estado local removendo a URL da imagem
			handleLinkUpdate(id, { customImageUrl: null });
			// Revalidar os dados para garantir sincronização
			await mutateLinks();
		} catch (error) {
			console.error("Erro ao remover imagem personalizada:", error);
		}
	};

	const handleStartEditing = (id: number) => {
		const linkToEdit = initialLinks.find((l) => l.id === id);
		if (linkToEdit) {
			setOriginalLink(linkToEdit);
			const updateEditingStatus = (items: UnifiedItem[]) =>
				items.map((item) => {
					if (!item.isSection && item.id === id) {
						return { ...item, isEditing: true };
					}
					if (item.isSection && item.children) {
						return {
							...item,
							children: item.children.map((link) =>
								link.id === id ? { ...link, isEditing: true } : link
							),
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
					if (!item.isSection && item.id === id) {
						return { ...linkToRestore, isEditing: false };
					}
					if (item.isSection && item.children) {
						return {
							...item,
							children: item.children.map((link) =>
								link.id === id ? { ...linkToRestore, isEditing: false } : link
							),
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
				if (!item.isSection && item.id === id) {
					return { ...item, [field]: value };
				}
				if (item.isSection && item.children) {
					return {
						...item,
						children: item.children.map((link) =>
							link.id === id ? { ...link, [field]: value } : link
						),
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
		archivingLinkId,
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
		handleStartEditing,
		handleCancelEditing,
		handleLinkChange,
		handleClickLink,
		handleUpdateCustomImage,
		handleRemoveCustomImage,
	};
};

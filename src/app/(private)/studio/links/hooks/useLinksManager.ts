// src/app/(private)/studio/links/hooks/useLinksManager.ts

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import type {
	ImageItem,
	LinkItem,
	SectionItem,
	TextItem,
	UnifiedDragItem,
	VideoItem,
} from "../types/links.types";
import { fetcher, isValidUrl } from "../utils/links.helpers";

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

export type TextFormData = {
	title: string;
	description: string;
	position: "left" | "center" | "right";
	hasBackground: boolean;
	isCompact: boolean;
	sectionId?: number | null;
};

export type VideoFormData = {
	title: string;
	description: string;
	url: string;
	type: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch";
	sectionId?: number | null;
};

export type ImageFormData = {
	title: string;
	description: string;
	layout: "single" | "column" | "carousel";
	ratio: string;
	sizePercent: number;
	images: Array<{ url: string; linkUrl?: string }>;
	sectionId?: number | null;
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

const initialTextFormData: TextFormData = {
	title: "",
	description: "",
	position: "left",
	hasBackground: true,
	isCompact: false,
	sectionId: null,
};

const initialVideoFormData: VideoFormData = {
	title: "",
	description: "",
	url: "",
	type: "direct",
	sectionId: null,
};

const initialImageFormData: ImageFormData = {
	title: "",
	description: "",
	layout: "single",
	ratio: "square",
	sizePercent: 100,
	images: [],
	sectionId: null,
};

const urlProtocolRegex = /^(https?:\/\/)/;

// --- FUNÇÕES AUXILIARES PARA DRAG AND DROP ---

// --- HOOK ---
export const useLinksManager = (
	currentLinks: LinkItem[],
	currentSections: SectionItem[],
	currentTexts: TextItem[],
	currentVideos: VideoItem[],
	mutateLinks: () => Promise<any>,
	mutateSections: () => Promise<any>,
	mutateTexts: () => Promise<any>,
	mutateVideos: () => Promise<any>
) => {
	// ... (useState, useEffect, useMemo, findContainerId, etc. continuam iguais)
	const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [isAddingSection, setIsAddingSection] = useState(false);
	const [isAddingText, setIsAddingText] = useState(false);
	const [isAddingVideo, setIsAddingVideo] = useState(false);
	const [isAddingImage, setIsAddingImage] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState<LinkFormData>(initialFormData);
	const [sectionFormData, setSectionFormData] = useState<SectionFormData>(
		initialSectionFormData
	);
	const [textFormData, setTextFormData] =
		useState<TextFormData>(initialTextFormData);
	const [videoFormData, setVideoFormData] =
		useState<VideoFormData>(initialVideoFormData);
	const [imageFormData, setImageFormData] =
		useState<ImageFormData>(initialImageFormData);
	const [_originalLink, setOriginalLink] = useState<LinkItem | null>(null);
	const [_originalText, setOriginalText] = useState<TextItem | null>(null);
	const [_originalVideo, setOriginalVideo] = useState<VideoItem | null>(null);
	const [_originalImage, setOriginalImage] = useState<ImageItem | null>(null);
	const [archivingLinkId, setArchivingLinkId] = useState<number | null>(null);
	const [togglingLinkId, setTogglingLinkId] = useState<number | null>(null);
	const [togglingTextId, setTogglingTextId] = useState<number | null>(null);
	const [togglingVideoId, setTogglingVideoId] = useState<number | null>(null);
	const [togglingImageId, setTogglingImageId] = useState<number | null>(null);
	const [togglingSectionId, setTogglingSectionId] = useState<number | null>(
		null
	);
	// Flag para controlar chamadas simultâneas da API
	const isReorderingRef = useRef(false);

	// Buscar imagens via SWR dentro do hook
	const { data: imagesRes, mutate: mutateImages } = useSWR(
		"/api/images",
		fetcher
	);
	// Importante: estabiliza a referência de currentImages para evitar re-render infinito
	const currentImages: ImageItem[] = useMemo(
		() => imagesRes?.images ?? [],
		[imagesRes]
	);

	useEffect(() => {
		// Se estamos reordenando, não atualizar o estado para evitar conflitos visuais
		if (isReorderingRef.current) {
			return;
		}

		// Converter seções em LinkItems unificados
		const sectionItems: UnifiedItem[] = currentSections.map((section) => ({
			id: section.dbId || Number(section.id),
			title: section.title,
			url: "", // Seções não têm URL
			active: section.active,
			clicks: 0,
			sensitive: false,
			order: section.order,
			isSection: true,
			children: currentLinks.filter(
				(link) => link.sectionId === (section.dbId || Number(section.id))
			),
			dbId: section.dbId || Number(section.id),
		}));

		// Converter textos em UnifiedItems
		const textItems: UnifiedItem[] = currentTexts.map((text) => {
			const existingItem = unifiedItems.find(
				(item) => item.isText && item.id === text.id
			);
			return {
				...text,
				url: null,
				clicks: 0,
				sensitive: false,
				isText: true,
				isEditing: existingItem?.isEditing,
			};
		});

		// Converter vídeos em UnifiedItems
		const videoItems: UnifiedItem[] = currentVideos.map((video) => {
			const existingItem = unifiedItems.find(
				(item) => item.isVideo && item.id === video.id
			);
			return {
				...video,
				clicks: 0,
				sensitive: false,
				isVideo: true,
				isEditing: existingItem?.isEditing,
			};
		});

		// Converter imagens em UnifiedItems
		const imageItems: UnifiedItem[] = currentImages.map((image) => {
			const existingItem = unifiedItems.find(
				(item) => (item as any).isImage && item.id === image.id
			);
			return {
				...(image as any),
				clicks: 0,
				sensitive: false,
				isImage: true as any,
				isEditing: existingItem?.isEditing,
			} as any;
		});

		// Links gerais (sem seção)
		const generalLinks: UnifiedItem[] = currentLinks
			.filter((link) => !link.sectionId)
			.map((link) => ({ ...link }));

		// Combinar todos os itens (seções, links gerais, textos, vídeos e imagens) em uma única lista
		const allItems: UnifiedItem[] = [
			...sectionItems,
			...generalLinks,
			...textItems,
			...videoItems,
			...imageItems,
		];

		// Ordenar todos os itens juntos por order
		allItems.sort((a, b) => a.order - b.order);
		setUnifiedItems(allItems);
	}, [
		currentLinks,
		currentSections,
		currentTexts,
		currentVideos,
		currentImages,
	]);

	const existingSections = useMemo(() => {
		return unifiedItems
			.filter((item) => item.isSection)
			.map((item) => ({
				id: item.id.toString(),
				title: item.title || "",
				order: item.order,
				active: item.active,
				dbId: item.dbId || item.id,
				links: item.children || [],
			}));
	}, [unifiedItems]);

	const persistReorder = useCallback(
		async (items: UnifiedItem[]) => {
			// Evitar chamadas simultâneas
			if (isReorderingRef.current) {
				return;
			}

			isReorderingRef.current = true;

			try {
				// Separar itens por tipo para usar as APIs corretas
				const linkItems = items
					.filter((item) => !(item.isSection || item.isText || item.isVideo))
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const sectionItems = items
					.filter((item) => item.isSection)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const textItems = items
					.filter((item) => item.isText)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const videoItems = items
					.filter((item) => item.isVideo)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const imageItems = items
					.filter((item) => (item as any).isImage)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				// Fazer chamadas para as APIs específicas
				const promises: Promise<Response>[] = [];

				if (linkItems.length > 0) {
					promises.push(
						fetch("/api/links/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: linkItems }),
						})
					);
				}

				if (sectionItems.length > 0) {
					promises.push(
						fetch("/api/sections/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: sectionItems }),
						})
					);
				}

				if (textItems.length > 0) {
					promises.push(
						fetch("/api/texts/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: textItems }),
						})
					);
				}

				if (videoItems.length > 0) {
					promises.push(
						fetch("/api/videos/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: videoItems }),
						})
					);
				}

				if (imageItems.length > 0) {
					promises.push(
						fetch("/api/images/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: imageItems }),
						})
					);
				}

				await Promise.all(promises);

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
					await mutateSections();
					await mutateTexts();
					await mutateVideos();
					await mutateImages();
					isReorderingRef.current = false;
				}, 200);
			} catch (error) {
				console.error("Erro ao persistir reordenação:", error);
				isReorderingRef.current = false;
			}
		},
		[mutateLinks, mutateSections, mutateTexts, mutateVideos, mutateImages]
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
				if (item.isText) {
					return `item-${item.id}` === draggedItemId;
				}
				if (item.isVideo) {
					return `item-${item.id}` === draggedItemId;
				}
				return `item-${item.id}` === draggedItemId;
			});

			const overIndex = prevItems.findIndex((item) => {
				if (item.isSection) {
					return item.id.toString() === overId;
				}
				if (item.isText) {
					return `item-${item.id}` === overId;
				}
				if (item.isVideo) {
					return `item-${item.id}` === overId;
				}
				return `item-${item.id}` === overId;
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
		try {
			if ("active" in payload) {
				setTogglingSectionId(id);
			}
			await fetch(`/api/sections/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			await mutateLinks();
			await mutateSections();
		} finally {
			if ("active" in payload) {
				setTogglingSectionId(null);
			}
		}
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
		await mutateSections();
		await mutateTexts();
		await mutateVideos();
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
		await mutateTexts();
		await mutateVideos();
		setSectionFormData(initialSectionFormData);
		setIsAddingSection(false);
	};

	const handleAddNewText = async () => {
		if (!(textFormData.title.trim() && textFormData.description.trim())) {
			return;
		}

		await fetch("/api/texts", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: textFormData.title.trim(),
				description: textFormData.description.trim(),
				position: textFormData.position,
				hasBackground: textFormData.hasBackground,
				isCompact: textFormData.isCompact,
				sectionId: textFormData.sectionId,
			}),
		});

		await mutateLinks();
		await mutateSections();
		await mutateTexts();
		await mutateVideos();
		setTextFormData(initialTextFormData);
		setIsAddingText(false);
	};

	const handleAddNewVideo = async () => {
		if (!videoFormData.url.trim()) {
			return;
		}

		await fetch("/api/videos", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: videoFormData.title.trim() || null,
				description: videoFormData.description.trim() || null,
				url: videoFormData.url.trim(),
				sectionId: videoFormData.sectionId,
			}),
		});

		await mutateLinks();
		await mutateSections();
		await mutateTexts();
		await mutateVideos();
		await mutateImages();
		setVideoFormData(initialVideoFormData);
		setIsAddingVideo(false);
	};

	const handleAddNewImage = async () => {
		const images = Array.isArray(imageFormData.images)
			? imageFormData.images.filter((i) => i.url?.trim())
			: [];
		if (images.length === 0) {
			return;
		}

		// Para layout "single", garantir apenas 1 imagem
		const items = (
			imageFormData.layout === "single" ? images.slice(0, 1) : images
		).map((img) => {
			const raw = img.linkUrl?.trim();
			let linkUrl = raw && raw.length > 0 ? raw : null;
			if (linkUrl) {
				if (!urlProtocolRegex.test(linkUrl)) {
					linkUrl = `https://${linkUrl}`;
				}
				if (!isValidUrl(linkUrl)) {
					linkUrl = null;
				}
			}
			return { url: img.url.trim(), linkUrl };
		});

		await fetch("/api/images", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title:
					imageFormData.layout === "column"
						? imageFormData.title.trim() || null
						: imageFormData.title.trim() || null,
				description: imageFormData.description.trim() || null,
				layout: imageFormData.layout,
				ratio: imageFormData.ratio,
				sizePercent: imageFormData.sizePercent,
				sectionId: imageFormData.sectionId,
				items,
			}),
		});

		await mutateLinks();
		await mutateSections();
		await mutateTexts();
		await mutateVideos();
		await mutateImages();
		setImageFormData(initialImageFormData);
		setIsAddingImage(false);
	};

	const handleVideoUpdate = async (id: number, payload: Partial<VideoItem>) => {
		const response = await fetch(`/api/videos/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao atualizar vídeo");
		}

		await mutateVideos();
	};

	const handleDeleteVideo = async (id: number) => {
		await fetch(`/api/videos/${id}`, { method: "DELETE" });
		await mutateVideos();
	};

	const handleArchiveVideo = async (id: number) => {
		await handleVideoUpdate(id, { archived: true });
	};

	const handleStartEditingVideo = (id: number) => {
		const videoToEdit = unifiedItems.find(
			(item) => item.isVideo && item.id === id
		) as VideoItem;
		if (videoToEdit) {
			setOriginalVideo(videoToEdit);
		}

		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				// Cancelar edição de todos os outros items
				if (item.isEditing && item.id !== id) {
					return { ...item, isEditing: false };
				}
				// Ativar edição apenas do item específico
				if (item.isVideo && item.id === id) {
					return { ...item, isEditing: true };
				}
				return item;
			})
		);
	};

	const handleVideoChange = (
		id: number,
		field: "title" | "description" | "url",
		value: string
	) => {
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if (item.isVideo && item.id === id) {
					return { ...item, [field]: value };
				}
				return item;
			})
		);
	};

	const handleSaveEditingVideo = async (
		id: number,
		title: string,
		description: string,
		url: string
	) => {
		await handleVideoUpdate(id, {
			title,
			description,
			url,
			isEditing: false,
		});
	};

	const handleCancelEditingVideo = (id: number) => {
		const videoToRestore = currentVideos.find((v) => v.id === id);
		if (videoToRestore) {
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if (item.isVideo && item.id === id) {
						return {
							...videoToRestore,
							isVideo: true,
							isEditing: false,
						};
					}
					return item;
				})
			);
		}
		setOriginalVideo(null);
	};

	const handleImageUpdate = async (id: number, payload: Partial<ImageItem>) => {
		const response = await fetch(`/api/images/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao atualizar imagem");
		}

		await mutateImages();
	};

	const handleDeleteImage = async (id: number) => {
		await fetch(`/api/images/${id}`, { method: "DELETE" });
		await mutateImages();
	};

	const handleArchiveImage = async (id: number) => {
		await handleImageUpdate(id, { archived: true });
	};

	const handleStartEditingImage = (id: number) => {
		const imageToEdit = unifiedItems.find(
			(item) => (item as any).isImage && item.id === id
		) as ImageItem;
		if (imageToEdit) {
			setOriginalImage(imageToEdit);
		}

		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				// Cancelar edição de todos os outros items
				if (item.isEditing && item.id !== id) {
					return { ...item, isEditing: false } as any;
				}
				// Ativar edição apenas do item específico
				if ((item as any).isImage && item.id === id) {
					return { ...item, isEditing: true } as any;
				}
				return item;
			})
		);
	};

	const handleImageChange = (
		id: number,
		field: "title" | "description",
		value: string
	) => {
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if ((item as any).isImage && item.id === id) {
					return { ...item, [field]: value } as any;
				}
				return item;
			})
		);
	};

	const handleSaveEditingImage = async (
		id: number,
		title: string,
		description: string
	) => {
		await handleImageUpdate(id, {
			title,
			description,
			isEditing: false as any,
		});
	};

	const handleCancelEditingImage = (id: number) => {
		const imageToRestore = currentImages.find((i) => i.id === id);
		if (imageToRestore) {
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if ((item as any).isImage && item.id === id) {
						return {
							...(imageToRestore as any),
							isImage: true,
							isEditing: false,
						} as any;
					}
					return item;
				})
			);
		}
		setOriginalImage(null);
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

	const toggleActive = async (id: number, isActive: boolean) => {
		// Encontrar o item no unifiedItems para determinar o tipo correto
		const foundItem = unifiedItems.find((item) => item.id === id);

		console.log("toggleActive called with:", { id, isActive });
		console.log("Found item:", {
			item: !!foundItem,
			isText: foundItem?.isText,
			isVideo: foundItem?.isVideo,
			isSection: foundItem?.isSection,
		});

		if (!foundItem) {
			console.error("Item não encontrado:", id);
			return;
		}

		try {
			if (foundItem.isVideo) {
				console.log("Toggling video:", id);
				setTogglingVideoId(id);
				await handleVideoUpdate(id, { active: isActive });
			} else if ((foundItem as any).isImage) {
				console.log("Toggling image:", id);
				setTogglingImageId(id);
				await handleImageUpdate(id, { active: isActive });
			} else if (foundItem.isText) {
				console.log("Toggling text:", id);
				setTogglingTextId(id);
				await handleTextUpdate(id, { active: isActive });
			} else if (foundItem.isSection) {
				console.log("Toggling section:", id);
				setTogglingSectionId(id);
				await handleSectionUpdate(id, { active: isActive });
			} else {
				// Se não é texto, vídeo ou seção, deve ser um link
				console.log("Toggling link:", id);
				setTogglingLinkId(id);
				await handleLinkUpdate(id, { active: isActive });
			}
		} finally {
			setTogglingLinkId(null);
			setTogglingTextId(null);
			setTogglingVideoId(null);
			setTogglingImageId(null);
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
		const linkToEdit = currentLinks.find((l) => l.id === id);
		if (linkToEdit) {
			setOriginalLink(linkToEdit);
			const updateEditingStatus = (items: UnifiedItem[]) =>
				items.map((item) => {
					// Cancelar edição de todos os outros items
					if (item.isEditing && item.id !== id) {
						return { ...item, isEditing: false };
					}
					// Ativar edição apenas do link específico (não texto nem vídeo)
					if (
						!(item.isSection || item.isText || item.isVideo) &&
						item.id === id
					) {
						return { ...item, isEditing: true };
					}
					if (item.isSection && item.children) {
						return {
							...item,
							children: item.children.map((link) => {
								// Cancelar edição de outros links na seção
								if (link.isEditing && link.id !== id) {
									return { ...link, isEditing: false };
								}
								// Ativar edição apenas do link específico
								return link.id === id ? { ...link, isEditing: true } : link;
							}),
						};
					}
					return item;
				});
			setUnifiedItems(updateEditingStatus);
		}
	};

	const handleCancelEditing = (id: number) => {
		const linkToRestore = currentLinks.find((l) => l.id === id);
		if (linkToRestore) {
			const updateItems = (items: UnifiedItem[]) =>
				items.map((item) => {
					// Restaurar apenas links (não texto nem vídeo)
					if (
						!(item.isSection || item.isText || item.isVideo) &&
						item.id === id
					) {
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
				// Atualizar apenas links (não texto nem vídeo)
				if (
					!(item.isSection || item.isText || item.isVideo) &&
					item.id === id
				) {
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
		const link = currentLinks.find((l) => l.id === id);
		if (link) {
			handleLinkUpdate(id, { clicks: link.clicks + 1 });
		}
	};

	const handleTextUpdate = async (id: number, payload: Partial<TextItem>) => {
		try {
			const response = await fetch(`/api/texts/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Falha ao atualizar texto");
			}

			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if (item.isText && item.id === id) {
						return { ...item, ...payload };
					}
					return item;
				})
			);

			await mutateTexts();
		} catch (error) {
			await mutateTexts();
			throw error;
		}
	};

	const handleDeleteText = async (id: number) => {
		await fetch(`/api/texts/${id}`, { method: "DELETE" });
		await mutateTexts();
	};

	const handleArchiveText = async (id: number) => {
		await handleTextUpdate(id, { archived: true });
	};

	const handleStartEditingText = (id: number) => {
		const textToEdit = unifiedItems.find(
			(item) => item.isText && item.id === id
		) as TextItem;
		if (textToEdit) {
			setOriginalText(textToEdit);
		}

		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				// Cancelar edição de todos os outros items
				if (item.isEditing && item.id !== id) {
					return { ...item, isEditing: false };
				}
				// Ativar edição apenas do item específico
				if (item.isText && item.id === id) {
					return { ...item, isEditing: true };
				}
				return item;
			})
		);
	};

	const handleTextChange = (
		id: number,
		field: "title" | "description" | "position" | "hasBackground" | "isCompact",
		value: string | boolean
	) => {
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if (item.isText && item.id === id) {
					return { ...item, [field]: value };
				}
				return item;
			})
		);
	};

	const handleSaveEditingText = async (
		id: number,
		title: string,
		description: string,
		position: "left" | "center" | "right",
		hasBackground: boolean,
		isCompact: boolean
	) => {
		await handleTextUpdate(id, {
			title,
			description,
			position,
			hasBackground,
			isCompact,
			isEditing: false,
		});
	};

	const handleCancelEditingText = (id: number) => {
		const textToRestore = currentTexts.find((t) => t.id === id);
		if (textToRestore) {
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if (item.isText && item.id === id) {
						return {
							...textToRestore,
							url: null,
							clicks: 0,
							sensitive: false,
							isText: true,
							isEditing: false,
						};
					}
					return item;
				})
			);
		}
		setOriginalText(null);
	};

	return {
		unifiedItems,
		activeId,
		isAdding,
		isAddingSection,
		isAddingText,
		isAddingVideo,
		isAddingImage,
		isModalOpen,
		formData,
		sectionFormData,
		textFormData,
		videoFormData,
		imageFormData,
		existingSections,
		archivingLinkId,
		setActiveId,
		setIsAdding,
		setIsAddingSection,
		setIsAddingText,
		setIsAddingVideo,
		setIsAddingImage,
		setIsModalOpen,
		setFormData,
		setSectionFormData,
		setTextFormData,
		setVideoFormData,
		setImageFormData,
		handleDragEnd,
		handleSectionUpdate,
		handleSectionDelete,
		handleSectionUngroup,
		handleAddNewLink,
		handleAddNewSection,
		handleAddNewText,
		handleAddNewVideo,
		handleAddNewImage,
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
		handleTextUpdate,
		handleDeleteText,
		handleArchiveText,
		handleStartEditingText,
		handleTextChange,
		handleSaveEditingText,
		handleCancelEditingText,
		handleVideoUpdate,
		handleDeleteVideo,
		handleArchiveVideo,
		handleStartEditingVideo,
		handleVideoChange,
		handleSaveEditingVideo,
		handleCancelEditingVideo,
		handleImageUpdate,
		handleDeleteImage,
		handleArchiveImage,
		handleStartEditingImage,
		handleImageChange,
		handleSaveEditingImage,
		handleCancelEditingImage,
		togglingLinkId,
		togglingTextId,
		togglingVideoId,
		togglingImageId,
		togglingSectionId,
		originalLink: _originalLink,
		originalText: _originalText,
		originalVideo: _originalVideo,
		originalImage: _originalImage,
	};
};

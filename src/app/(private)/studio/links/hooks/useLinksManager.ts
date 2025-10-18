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
	shareAllowed?: boolean;
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
	shareAllowed: false,
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
	const tempIdCounterRef = useRef(-1);
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
	const [togglingTextId] = useState<number | null>(null);
	const [togglingVideoId] = useState<number | null>(null);
	const [togglingImageId] = useState<number | null>(null);
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: depende de unifiedItems.find para preservar isEditing; adicionar unifiedItems causaria loops
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
					.filter((item) => !(item as any).isDraft)
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
					.filter((item) => !(item as any).isDraft)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const videoItems = items
					.filter((item) => item.isVideo)
					.filter((item) => !(item as any).isDraft)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				const imageItems = items
					.filter((item) => (item as any).isImage)
					.filter((item) => !(item as any).isDraft)
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
		// Criar rascunho local do link e abrir em modo edição
		const id = tempIdCounterRef.current--;
		const order = -1;
		const draft: LinkItem = {
			id,
			title: (formData.title || "").trim(),
			url: formData.url || "",
			active: true,
			clicks: 0,
			sensitive: false,
			order,
			isEditing: true,
			isDraft: true,
			archived: false,
			sectionId: formData.sectionId ?? null,
			badge: (formData.badge as any) || null,
			password: formData.password || null,
			expiresAt: null,
			deleteOnClicks: formData.deleteOnClicks ?? null,
			launchesAt: null,
			customImageUrl: null,
			shareAllowed: formData.shareAllowed ?? false,
		};
		setUnifiedItems((prev) => {
			const cleaned = prev
				.filter((item) => !(item as any).isDraft)
				.map((item) => (item.isEditing ? { ...item, isEditing: false } : item));
			const next = [draft, ...cleaned];
			return next.sort((a, b) => a.order - b.order);
		});
		setOriginalLink(null);
		setIsAdding(false);
		setFormData(initialFormData);
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
		// Criar rascunho local de texto e abrir em modo edição
		const id = tempIdCounterRef.current--;
		const order = -1;
		const draft: TextItem = {
			id,
			title: (textFormData.title || "").trim(),
			description: (textFormData.description || "").trim(),
			position: textFormData.position,
			hasBackground: textFormData.hasBackground,
			isCompact: textFormData.isCompact,
			active: true,
			order,
			userId: 0,
			isEditing: true,
			isDraft: true,
			archived: false,
			sectionId: textFormData.sectionId ?? null,
			isText: true,
			isSection: false,
			isVideo: false,
			dbId: undefined,
			children: undefined as never,
		};
		setUnifiedItems((prev) => {
			const cleaned = prev
				.filter((item) => !(item as any).isDraft)
				.map((item) => (item.isEditing ? { ...item, isEditing: false } : item));
			const next = [draft, ...cleaned];
			return next.sort((a, b) => a.order - b.order);
		});
		setOriginalText(null);
		setIsAddingText(false);
		setTextFormData(initialTextFormData);
	};

	const handleAddNewVideo = async () => {
		// Criar rascunho local de vídeo e abrir em modo edição
		const id = tempIdCounterRef.current--;
		const order = -1;
		const draft: VideoItem = {
			id,
			title: videoFormData.title?.trim() || null,
			description: videoFormData.description?.trim() || null,
			url: videoFormData.url || "",
			type: videoFormData.type,
			active: true,
			order,
			userId: 0,
			isEditing: true,
			isDraft: true,
			archived: false,
			sectionId: videoFormData.sectionId ?? null,
			isVideo: true,
			isSection: false,
			isText: false,
			dbId: undefined,
			children: undefined as never,
		};
		setUnifiedItems((prev) => {
			const cleaned = prev
				.filter((item) => !(item as any).isDraft)
				.map((item) => (item.isEditing ? { ...item, isEditing: false } : item));
			const next = [draft, ...cleaned];
			return next.sort((a, b) => a.order - b.order);
		});
		setOriginalVideo(null);
		setIsAddingVideo(false);
		setVideoFormData(initialVideoFormData);
	};

	const handleAddNewImage = async (override?: Partial<ImageFormData>) => {
		// Criar rascunho local de imagens e abrir em modo edição
		const id = tempIdCounterRef.current--;
		const order = -1;
		// Usar dados do estado com possíveis sobrescritas fornecidas
		const source: ImageFormData = {
			...imageFormData,
			...(override || {}),
		};
		// Sanitiza e limita as imagens vindas do formulário antes de criar o rascunho
		const maxCount = source.layout === "single" ? 1 : 10;
		const sanitizedItems = (source.images || [])
			.slice(0, maxCount)
			.map((img) => {
				let linkUrl = (img.linkUrl || "").trim();
				if (linkUrl.length > 0) {
					if (!urlProtocolRegex.test(linkUrl)) {
						linkUrl = `https://${linkUrl}`;
					}
					if (!isValidUrl(linkUrl)) {
						linkUrl = "";
					}
				}
				return { url: img.url, linkUrl: linkUrl || null } as any;
			});
		const draft: ImageItem = {
			id,
			title: source.title?.trim() || null,
			description: source.description?.trim() || null,
			layout: source.layout,
			ratio: source.ratio,
			sizePercent: Math.max(50, Math.min(100, source.sizePercent)),
			items: sanitizedItems,
			active: true,
			order,
			userId: 0,
			isEditing: true,
			isDraft: true,
			archived: false,
			sectionId: source.sectionId ?? null,
			isImage: true,
			isSection: false,
			isText: false,
			isVideo: false,
			dbId: undefined,
			children: undefined as never,
		};
		setUnifiedItems((prev) => {
			const cleaned = prev
				.filter((item) => !(item as any).isDraft)
				.map((item) => (item.isEditing ? { ...item, isEditing: false } : item));
			const next = [draft, ...cleaned];
			return next.sort((a, b) => a.order - b.order);
		});
		setOriginalImage(null);
		setIsAddingImage(false);
		setImageFormData(initialImageFormData);
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
		const target = unifiedItems.find(
			(item) => item.isVideo && item.id === id
		) as VideoItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			return;
		}
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
		const target = unifiedItems.find(
			(item) => item.isVideo && item.id === id
		) as VideoItem | undefined;
		if (target?.isDraft) {
			await fetch("/api/videos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title?.trim() || null,
					description: description?.trim() || null,
					url,
					sectionId: target.sectionId ?? null,
				}),
			});
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			await mutateVideos();
			await mutateSections();
			setOriginalVideo(null);
			return;
		}
		await handleVideoUpdate(id, {
			title,
			description,
			url,
			isEditing: false,
		});
	};

	const handleCancelEditingVideo = (id: number) => {
		const target = unifiedItems.find(
			(item) => item.isVideo && item.id === id
		) as VideoItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			setOriginalVideo(null);
			return;
		}
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
		const target = unifiedItems.find(
			(item) => (item as any).isImage && item.id === id
		) as ImageItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			return;
		}
		await fetch(`/api/images/${id}`, { method: "DELETE" });
		await mutateImages();
		await mutateSections();
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

	const normalizeImageItem = (img: ImageItem["items"][number]) => {
		const raw = (img.linkUrl || "").trim();
		let linkUrl = raw.length > 0 ? raw : null;
		if (linkUrl) {
			if (!urlProtocolRegex.test(linkUrl)) {
				linkUrl = `https://${linkUrl}`;
			}
			if (!isValidUrl(linkUrl)) {
				linkUrl = null;
			}
		}
		return { ...img, linkUrl } as any;
	};

	const handleSaveEditingImage =
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: função extensa, será refatorada futuramente
		async (id: number, payload: Partial<ImageItem>) => {
			const next: Partial<ImageItem> = { ...payload };
			if (typeof next.sizePercent === "number") {
				next.sizePercent = Math.max(50, Math.min(100, next.sizePercent));
			}
			if (Array.isArray(next.items)) {
				const maxCount = next.layout === "single" ? 1 : 10;
				const sanitizedItems = (next.items || [])
					.slice(0, maxCount)
					.map(normalizeImageItem);
				next.items = sanitizedItems;
			}
			const target = unifiedItems.find(
				(item) => (item as any).isImage && item.id === id
			) as ImageItem | undefined;
			if (target?.isDraft) {
				await fetch("/api/images", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: next.title ?? target.title ?? null,
						description: next.description ?? target.description ?? null,
						layout: next.layout ?? target.layout,
						ratio: next.ratio ?? target.ratio,
						sizePercent: Math.max(
							50,
							Math.min(100, (next.sizePercent ?? target.sizePercent) || 100)
						),
						sectionId: target.sectionId ?? null,
						items: next.items ?? target.items ?? [],
					}),
				});
				setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
				await mutateImages();
				await mutateSections();
				setOriginalImage(null);
				return;
			}
			// Fechar edição imediatamente no estado local para melhor UX
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if ((item as any).isImage && item.id === id) {
						return { ...(item as any), ...next, isEditing: false } as any;
					}
					return item;
				})
			);
			await handleImageUpdate(id, next);
		};

	const handleCancelEditingImage = (id: number) => {
		const target = unifiedItems.find(
			(item) => (item as any).isImage && item.id === id
		) as ImageItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			setOriginalImage(null);
			return;
		}
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

	// Link handlers adicionados
	const toggleActive = async (id: number, active: boolean) => {
		setTogglingLinkId(id);
		try {
			await handleLinkUpdate(id, { active });
		} finally {
			setTogglingLinkId(null);
		}
	};

	const handleArchiveLink = async (id: number) => {
		setArchivingLinkId(id);
		try {
			await handleLinkUpdate(id, { archived: true });
		} finally {
			setArchivingLinkId(null);
		}
	};

	const handleStartEditing = (id: number) => {
		const linkToEdit = unifiedItems.find(
			(item) =>
				!(item.isSection || item.isText || item.isVideo) && item.id === id
		) as LinkItem;
		if (linkToEdit) {
			setOriginalLink(linkToEdit);
		}
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if (item.isEditing && item.id !== id) {
					return { ...(item as any), isEditing: false } as any;
				}
				if (
					!(item.isSection || item.isText || item.isVideo) &&
					item.id === id
				) {
					return { ...(item as any), isEditing: true } as any;
				}
				return item;
			})
		);
	};

	const handleCancelEditing = (id: number) => {
		const target = unifiedItems.find(
			(item) =>
				!(item.isSection || item.isText || item.isVideo) && item.id === id
		) as LinkItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			setOriginalLink(null);
			return;
		}
		const linkToRestore = currentLinks.find((l) => l.id === id);
		if (linkToRestore) {
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if (
						!(item.isSection || item.isText || item.isVideo) &&
						item.id === id
					) {
						return { ...(linkToRestore as any), isEditing: false } as any;
					}
					return item;
				})
			);
		}
		setOriginalLink(null);
	};

	const handleLinkChange = (
		id: number,
		field: "title" | "url",
		value: string
	) => {
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if (
					!(item.isSection || item.isText || item.isVideo) &&
					item.id === id
				) {
					return { ...(item as any), [field]: value } as any;
				}
				return item;
			})
		);
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: validações agrupadas; refatoraremos em helpers
	const handleLinkAdvancedChange = (id: number, payload: Partial<LinkItem>) => {
		const sanitized: Partial<LinkItem> = {};
		if ("badge" in payload) {
			const v = (payload.badge ?? null) as any;
			const allowed: LinkItem["badge"][] = [
				"promovido",
				"15% off",
				"expirando",
			];
			sanitized.badge = allowed.includes(v as any)
				? (v as LinkItem["badge"])
				: null;
		}
		if ("password" in payload) {
			const p = payload.password?.trim() || null;
			sanitized.password = p;
		}
		if ("deleteOnClicks" in payload) {
			const n = payload.deleteOnClicks ?? null;
			sanitized.deleteOnClicks = n && n > 0 ? n : null;
		}
		if ("launchesAt" in payload) {
			sanitized.launchesAt = payload.launchesAt || null;
		}
		if ("expiresAt" in payload) {
			sanitized.expiresAt = payload.expiresAt || null;
		}
		if ("shareAllowed" in payload) {
			sanitized.shareAllowed = !!payload.shareAllowed;
		}

		setUnifiedItems((prev) =>
			prev.map((item) => {
				if (
					!(item.isSection || item.isText || item.isVideo) &&
					item.id === id
				) {
					return { ...(item as any), ...sanitized } as any;
				}
				return item;
			})
		);
	};

	const handleUpdateCustomImage = async (id: number, imageUrl: string) => {
		await handleLinkUpdate(id, { customImageUrl: imageUrl });
	};

	const handleRemoveCustomImage = async (id: number) => {
		await handleLinkUpdate(id, { customImageUrl: null });
	};

	const handleDeleteLink = async (id: number) => {
		const target = unifiedItems.find(
			(item) =>
				!(item.isSection || item.isText || item.isVideo) && item.id === id
		) as LinkItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			return;
		}
		await fetch(`/api/links/${id}`, { method: "DELETE" });
		await mutateLinks();
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: fluxo de criação/atualização é detalhado e será quebrado em helpers
	const saveEditing = async (id: number, title: string, url: string) => {
		const target = unifiedItems.find(
			(item) =>
				!(item.isSection || item.isText || item.isVideo) && item.id === id
		) as LinkItem | undefined;
		let formattedUrl = url.trim();
		if (!urlProtocolRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (target?.isDraft) {
			// Criação do link novo com campos avançados
			const res = await fetch("/api/links", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					url: formattedUrl,
					sectionId: target.sectionId ?? null,
					badge: target.badge ?? null,
					password: target.password ?? null,
					deleteOnClicks: target.deleteOnClicks ?? null,
					launchesAt: target.launchesAt ?? null,
					expiresAt: target.expiresAt ?? null,
					shareAllowed: target.shareAllowed ?? false,
				}),
			});

			if (!res.ok) {
				throw new Error("Falha ao criar link");
			}

			const newLink = await res.json();
			await mutateLinks();

			setUnifiedItems((prev) =>
				prev.map((item) => {
					if (
						(item as any).isSection &&
						Array.isArray((item as any).children)
					) {
						return {
							...item,
							children: (item as any).children.map((link: any) =>
								link.id === id
									? {
											...(link as any),
											...newLink,
											isDraft: false,
											isEditing: false,
										}
									: link
							),
						} as UnifiedItem;
					}
					if (
						!(
							(item as any).isSection ||
							(item as any).isText ||
							(item as any).isVideo
						) &&
						item.id === id
					) {
						return {
							...(item as any),
							...newLink,
							isDraft: false,
							isEditing: false,
						} as UnifiedItem;
					}
					return item;
				})
			);
			return;
		}

		// Atualização de link existente incluindo campos avançados
		await handleLinkUpdate(id, {
			title,
			url: formattedUrl,
			badge: target?.badge ?? null,
			password: target?.password ?? null,
			deleteOnClicks: target?.deleteOnClicks ?? null,
			launchesAt: target?.launchesAt ?? null,
			expiresAt: target?.expiresAt ?? null,
			shareAllowed: target?.shareAllowed ?? false,
			isEditing: false,
		});
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
		const target = unifiedItems.find((item) => item.isText && item.id === id) as
			| TextItem
			| undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			return;
		}
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
		const target = unifiedItems.find((item) => item.isText && item.id === id) as
			| TextItem
			| undefined;
		if (target?.isDraft) {
			await fetch("/api/texts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					description,
					position,
					hasBackground,
					isCompact,
					sectionId: target.sectionId ?? null,
				}),
			});
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			await mutateTexts();
			await mutateSections();
			setOriginalText(null);
			return;
		}
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
		const target = unifiedItems.find((item) => item.isText && item.id === id) as
			| TextItem
			| undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			setOriginalText(null);
			return;
		}
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
		handleLinkAdvancedChange,
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

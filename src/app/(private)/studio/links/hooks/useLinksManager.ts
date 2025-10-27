// src/app/(private)/studio/links/hooks/useLinksManager.ts

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDesignStore } from "@/stores/designStore";
// import useSWR from "swr";
import type {
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	UnifiedDragItem,
	VideoItem,
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

export type MusicFormData = {
	title: string;
	url: string;
	usePreview: boolean;
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

const initialMusicFormData: MusicFormData = {
	title: "",
	url: "",
	usePreview: true,
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
	currentImages: ImageItem[],
	currentMusics: MusicItem[],
	mutateLinks: () => Promise<any>,
	mutateSections: () => Promise<any>,
	mutateTexts: () => Promise<any>,
	mutateVideos: () => Promise<any>,
	mutateImages: () => Promise<any>,
	mutateMusics: () => Promise<any>
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
	const [isAddingMusic, setIsAddingMusic] = useState(false);
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
	const [musicFormData, setMusicFormData] =
		useState<MusicFormData>(initialMusicFormData);
	const [_originalLink, setOriginalLink] = useState<LinkItem | null>(null);
	const [_originalText, setOriginalText] = useState<TextItem | null>(null);
	const [_originalVideo, setOriginalVideo] = useState<VideoItem | null>(null);
	const [_originalImage, setOriginalImage] = useState<ImageItem | null>(null);
	const [_originalMusic, setOriginalMusic] = useState<MusicItem | null>(null);
	const [archivingLinkId, setArchivingLinkId] = useState<number | null>(null);
	const [togglingLinkId, setTogglingLinkId] = useState<number | null>(null);
	const [togglingTextId, setTogglingTextId] = useState<number | null>(null);
	const [togglingVideoId, setTogglingVideoId] = useState<number | null>(null);
	const [togglingImageId, setTogglingImageId] = useState<number | null>(null);
	const [togglingMusicId, setTogglingMusicId] = useState<number | null>(null);
	const [togglingSectionId, setTogglingSectionId] = useState<number | null>(
		null
	);
	// Flag para controlar chamadas simultâneas da API
	const isReorderingRef = useRef(false);

	// Imagens são fornecidas via props: currentImages e mutateImages

	// Fecha qualquer criação ativa e remove rascunhos de unifiedItems
	const closeAllActiveCreations = useCallback(() => {
		setIsAdding(false);
		setIsAddingSection(false);
		setIsAddingText(false);
		setIsAddingVideo(false);
		setIsAddingImage(false);
		setIsAddingMusic(false);
		setIsModalOpen(false);
		setFormData(initialFormData);
		setSectionFormData(initialSectionFormData);
		setTextFormData(initialTextFormData);
		setVideoFormData(initialVideoFormData);
		setImageFormData(initialImageFormData);
		setMusicFormData(initialMusicFormData);
		setOriginalLink(null);
		setOriginalText(null);
		setOriginalVideo(null);
		setOriginalImage(null);
		setOriginalMusic(null);
		setUnifiedItems((prev) => prev.filter((item) => !(item as any).isDraft));
	}, []);

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

		// Converter músicas em UnifiedItems
		const musicItems: UnifiedItem[] = (currentMusics ?? []).map((music) => {
			const existingItem = unifiedItems.find(
				(item) => (item as any).isMusic && item.id === music.id
			);
			return {
				...(music as any),
				clicks: 0,
				sensitive: false,
				isMusic: true as any,
				isEditing: existingItem?.isEditing,
			} as any;
		});

		// Links gerais (sem seção)
		const generalLinks: UnifiedItem[] = currentLinks
			.filter((link) => !link.sectionId)
			.map((link) => ({ ...link }));

		// Combinar todos os itens (seções, links gerais, textos, vídeos, imagens e músicas) em uma única lista
		const allItems: UnifiedItem[] = [
			...sectionItems,
			...generalLinks,
			...textItems,
			...videoItems,
			...imageItems,
			...musicItems,
		];

		// Ordenar todos os itens juntos por order, com fallback estável
		const getOrder = (item: any) =>
			typeof item.order === "number" && Number.isFinite(item.order)
				? item.order
				: 0;
		const typeRank = (item: UnifiedItem) =>
			item.isSection
				? 0
				: item.isText
					? 1
					: item.isVideo
						? 2
						: (item as any).isImage
							? 3
							: (item as any).isMusic
								? 4
								: 5;
		allItems.sort(
			(a, b) =>
				getOrder(a) - getOrder(b) || typeRank(a) - typeRank(b) || a.id - b.id
		);

		// Preservar rascunhos (isDraft) durante revalidações para evitar perda de dados
		const draftItems = unifiedItems.filter((item) => (item as any).isDraft);
		const combinedItems = [...draftItems, ...allItems];
		combinedItems.sort(
			(a, b) =>
				getOrder(a) - getOrder(b) || typeRank(a) - typeRank(b) || a.id - b.id
		);
		setUnifiedItems(combinedItems);
	}, [
		currentLinks,
		currentSections,
		currentTexts,
		currentVideos,
		currentImages,
		currentMusics,
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
					.filter(
						(item) =>
							!(
								item.isSection ||
								item.isText ||
								item.isVideo ||
								(item as any).isImage ||
								(item as any).isMusic
							)
					)
					.filter((item) => !(item as any).isDraft)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
						type: "link",
						sectionId: (item as any).sectionId ?? null,
					}));

				const sectionItems = items
					.filter((item) => item.isSection)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
						type: "section",
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

				const musicItems = items
					.filter((item) => (item as any).isMusic)
					.filter((item) => !(item as any).isDraft)
					.map((item) => ({
						id: item.id,
						order: items.indexOf(item),
					}));

				// Fazer chamadas para as APIs específicas
				const promises: Promise<Response>[] = [];

				const linkAndSectionPayload = [...linkItems, ...sectionItems];
				if (linkAndSectionPayload.length > 0) {
					promises.push(
						fetch("/api/links/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: linkAndSectionPayload }),
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

				if (musicItems.length > 0) {
					promises.push(
						fetch("/api/musics/reorder", {
							method: "PUT",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ items: musicItems }),
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

		// Helper que reflete exatamente os IDs usados no LinkList
		const getSortableId = (item: UnifiedItem) => {
			if (item.isSection) {
				return `section-${item.id}`;
			}
			if (item.isText) {
				return `text-${item.id}`;
			}
			if (item.isVideo) {
				return `video-${item.id}`;
			}
			if ((item as any).isImage) {
				return `image-${item.id}`;
			}
			if ((item as any).isMusic) {
				return `music-${item.id}`;
			}
			return `link-${item.id}`;
		};

		setUnifiedItems((prevItems) => {
			// Encontrar os índices dos itens com base nos IDs corretos
			const activeIndex = prevItems.findIndex(
				(item) => getSortableId(item) === draggedItemId
			);

			const overIndex = prevItems.findIndex(
				(item) => getSortableId(item) === overId
			);

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
		// Remoção otimista do card de seção
		setUnifiedItems((prev) =>
			prev.filter((item) => !(item.isSection && item.id === id))
		);
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
			const cleaned = prev.map((item) =>
				item.isEditing ? { ...item, isEditing: false } : item
			);
			// Calcula o menor 'order' considerando também rascunhos existentes
			const lowest =
				cleaned.length > 0 ? Math.min(...cleaned.map((i) => i.order)) : 0;
			const draftAtTop = { ...draft, order: lowest - 1 } as UnifiedItem;
			const next = [
				draftAtTop,
				...cleaned.filter((item) => !(item as any).isDraft),
			];
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

		await Promise.all([
			mutateLinks(),
			mutateSections(),
			mutateTexts(),
			mutateVideos(),
			mutateImages(),
			mutateMusics(),
		]);
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
			const cleaned = prev.map((item) =>
				item.isEditing ? { ...item, isEditing: false } : item
			);
			const lowest =
				cleaned.length > 0 ? Math.min(...cleaned.map((i) => i.order)) : 0;
			const draftAtTop = { ...draft, order: lowest - 1 } as UnifiedItem;
			const next = [
				draftAtTop,
				...cleaned.filter((item) => !(item as any).isDraft),
			];
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
			const cleaned = prev.map((item) =>
				item.isEditing ? { ...item, isEditing: false } : item
			);
			const lowest =
				cleaned.length > 0 ? Math.min(...cleaned.map((i) => i.order)) : 0;
			const draftAtTop = { ...draft, order: lowest - 1 } as UnifiedItem;
			const next = [
				draftAtTop,
				...cleaned.filter((item) => !(item as any).isDraft),
			];
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
			const cleaned = prev.map((item) =>
				item.isEditing ? { ...item, isEditing: false } : item
			);
			const lowest =
				cleaned.length > 0 ? Math.min(...cleaned.map((i) => i.order)) : 0;
			const draftAtTop = { ...draft, order: lowest - 1 } as UnifiedItem;
			const next = [
				draftAtTop,
				...cleaned.filter((item) => !(item as any).isDraft),
			];
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
		// Remoção otimista do card de vídeo
		setUnifiedItems((prev) =>
			prev.filter((item) => !(item.isVideo && item.id === id))
		);
		await fetch(`/api/videos/${id}`, { method: "DELETE" });
		await mutateVideos();
	};

	const handleArchiveVideo = async (id: number) => {
		// Remoção otimista do card de vídeo
		setUnifiedItems((prev) =>
			prev.filter((item) => !(item.isVideo && item.id === id))
		);
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
			await Promise.all([
				mutateLinks(),
				mutateSections(),
				mutateTexts(),
				mutateVideos(),
				mutateImages(),
				mutateMusics(),
			]);
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
		// Remoção otimista do card de imagem
		setUnifiedItems((prev) =>
			prev.filter((item) => !((item as any).isImage && item.id === id))
		);
		await fetch(`/api/images/${id}`, { method: "DELETE" });
		await mutateImages();
		await mutateSections();
	};

	const handleArchiveImage = async (id: number) => {
		// Remoção otimista do card de imagem
		setUnifiedItems((prev) =>
			prev.filter((item) => !((item as any).isImage && item.id === id))
		);
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
				await Promise.all([
					mutateLinks(),
					mutateSections(),
					mutateTexts(),
					mutateVideos(),
					mutateImages(),
					mutateMusics(),
				]);
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

	const handleAddNewMusic = async () => {
		const id = Date.now();
		const order = -1;
		const draft: MusicItem = {
			id,
			title: "",
			url: "",
			usePreview: true,
			active: true,
			archived: false,
			order,
			sectionId: null,
			userId: 0,
			isDraft: true,
			isMusic: true,
			isEditing: true,
		};
		setUnifiedItems((prev) => {
			const cleaned = prev.map((item) =>
				item.isEditing ? { ...item, isEditing: false } : item
			);
			// Garante que o rascunho de música vá para o topo
			const lowest =
				cleaned.length > 0 ? Math.min(...cleaned.map((i) => i.order)) : 0;
			const draftAtTop = { ...draft, order: lowest - 1 } as UnifiedItem;
			const next = [
				draftAtTop,
				...cleaned.filter((item) => !(item as any).isDraft),
			];
			return next.sort((a, b) => a.order - b.order);
		});
		setOriginalMusic(null);
		setIsAddingMusic(false);
		setIsModalOpen(false);
	};

	const handleMusicUpdate = async (id: number, payload: Partial<MusicItem>) => {
		const response = await fetch(`/api/musics/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Erro ao atualizar música");
		}

		await mutateMusics();
	};

	const handleDeleteMusic = async (id: number) => {
		const target = unifiedItems.find(
			(item) => (item as any).isMusic && item.id === id
		) as MusicItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			return;
		}
		// Remoção otimista do card de música
		setUnifiedItems((prev) =>
			prev.filter((item) => !((item as any).isMusic && item.id === id))
		);
		await fetch(`/api/musics/${id}`, { method: "DELETE" });
		await mutateMusics();
		await mutateSections();
	};

	const handleArchiveMusic = async (id: number) => {
		// Remoção otimista do card de música
		setUnifiedItems((prev) =>
			prev.filter((item) => !((item as any).isMusic && item.id === id))
		);
		await handleMusicUpdate(id, { archived: true });
	};

	const handleStartEditingMusic = (id: number) => {
		const musicToEdit = unifiedItems.find(
			(item) => (item as any).isMusic && item.id === id
		) as MusicItem;
		if (musicToEdit) {
			setOriginalMusic(musicToEdit);
		}

		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if (item.isEditing && item.id !== id) {
					return { ...item, isEditing: false };
				}
				if ((item as any).isMusic && item.id === id) {
					return { ...item, isEditing: true };
				}
				return item;
			})
		);
	};

	const handleMusicChange = (
		id: number,
		field: "title" | "url" | "usePreview",
		value: string | boolean
	) => {
		setUnifiedItems((prevItems) =>
			prevItems.map((item) => {
				if ((item as any).isMusic && item.id === id) {
					return { ...item, [field]: value };
				}
				return item;
			})
		);
	};

	const handleSaveEditingMusic = async (
		id: number,
		title: string,
		url: string,
		usePreview: boolean
	) => {
		const target = unifiedItems.find(
			(item) => (item as any).isMusic && item.id === id
		) as MusicItem | undefined;
		if (target?.isDraft) {
			await fetch("/api/musics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title?.trim() || null,
					url,
					usePreview,
					sectionId: target.sectionId ?? null,
				}),
			});
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			await Promise.all([
				mutateLinks(),
				mutateSections(),
				mutateTexts(),
				mutateVideos(),
				mutateImages(),
				mutateMusics(),
			]);
			setOriginalMusic(null);
			return;
		}
		await handleMusicUpdate(id, {
			title,
			url,
			usePreview,
			isEditing: false,
		});
	};

	const handleCancelEditingMusic = (id: number) => {
		const target = unifiedItems.find(
			(item) => (item as any).isMusic && item.id === id
		) as MusicItem | undefined;
		if (target?.isDraft) {
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			setOriginalMusic(null);
			return;
		}
		const musicToRestore = currentMusics.find((m) => m.id === id);
		if (musicToRestore) {
			setUnifiedItems((prevItems) =>
				prevItems.map((item) => {
					if ((item as any).isMusic && item.id === id) {
						return {
							...musicToRestore,
							isMusic: true,
							isEditing: false,
						};
					}
					return item;
				})
			);
		}
		setOriginalMusic(null);
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

		await Promise.all([
			mutateLinks(),
			mutateSections(),
			mutateTexts(),
			mutateVideos(),
			mutateImages(),
			mutateMusics(),
		]);
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
		const target = unifiedItems.find((item) => item.id === id);

		// Vídeo
		if (target?.isVideo) {
			// Atualização otimista no estado local
			setUnifiedItems((prev) =>
				prev.map((item) =>
					item.id === id && (item as any).isVideo
						? ({ ...(item as any), active } as any)
						: item
				)
			);

			// Atualização otimista no preview (designStore)
			const store = useDesignStore.getState();
			const user = store.userData;
			if (user) {
				const nextVideos = (user.videos || []).map((v: any) => {
					const vidId = typeof v.id === "number" ? v.id : Number(v.id);
					return vidId === id ? { ...v, active } : v;
				});
				store.setUserData({ ...user, videos: nextVideos } as any);
			}

			setTogglingVideoId(id);
			try {
				await handleVideoUpdate(id, { active });
			} finally {
				setTogglingVideoId(null);
			}
			return;
		}

		// Texto
		if (target?.isText) {
			setTogglingTextId(id);
			try {
				await handleTextUpdate(id, { active });
			} finally {
				setTogglingTextId(null);
			}
			return;
		}

		// Imagem
		if ((target as any)?.isImage) {
			setTogglingImageId(id);
			try {
				await handleImageUpdate(id, { active });
			} finally {
				setTogglingImageId(null);
			}
			return;
		}

		// Música
		if ((target as any)?.isMusic) {
			setTogglingMusicId(id);
			try {
				await handleMusicUpdate(id, { active });
			} finally {
				setTogglingMusicId(null);
			}
			return;
		}

		// Link (default)
		setTogglingLinkId(id);
		try {
			await handleLinkUpdate(id, { active });
		} finally {
			setTogglingLinkId(null);
		}
	};

	const handleArchiveLink = async (id: number) => {
		setArchivingLinkId(id);
		// Remoção otimista do card de link (top-level e dentro de seção)
		setUnifiedItems((prev) =>
			prev.reduce<UnifiedItem[]>((acc, item) => {
				if ((item as any).isSection && Array.isArray((item as any).children)) {
					const nextChildren = ((item as any).children as any[]).filter(
						(child) => child.id !== id
					);
					acc.push({ ...(item as any), children: nextChildren } as any);
					return acc;
				}
				if (
					!(
						(item as any).isSection ||
						(item as any).isText ||
						(item as any).isVideo
					) &&
					item.id === id
				) {
					return acc; // remove top-level link
				}
				acc.push(item);
				return acc;
			}, [])
		);
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
			const raw = payload.badge ?? null;
			if (raw === null) {
				sanitized.badge = null;
			} else {
				const v = String(raw).slice(0, 12).trim();
				sanitized.badge = v.length ? v : null;
			}
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
			// Se a nova data de expiração é futura, reativa o link localmente
			if (sanitized.expiresAt && new Date(sanitized.expiresAt) > new Date()) {
				sanitized.active = true;
			}
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
		// Remoção otimista do card de link (top-level e dentro de seção)
		setUnifiedItems((prev) =>
			prev.reduce<UnifiedItem[]>((acc, item) => {
				if ((item as any).isSection && Array.isArray((item as any).children)) {
					const nextChildren = ((item as any).children as any[]).filter(
						(child) => child.id !== id
					);
					acc.push({ ...(item as any), children: nextChildren } as any);
					return acc;
				}
				if (
					!(
						(item as any).isSection ||
						(item as any).isText ||
						(item as any).isVideo
					) &&
					item.id === id
				) {
					return acc; // remove top-level link
				}
				acc.push(item);
				return acc;
			}, [])
		);
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
			await Promise.all([
				mutateLinks(),
				mutateSections(),
				mutateTexts(),
				mutateVideos(),
				mutateImages(),
				mutateMusics(),
			]);

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
		const updatePayload: Partial<LinkItem> = {
			title,
			url: formattedUrl,
			badge: target?.badge ?? null,
			password: target?.password ?? null,
			deleteOnClicks: target?.deleteOnClicks ?? null,
			launchesAt: target?.launchesAt ?? null,
			expiresAt: target?.expiresAt ?? null,
			shareAllowed: target?.shareAllowed ?? false,
			isEditing: false,
		};
		// Se a expiração está definida para o futuro, reativa no backend
		if (target?.expiresAt && new Date(target.expiresAt) > new Date()) {
			updatePayload.active = true;
		}

		await handleLinkUpdate(id, updatePayload);
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
		// Remoção otimista do card de texto
		setUnifiedItems((prev) =>
			prev.filter((item) => !(item.isText && item.id === id))
		);
		await fetch(`/api/texts/${id}`, { method: "DELETE" });
		await mutateTexts();
	};

	const handleArchiveText = async (id: number) => {
		// Remoção otimista do card de texto
		setUnifiedItems((prev) =>
			prev.filter((item) => !(item.isText && item.id === id))
		);
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
			// Validação mínima no cliente para evitar 400
			const trimmedTitle = (title || "").trim();
			const trimmedDescription = (description || "").trim();
			if (
				!(trimmedTitle && trimmedDescription) ||
				trimmedDescription.length > 1500
			) {
				// Mantém em edição para o usuário corrigir os dados
				setUnifiedItems((prev) =>
					prev.map((item) =>
						item.id === id && item.isText ? { ...item, isEditing: true } : item
					)
				);
				return;
			}

			const response = await fetch("/api/texts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: trimmedTitle,
					description: trimmedDescription,
					position,
					hasBackground,
					isCompact,
					sectionId: target.sectionId ?? null,
				}),
			});
			if (!response.ok) {
				// Em caso de erro, NÃO remove o rascunho
				setUnifiedItems((prev) =>
					prev.map((item) =>
						item.id === id && item.isText ? { ...item, isEditing: true } : item
					)
				);
				return;
			}
			setUnifiedItems((prev) => prev.filter((item) => item.id !== id));
			// Após criar texto, o backend incrementa 'order' de TODOS os tipos.
			// Para manter a ordenação consistente no cliente, atualize todas as listas.
			await Promise.all([
				mutateLinks(),
				mutateSections(),
				mutateTexts(),
				mutateVideos(),
				mutateImages(),
				mutateMusics(),
			]);
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
		isAddingMusic,
		isModalOpen,
		formData,
		sectionFormData,
		textFormData,
		videoFormData,
		imageFormData,
		musicFormData,
		existingSections,
		archivingLinkId,
		setActiveId,
		setIsAdding,
		setIsAddingSection,
		setIsAddingText,
		setIsAddingVideo,
		setIsAddingImage,
		setIsAddingMusic,
		setIsModalOpen,
		setFormData,
		setSectionFormData,
		setTextFormData,
		setVideoFormData,
		setImageFormData,
		setMusicFormData,
		closeAllActiveCreations,
		handleDragEnd,
		handleSectionUpdate,
		handleSectionDelete,
		handleSectionUngroup,
		handleAddNewLink,
		handleAddNewSection,
		handleAddNewText,
		handleAddNewVideo,
		handleAddNewImage,
		handleAddNewMusic,
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
		handleMusicUpdate,
		handleDeleteMusic,
		handleArchiveMusic,
		handleStartEditingMusic,
		handleMusicChange,
		handleSaveEditingMusic,
		handleCancelEditingMusic,
		togglingLinkId,
		togglingTextId,
		togglingVideoId,
		togglingImageId,
		togglingMusicId,
		togglingSectionId,
		originalLink: _originalLink,
		originalText: _originalText,
		originalVideo: _originalVideo,
		originalImage: _originalImage,
		originalMusic: _originalMusic,
	};
};

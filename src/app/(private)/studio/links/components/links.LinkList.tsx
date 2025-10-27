// src/app/(private)/studio/links/components/links.LinkList.tsx
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UnifiedItem } from "../hooks/useLinksManager";
import type {
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../types/links.types";
import DragPreview from "./links.DragPreview";
import ImageCard from "./links.ImageCard";
import LinkCard from "./links.LinkCard";
import MusicCard from "./links.MusicCard";
import SectionCard from "./links.SectionCard";
import SortableItem from "./links.SortableItem";
import TextCard from "./links.TextCard";
import VideoCard from "./links.VideoCard";

interface LinkListProps {
	items: UnifiedItem[];
	activeId: string | null;
	archivingLinkId?: number | null;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	onSectionUpdate: (id: number, payload: Partial<SectionItem>) => void;
	onSectionDelete: (id: number) => void;
	onSectionUngroup: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onToggleActive: (id: number, isActive: boolean) => Promise<void>;

	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	// Novo handler para campos avançados do link
	onLinkAdvancedChange?: (id: number, payload: Partial<LinkItem>) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
	// Novas props para criação de link na seção
	onAddLinkToSection?: (sectionId: number) => void;
	linksManager?: any;
	onUpdateCustomImage?: (id: number, imageUrl: string) => void;
	onRemoveCustomImage?: (id: number) => void;
	// Props para textos
	onDeleteText?: (id: number) => void;
	onArchiveText?: (id: number) => void;
	onStartEditingText?: (id: number) => void;
	onTextChange?: (
		id: number,
		field: "title" | "description" | "position" | "hasBackground" | "isCompact",
		value: string | boolean
	) => void;
	onSaveEditingText?: (
		id: number,
		title: string,
		description: string,
		position: "left" | "center" | "right",
		hasBackground: boolean,
		isCompact: boolean
	) => void;
	onCancelEditingText?: (id: number) => void;
	// Props para vídeos
	onDeleteVideo?: (id: number) => void;
	onArchiveVideo?: (id: number) => void;
	onStartEditingVideo?: (id: number) => void;
	onVideoChange?: (
		id: number,
		field: "title" | "description" | "url",
		value: string
	) => void;
	onSaveEditingVideo?: (
		id: number,
		title: string,
		description: string,
		url: string
	) => void;
	onCancelEditingVideo?: (id: number) => void;
	togglingVideoId?: number | null;
	// Props para imagens
	onDeleteImage?: (id: number) => void;
	onArchiveImage?: (id: number) => void;
	onStartEditingImage?: (id: number) => void;
	onImageChange?: (
		id: number,
		field: "title" | "description",
		value: string
	) => void;
	onSaveEditingImage?: (id: number, payload: Partial<ImageItem>) => void;
	onCancelEditingImage?: (id: number) => void;
	togglingImageId?: number | null;
	togglingLinkId?: number | null;
	togglingTextId?: number | null;
	togglingSectionId?: number | null;
	originalLink?: LinkItem | null;
	originalText?: TextItem | null;
	originalVideo?: VideoItem | null;
	originalImage?: ImageItem | null;
	// Props para músicas
	onDeleteMusic?: (id: number) => void;
	onArchiveMusic?: (id: number) => void;
	onStartEditingMusic?: (id: number) => void;
	onMusicChange?: (
		id: number,
		field: "title" | "url" | "usePreview",
		value: string | boolean
	) => void;
	onSaveEditingMusic?: (
		id: number,
		title: string,
		url: string,
		usePreview: boolean
	) => void;
	onCancelEditingMusic?: (id: number) => void;
	togglingMusicId?: number | null;
	originalMusic?: MusicItem | null;
	existingSections?: SectionItem[];
}

const LinkList = (props: LinkListProps) => {
	const {
		items,
		onDragStart,
		onDragEnd,
		activeId,
		archivingLinkId,
		onAddLinkToSection,
		linksManager,
		onRemoveCustomImage,
		onUpdateCustomImage,
		onDeleteText,
		onArchiveText,
		onStartEditingText,
		onTextChange,
		onSaveEditingText,
		onCancelEditingText,
		onDeleteVideo,
		onArchiveVideo,
		onStartEditingVideo,
		onVideoChange,
		onSaveEditingVideo,
		onCancelEditingVideo,
		togglingVideoId,
		togglingImageId,
		togglingLinkId,
		togglingTextId,
		togglingSectionId,
		originalLink,
		originalText,
		originalVideo,
		originalImage,
		existingSections,
		// Handlers e estados de Música (antes ausentes)
		onArchiveMusic,
		onCancelEditingMusic,
		onDeleteMusic,
		onMusicChange,
		onSaveEditingMusic,
		onStartEditingMusic,
		originalMusic,
		togglingMusicId,
		...cardProps
	} = props;

	const sensors = useSensors(
		useSensor(MouseSensor),
		// Melhora UX no mobile: exige breve hold ou movimento antes de arrastar
		useSensor(TouchSensor, {
			activationConstraint: { delay: 150, tolerance: 5 },
		}),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	// Resolve o item ativo para o DragOverlay, cobrindo itens dentro de seções
	const activePreviewItem = (() => {
		if (!activeId) {
			return null;
		}
		const [type, idStr] = activeId.split("-");
		const idNum = Number(idStr);

		if (type === "section") {
			const sectionUnified = items.find((i) => i.isSection && i.id === idNum);
			if (!sectionUnified) {
				return null;
			}
			const sectionData: SectionItem = {
				id: sectionUnified.id.toString(),
				dbId: sectionUnified.dbId || 0,
				title: sectionUnified.title || "",
				active: sectionUnified.active,
				order: sectionUnified.order || 0,
				links: sectionUnified.children || [],
			};
			return sectionData;
		}

		if (type === "text") {
			return (
				(items.find((i) => i.isText && i.id === idNum) as TextItem) || null
			);
		}

		if (type === "video") {
			return (
				(items.find((i) => i.isVideo && i.id === idNum) as VideoItem) || null
			);
		}

		if (type === "image") {
			return (
				(items.find(
					(i) => (i as any).isImage && i.id === idNum
				) as ImageItem) || null
			);
		}

		if (type === "music") {
			return (
				(items.find(
					(i) => (i as any).isMusic && i.id === idNum
				) as MusicItem) || null
			);
		}

		if (type === "link") {
			const topLevelLink = items.find(
				(i) => !(i.isSection || i.isText || i.isVideo) && i.id === idNum
			) as LinkItem | undefined;
			if (topLevelLink) {
				return topLevelLink;
			}

			const sectionWithLink = items.find(
				(i) =>
					i.isSection &&
					Array.isArray(i.children) &&
					i.children.some((l) => l.id === idNum)
			);
			if (sectionWithLink?.children) {
				const child =
					sectionWithLink.children.find((l) => l.id === idNum) || null;
				return child;
			}
		}

		return null;
	})();

	return (
		<div className="space-y-6 pt-6">
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
				onDragStart={onDragStart}
				sensors={sensors}
			>
				<SortableContext
					items={items.map((item) => {
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
					})}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{items.map((item) => {
							let key = "";
							let sortableId = "";

							if (item.isSection) {
								key = `section-${item.id}`;
								sortableId = `section-${item.id}`;
							} else if (item.isText) {
								key = `text-${item.id}`;
								sortableId = `text-${item.id}`;
							} else if (item.isVideo) {
								key = `video-${item.id}`;
								sortableId = `video-${item.id}`;
							} else if ((item as any).isImage) {
								key = `image-${item.id}`;
								sortableId = `image-${item.id}`;
							} else if ((item as any).isMusic) {
								key = `music-${item.id}`;
								sortableId = `music-${item.id}`;
							} else {
								key = `link-${item.id}`;
								sortableId = `link-${item.id}`;
							}

							return (
								<SortableItem id={sortableId} key={key}>
									{({ listeners, setActivatorNodeRef, isDragging }) => {
										if (item.isSection) {
											// Converter UnifiedItem para SectionItem para compatibilidade
											const sectionData: SectionItem = {
												id: item.id.toString(),
												dbId: item.dbId || 0,
												title: item.title || "",
												active: item.active,
												order: item.order || 0,
												links: item.children || [],
											};
											return (
												<SectionCard
													isDragging={isDragging}
													isTogglingActive={togglingSectionId === item.id}
													linksManager={linksManager}
													listeners={listeners}
													onAddLinkToSection={onAddLinkToSection}
													onRemoveCustomImage={onRemoveCustomImage}
													onUpdateCustomImage={onUpdateCustomImage}
													section={sectionData}
													setActivatorNodeRef={setActivatorNodeRef}
													{...cardProps}
												/>
											);
										}

										if (item.isText) {
											return (
												<TextCard
													isDragging={isDragging}
													isTogglingActive={togglingTextId === item.id}
													listeners={listeners}
													onArchiveText={onArchiveText}
													onCancelEditingText={onCancelEditingText}
													onDeleteText={onDeleteText}
													onSaveEditingText={onSaveEditingText}
													onStartEditingText={onStartEditingText}
													onTextChange={onTextChange}
													onToggleActive={cardProps.onToggleActive}
													originalText={originalText}
													setActivatorNodeRef={setActivatorNodeRef}
													text={item as TextItem}
												/>
											);
										}

										if (item.isVideo) {
											return (
												<VideoCard
													isDragging={isDragging}
													isTogglingActive={togglingVideoId === item.id}
													listeners={listeners}
													onArchiveVideo={onArchiveVideo}
													onCancelEditingVideo={onCancelEditingVideo}
													onDeleteVideo={onDeleteVideo}
													onSaveEditingVideo={onSaveEditingVideo}
													onStartEditingVideo={onStartEditingVideo}
													onToggleActive={cardProps.onToggleActive}
													onVideoChange={onVideoChange}
													originalVideo={originalVideo}
													setActivatorNodeRef={setActivatorNodeRef}
													video={item as VideoItem}
												/>
											);
										}

										if ((item as any).isImage) {
											return (
												<ImageCard
													existingSections={existingSections}
													image={item as ImageItem}
													isDragging={isDragging}
													isTogglingActive={togglingImageId === item.id}
													listeners={listeners}
													onArchiveImage={cardProps.onArchiveImage}
													onCancelEditingImage={cardProps.onCancelEditingImage}
													onDeleteImage={cardProps.onDeleteImage}
													onImageChange={cardProps.onImageChange}
													onSaveEditingImage={cardProps.onSaveEditingImage}
													onStartEditingImage={cardProps.onStartEditingImage}
													onToggleActive={cardProps.onToggleActive}
													originalImage={originalImage}
													setActivatorNodeRef={setActivatorNodeRef}
												/>
											);
										}

										if ((item as any).isMusic) {
											return (
												<MusicCard
													isDragging={isDragging}
													isTogglingActive={togglingMusicId === item.id}
													listeners={listeners}
													music={item as MusicItem}
													onArchiveMusic={onArchiveMusic}
													onCancelEditingMusic={onCancelEditingMusic}
													onDeleteMusic={onDeleteMusic}
													onMusicChange={onMusicChange}
													onSaveEditingMusic={onSaveEditingMusic}
													onStartEditingMusic={onStartEditingMusic}
													onToggleActive={cardProps.onToggleActive}
													originalMusic={originalMusic}
													setActivatorNodeRef={setActivatorNodeRef}
												/>
											);
										}

										return (
											<LinkCard
												archivingLinkId={archivingLinkId}
												isTogglingActive={togglingLinkId === item.id}
												link={item as LinkItem}
												listeners={listeners}
												onRemoveCustomImage={onRemoveCustomImage}
												onUpdateCustomImage={onUpdateCustomImage}
												originalLink={originalLink}
												setActivatorNodeRef={setActivatorNodeRef}
												{...cardProps}
											/>
										);
									}}
								</SortableItem>
							);
						})}
					</div>
				</SortableContext>

				{/* DragOverlay com preview simplificado */}
				<DragOverlay>
					{activePreviewItem && <DragPreview item={activePreviewItem} />}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default LinkList;

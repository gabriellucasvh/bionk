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
	LinkItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../types/links.types";
import DragPreview from "./links.DragPreview";
import LinkCard from "./links.LinkCard";
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
	togglingLinkId?: number | null;
	togglingTextId?: number | null;
	togglingSectionId?: number | null;
	originalLink?: LinkItem | null;
	originalText?: TextItem | null;
	originalVideo?: VideoItem | null;
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
		togglingLinkId,
		togglingTextId,
		togglingSectionId,
		originalLink,
		originalText,
		originalVideo,
		...cardProps
	} = props;

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const activeItem = activeId
		? items.find((item) => {
				if (item.isSection) {
					return item.id.toString() === activeId;
				}
				return `item-${item.id}` === activeId;
			})
		: null;

	return (
		<div className="space-y-6 border-t pt-6">
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
					{activeItem && <DragPreview item={activeItem} />}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default LinkList;

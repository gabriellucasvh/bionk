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
import type { LinkItem, SectionItem, TextItem } from "../types/links.types";
import LinkCard from "./links.LinkCard";
import SectionCard from "./links.SectionCard";
import SortableItem from "./links.SortableItem";
import TextCard from "./links.TextCard";

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
	onToggleActive: (id: number, isActive: boolean) => void;

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
		field: "title" | "description" | "position" | "hasBackground",
		value: string | boolean
	) => void;
	onSaveEditingText?: (
		id: number,
		title: string,
		description: string,
		position: "left" | "center" | "right",
		hasBackground: boolean
	) => void;
	onCancelEditingText?: (id: number) => void;
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
		...cardProps
	} = props;

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const activeItem = activeId
		? items.find((item) => item.id.toString() === activeId)
		: null;

	// Função No-op para satisfazer o linter e o TypeScript
	const noop = () => {
		/* A função do overlay não precisa de um ativador */
	};

	return (
		<div className="space-y-6 border-t pt-6">
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={onDragEnd}
				onDragStart={onDragStart}
				sensors={sensors}
			>
				<SortableContext
					items={items.map((item) =>
						item.isSection ? item.id.toString() : `item-${item.id}`
					)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{items.map((item) => {
							let key = "";
							if (item.isSection) {
								key = `section-${item.id}`;
							} else if (item.isText) {
								key = `text-${item.id}`;
							} else {
								key = `link-${item.id}`;
							}

							const sortableId = item.isSection
								? item.id.toString()
								: `item-${item.id}`;

							return (
								<SortableItem id={sortableId} key={key}>
									{({ listeners, setActivatorNodeRef, isDragging }) => {
										if (item.isSection) {
											// Converter UnifiedItem para SectionItem para compatibilidade
											const sectionData: SectionItem = {
												id: item.id.toString(),
												dbId: item.dbId || 0,
												title: item.title,
												active: item.active,
												order: item.order || 0,
												links: item.children || [],
											};
											return (
												<SectionCard
													isDragging={isDragging}
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
													listeners={listeners}
													onArchiveText={onArchiveText}
													onCancelEditingText={onCancelEditingText}
													onDeleteText={onDeleteText}
													onSaveEditingText={onSaveEditingText}
													onStartEditingText={onStartEditingText}
													onTextChange={onTextChange}
													onToggleActive={cardProps.onToggleActive}
													setActivatorNodeRef={setActivatorNodeRef}
													text={item as TextItem}
												/>
											);
										}

										return (
											<LinkCard
												archivingLinkId={archivingLinkId}
												link={item as LinkItem}
												listeners={listeners}
												onRemoveCustomImage={onRemoveCustomImage}
												onUpdateCustomImage={onUpdateCustomImage}
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

				{/* Adicionado DragOverlay para corrigir a distorção */}
				<DragOverlay>
					{activeItem &&
						(() => {
							if (activeItem.isSection) {
								const sectionData: SectionItem = {
									id: activeItem.id.toString(),
									dbId: activeItem.dbId || 0,
									title: activeItem.title,
									active: activeItem.active,
									order: activeItem.order || 0,
									links: activeItem.children || [],
								};
								return (
									<SectionCard
										isDragging
										linksManager={linksManager}
										onAddLinkToSection={onAddLinkToSection}
										section={sectionData}
										{...cardProps}
										listeners={{}}
										setActivatorNodeRef={noop}
									/>
								);
							}

							if (activeItem.isText) {
								return (
									<TextCard
										isDragging
										text={activeItem as TextItem}
										{...cardProps}
										listeners={{}}
										setActivatorNodeRef={noop}
									/>
								);
							}

							return (
								<LinkCard
									archivingLinkId={archivingLinkId}
									link={activeItem as LinkItem}
									{...cardProps}
									listeners={{}}
									setActivatorNodeRef={noop}
								/>
							);
						})()}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default LinkList;

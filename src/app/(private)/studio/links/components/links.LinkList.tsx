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
import type { SectionItem } from "../types/links.types";
import LinkCard from "./links.LinkCard";
import SectionCard from "./links.SectionCard";
import SortableItem from "./links.SortableItem";

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
						item.isSection ? item.id.toString() : `link-${item.id}`
					)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{items.map((item) => (
							<SortableItem
								id={item.isSection ? item.id.toString() : `link-${item.id}`}
								key={item.id}
							>
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
									return (
									<LinkCard
										archivingLinkId={archivingLinkId}
										link={item}
										listeners={listeners}
										onRemoveCustomImage={onRemoveCustomImage}
										onUpdateCustomImage={onUpdateCustomImage}
										setActivatorNodeRef={setActivatorNodeRef}
										{...cardProps}
									/>
								);
								}}
							</SortableItem>
						))}
					</div>
				</SortableContext>

				{/* Adicionado DragOverlay para corrigir a distorção */}
				<DragOverlay>
					{activeItem ? (
						activeItem.isSection ? (
							<SectionCard
							isDragging
							linksManager={linksManager}
							onAddLinkToSection={onAddLinkToSection}
							section={{
								id: activeItem.id.toString(),
								dbId: activeItem.dbId || 0,
								title: activeItem.title,
								active: activeItem.active,
								order: activeItem.order || 0,
								links: activeItem.children || [],
							}}
							{...cardProps}
							listeners={{}}
							setActivatorNodeRef={noop}
						/>
						) : (
							<LinkCard
							archivingLinkId={archivingLinkId}
							link={activeItem}
							{...cardProps}
							listeners={{}}
							setActivatorNodeRef={noop}
						/>
						)
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
};

export default LinkList;

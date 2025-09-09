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
import type { LinkItem, SectionItem } from "../types/links.types";
import LinkCard from "./links.LinkCard";
import SectionCard from "./links.SectionCard";
import SortableItem from "./links.SortableItem";

interface LinkListProps {
	items: UnifiedItem[];
	activeId: string | null;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	onSectionUpdate: (id: number, payload: Partial<SectionItem>) => void;
	onSectionDelete: (id: number) => void;
	onSectionUngroup: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onToggleActive: (id: number, isActive: boolean) => void;
	onToggleSensitive: (id: number) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
	// Novas props para criação de link na seção
	onAddLinkToSection?: (sectionTitle: string) => void;
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
		? items.find((item) => item.id === activeId)
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
					items={items.map((item) => item.id)}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{items.map((item) => (
							<SortableItem id={item.id} key={item.id}>
								{({ listeners, setActivatorNodeRef, isDragging }) => {
									if (item.type === "section") {
										return (
											<SectionCard
												isDragging={isDragging}
												linksManager={linksManager}
												listeners={listeners}
												onAddLinkToSection={onAddLinkToSection}
												onRemoveCustomImage={onRemoveCustomImage}
												onUpdateCustomImage={onUpdateCustomImage}
												section={item.data as SectionItem}
												setActivatorNodeRef={setActivatorNodeRef}
												{...cardProps}
											/>
										);
									}
									return (
										<LinkCard
											link={item.data as LinkItem}
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
						activeItem.type === "section" ? (
							<SectionCard
								isDragging
								linksManager={linksManager}
								onAddLinkToSection={onAddLinkToSection}
								section={activeItem.data as SectionItem}
								{...cardProps}
								listeners={{}}
								setActivatorNodeRef={noop}
							/>
						) : (
							<LinkCard
								link={activeItem.data as LinkItem}
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

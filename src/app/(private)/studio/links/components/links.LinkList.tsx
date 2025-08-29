// links/components/links.LinkList.tsx
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
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
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	// Props para os cards
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
}

const LinkList = (props: LinkListProps) => {
	const { items, onDragStart, onDragEnd, ...cardProps } = props;

	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

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
												listeners={listeners}
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
											setActivatorNodeRef={setActivatorNodeRef}
											{...cardProps}
										/>
									);
								}}
							</SortableItem>
						))}
					</div>
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default LinkList;

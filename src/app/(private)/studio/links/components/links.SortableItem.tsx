// links/components/links.SortableItem.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";

interface SortableItemProps {
	// Corrigido para aceitar string ou número
	id: string | number;
	children: (props: {
		setActivatorNodeRef: (element: HTMLElement | null) => void;
		listeners: ReturnType<typeof useSortable>["listeners"];
		isDragging: boolean;
	}) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		// Alterado para 0 para ocultar o item original durante o arraste
		opacity: isDragging ? 0 : 1,
		zIndex: isDragging ? 10 : "auto",
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			{children({ listeners, setActivatorNodeRef, isDragging })}
		</div>
	);
};

export default SortableItem;

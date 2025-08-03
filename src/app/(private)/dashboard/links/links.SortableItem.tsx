import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";

interface SortableItemProps {
	id: number;
	children: (props: {
		listeners: ReturnType<typeof useSortable>["listeners"];
		attributes: React.HTMLAttributes<HTMLDivElement>;
	}) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		touchAction: "none",
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			{children({ listeners, attributes })}
		</div>
	);
};

export default SortableItem;

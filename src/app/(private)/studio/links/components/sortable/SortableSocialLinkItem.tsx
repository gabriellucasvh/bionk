import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react/dist/ssr";
import type React from "react";

interface SortableSocialLinkItemProps {
	id: string;
	children: React.ReactNode;
}

export function SortableSocialLinkItem({
	id,
	children,
}: SortableSocialLinkItemProps) {
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
		zIndex: isDragging ? 1 : "auto",
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<div className="flex items-center gap-2">
				<button {...listeners} className="cursor-grab" type="button">
					<DotsSixVertical weight="duotone" className="h-5 w-5 text-muted-foreground" />
				</button>
				<div className="flex-grow">{children}</div>
			</div>
		</div>
	);
}

"use client";

import {
	FolderOpen,
	Grip,
	Image as ImageIcon,
	Link as LinkIcon,
	Type,
	Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
	ImageItem,
	LinkItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../types/links.types";

interface DragPreviewProps {
	item: LinkItem | SectionItem | TextItem | VideoItem | ImageItem;
	className?: string;
}

const DragPreview = ({ item, className }: DragPreviewProps) => {
	const getItemInfo = () => {
		if ("links" in item && Array.isArray(item.links)) {
			return {
				icon: FolderOpen,
				label: "Seção",
				color: "text-blue-600",
				title: item.title || "Seção sem título",
			};
		}
		if ("isText" in item && item.isText) {
			return {
				icon: Type,
				label: "Texto",
				color: "text-green-600",
				title: item.title || "Texto sem título",
			};
		}
		if ("isVideo" in item && item.isVideo) {
			return {
				icon: Video,
				label: "Vídeo",
				color: "text-red-600",
				title: item.title || "Vídeo sem título",
			};
		}
		if ("isImage" in item && item.isImage) {
			return {
				icon: ImageIcon,
				label: "Imagem",
				color: "text-indigo-600",
				title: item.title || "Imagem sem título",
			};
		}
		return {
			icon: LinkIcon,
			label: "Link",
			color: "text-purple-600",
			title: item.title || "Link sem título",
		};
	};

	const { icon: Icon, label, color, title } = getItemInfo();

	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border bg-white p-3 shadow-lg dark:bg-neutral-800",
				"min-w-[200px] max-w-4xl",
				className
			)}
		>
			<Grip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
			<Icon className={cn("h-4 w-4 flex-shrink-0", color)} />
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="font-medium text-muted-foreground text-xs">
					{label}
				</span>
				<span className="truncate font-medium text-sm">{title}</span>
			</div>
		</div>
	);
};

export default DragPreview;

"use client";

import { FolderOpen, DotsSix, Image as ImageIcon, Link as LinkIcon, MusicNotes, Ticket, TextT, VideoCamera, ClockAfternoon, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type {
    EventItem,
    ImageItem,
    LinkItem,
    MusicItem,
    SectionItem,
    TextItem,
    VideoItem,
} from "../../types/links.types";

interface DragPreviewProps {
	item:
		| LinkItem
		| SectionItem
		| TextItem
		| VideoItem
		| ImageItem
		| MusicItem
		| EventItem;
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
				icon: TextT,
				label: "Texto",
				color: "text-green-600",
				title: item.title || "Texto sem título",
			};
		}
		if ("isVideo" in item && item.isVideo) {
			return {
				icon: VideoCamera,
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
		if ("isMusic" in item && item.isMusic) {
			return {
				icon: MusicNotes,
				label: "Música",
				color: "text-green-600",
				title: item.title || "Música sem título",
			};
		}
    if ("isEvent" in item && (item as any).isEvent) {
            const ev = item as any;
            const isCountdown =
                ev.type === "countdown" ||
                Boolean(ev.targetDay && ev.targetMonth) ||
                (!(ev.externalLink || ev.location) && ev.eventTime === "00:00");
            if (isCountdown) {
                return {
                    icon: ClockAfternoon,
                    label: "Contagem",
                    color: "text-blue-600",
                    title: ev.title || "Contagem",
                };
            }
            return {
                icon: Ticket,
                label: "Ingresso",
                color: "text-purple-600",
                title: ev.title || "Evento",
            };
    }
		if ("isContactForm" in item && (item as any).isContactForm) {
			return {
				icon: EnvelopeSimple,
				label: "Formulário de Contato",
				color: "text-purple-600",
				title: item.title || "Formulário de Contato",
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
				"flex items-center gap-3 rounded-full border bg-white p-3 shadow-lg dark:bg-zinc-800",
				"min-w-[200px] max-w-4xl",
				className
			)}
		>
			<DotsSix weight="regular" className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
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

"use client";

import { format } from "date-fns";
import { ClockFading, Edit, Grip, MoreVertical, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { EventItem } from "../../types/links.types";
import AddNewCountdownForm from "../forms/AddNewCountdownForm";

interface EventCardProps {
	event: EventItem;
	isDragging: boolean;
	listeners: any;
	setActivatorNodeRef: (el: HTMLElement | null) => void;
	onToggleActive?: (id: number, active: boolean) => void;
	onDeleteEvent?: (id: number) => void;
	isTogglingActive?: boolean;
	onStartEditingEvent?: (id: number) => void;
	onSaveEditingEvent?: (id: number, payload: Partial<EventItem>) => void;
	onCancelEditingEvent?: (id: number) => void;
	originalEvent?: EventItem | null;
}

const EventCard = ({
	event,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onDeleteEvent,
	isTogglingActive,
	onStartEditingEvent,
	onSaveEditingEvent,
	onCancelEditingEvent,
}: EventCardProps) => {
	const isCountdown =
		event.type === "countdown" ||
		(!(event.externalLink || event.location) && event.eventTime === "00:00");
	const dateLabel = (() => {
		if (isCountdown && event.targetDay && event.targetMonth) {
			const dd = String(event.targetDay).padStart(2, "0");
			const mm = String(event.targetMonth).padStart(2, "0");
			return `${dd}/${mm}`;
		}
		try {
			const d = new Date(event.eventDate);
			return format(d, "dd/MM/yyyy");
		} catch {
			return event.eventDate;
		}
	})();

	const handleDelete = () => {
		onDeleteEvent?.(event.id);
	};

	if (event.isEditing && isCountdown) {
		const handleSaveManaged = async (payload: {
			title: string;
			eventDate: string;
			eventTime: string;
			countdownLinkUrl?: string | null;
			countdownLinkVisibility?: "after" | "during" | null;
		}) => {
			const d = new Date(payload.eventDate);
			const month = d.getMonth() + 1;
			const day = d.getDate();
			onSaveEditingEvent?.(event.id, {
				title: payload.title,
				type: "countdown",
				eventDate: payload.eventDate as any,
				eventTime: payload.eventTime,
				targetMonth: month as any,
				targetDay: day as any,
				countdownLinkUrl: payload.countdownLinkUrl ?? null,
				countdownLinkVisibility: payload.countdownLinkVisibility ?? null,
			});
		};
		return (
			<article
				className={cn(
					"relative flex flex-col gap-3 rounded-3xl border bg-white p-3 transition-all sm:p-4 dark:bg-zinc-900",
					isDragging && "opacity-50"
				)}
			>
				<AddNewCountdownForm
					event={event as any}
					onClose={() => onCancelEditingEvent?.(event.id)}
					onSaved={() => {}}
					onSaveManaged={handleSaveManaged}
				/>
			</article>
		);
	}

	return (
		<article
			className={cn(
				"relative flex flex-col gap-3 rounded-3xl border bg-white p-3 transition-all sm:p-4 dark:bg-zinc-900",
				isDragging && "opacity-50"
			)}
		>
			<div className="flex items-start gap-2 sm:gap-4">
				<div
					ref={setActivatorNodeRef}
					{...listeners}
					className="cursor-grab touch-none pt-1"
				>
					<Grip className="h-5 w-5 text-muted-foreground" />
				</div>
				<div className="flex-1 space-y-2">
					<header className="flex items-center gap-2">
						<div
							className={`flex items-center justify-center rounded-md p-1.5 ${isCountdown ? "bg-blue-500" : "bg-purple-500"}`}
						>
							{isCountdown ? (
								<ClockFading className="h-4 w-4 text-white" />
							) : (
								<Ticket className="h-4 w-4 text-white" />
							)}
						</div>
						<span className="font-medium text-sm">
							{isCountdown ? "Contagem" : "Ingresso"}
						</span>
					</header>

					<div className="space-y-1">
						<h3 className="font-medium">
							{event.title.length > 64
								? `${event.title.slice(0, 64)}...`
								: event.title}
						</h3>
						<div className="text-muted-foreground text-sm">
							{isCountdown ? (
								<>{dateLabel}</>
							) : (
								<>
									{event.location} <br />
									{dateLabel} • {event.eventTime}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-between border-t pt-3">
				<div className="flex-1" />
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={event.active}
							disabled={isTogglingActive}
							id={`switch-${event.id}`}
							onCheckedChange={(checked) => onToggleActive?.(event.id, checked)}
						/>
						<Label
							className={cn(
								"text-sm",
								isTogglingActive
									? "cursor-default opacity-50"
									: "cursor-pointer"
							)}
							htmlFor={`switch-${event.id}`}
						>
							{event.active ? "Ativo" : "Inativo"}
						</Label>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="h-8 w-8" size="icon" variant="ghost">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onStartEditingEvent?.(event.id)}>
								<Edit className="mr-2 h-4 w-4" /> Editar
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleDelete}>
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</article>
	);
};

export default EventCard;

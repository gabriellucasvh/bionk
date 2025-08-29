"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
	Archive as ArchiveBox,
	Clock,
	Edit,
	Eye,
	EyeOff,
	Grip,
	Lock,
	MoreVertical,
	MousePointerClick,
	Save,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import type { LinkItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import { useCountdown } from "../utils/useCountdown";

// Tipos e Interfaces
interface LinkCardProps {
	link: LinkItem;
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onToggleActive: (id: number, active: boolean) => void;
	onToggleSensitive: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onClickLink: (id: number) => void;
}

// --- Subcomponentes ---

const CountdownTimer = ({
	date,
	prefix,
	endText,
}: {
	date: string;
	prefix: string;
	endText: string;
}) => {
	const { days, hours, minutes, seconds, hasEnded } = useCountdown(date);
	if (hasEnded) {
		return <p className="font-medium text-red-600 text-sm">{endText}</p>;
	}
	return (
		<div className="flex items-center gap-1 text-center font-semibold text-blue-600 text-sm">
			<Clock className="h-4 w-4" />
			<span>{prefix}: </span>
			<span>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</span>
		</div>
	);
};

const EditingView = ({
	link,
	onLinkChange,
	onSaveEditing,
	onCancelEditing,
}: Omit<
	LinkCardProps,
	| "listeners"
	| "setActivatorNodeRef"
	| "onToggleActive"
	| "onToggleSensitive"
	| "onArchiveLink"
	| "onDeleteLink"
	| "onClickLink"
>) => (
	<div className="flex flex-col gap-3 rounded-lg border-2 border-blue-500 p-3 sm:p-4">
		<div className="flex items-center gap-2">
			<div className="flex-1 space-y-1.5">
				<Input
					onChange={(e) => onLinkChange(link.id, "title", e.target.value)}
					placeholder="Título"
					value={link.title}
				/>
				<Input
					onChange={(e) => onLinkChange(link.id, "url", e.target.value)}
					placeholder="URL"
					value={link.url}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<BaseButton
					disabled={!(isValidUrl(link.url) && link.title)}
					onClick={() => onSaveEditing(link.id, link.title, link.url)}
					size="icon"
				>
					<Save className="h-4 w-4" />
				</BaseButton>
				<Button
					onClick={() => onCancelEditing(link.id)}
					size="icon"
					variant="ghost"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
);

const LinkContent = ({
	link,
	isLinkLocked,
	onClickLink,
}: {
	link: LinkItem;
	isLinkLocked: boolean;
	onClickLink: (id: number) => void;
}) => {
	return (
		<Link
			className={cn(
				"max-w-[200px] truncate text-blue-500 text-sm hover:underline",
				isLinkLocked && "cursor-not-allowed text-muted-foreground"
			)}
			href={isLinkLocked ? "#" : link.url}
			onClick={() => !isLinkLocked && onClickLink(link.id)}
			rel="noopener noreferrer"
			target="_blank"
		>
			{link.url.length > 30 ? `${link.url.slice(0, 30)}...` : link.url}
		</Link>
	);
};

const DisplayView = (props: LinkCardProps) => {
	const {
		link,
		listeners,
		setActivatorNodeRef,
		onStartEditing,
		onToggleActive,
		onToggleSensitive,
		onArchiveLink,
		onDeleteLink,
		onClickLink,
	} = props;

	const isLaunching = !!(
		link.launchesAt && new Date(link.launchesAt) > new Date()
	);
	const isExpiring = !!(
		link.expiresAt && new Date(link.expiresAt) > new Date()
	);
	const isLinkLocked = isLaunching;

	return (
		<article
			className={cn(
				"flex flex-col gap-3 rounded-lg border p-3 transition-all sm:p-4",
				link.sensitive && "border-rose-400"
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
					<header className="flex flex-wrap items-center gap-2">
						<h3 className="font-medium">{link.title}</h3>
						{link.badge && <Badge variant="secondary">{link.badge}</Badge>}
						{link.password && (
							<Lock className="h-3 w-3 text-muted-foreground" />
						)}
					</header>

					<LinkContent
						isLinkLocked={isLinkLocked}
						link={link}
						onClickLink={onClickLink}
					/>

					{isLaunching && link.launchesAt && (
						<CountdownTimer
							date={link.launchesAt}
							endText="Lançado!"
							prefix="Lança em"
						/>
					)}
					{isExpiring && !isLaunching && link.expiresAt && (
						<CountdownTimer
							date={link.expiresAt}
							endText="Expirado!"
							prefix="Expira em"
						/>
					)}
				</div>
			</div>
			<div className="flex items-center justify-end gap-2 border-t pt-3 sm:gap-4">
				<Badge className="flex items-center gap-1" variant="outline">
					<MousePointerClick className="h-3 w-3" />
					{link.clicks.toLocaleString()}
				</Badge>
				<div className="flex items-center space-x-2">
					<Switch
						checked={link.active}
						id={`switch-${link.id}`}
						onCheckedChange={(checked) => onToggleActive(link.id, checked)}
					/>
					<Label
						className="cursor-pointer text-sm"
						htmlFor={`switch-${link.id}`}
					>
						{link.active ? "Ativo" : "Inativo"}
					</Label>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="h-8 w-8" size="icon" variant="ghost">
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onStartEditing(link.id)}>
							<Edit className="mr-2 h-4 w-4" /> Editar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onToggleSensitive(link.id)}>
							{link.sensitive ? (
								<Eye className="mr-2 h-4 w-4" />
							) : (
								<EyeOff className="mr-2 h-4 w-4" />
							)}
							{link.sensitive ? "Marcar como normal" : "Conteúdo Sensível"}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onArchiveLink(link.id)}>
							<ArchiveBox className="mr-2 h-4 w-4" /> Arquivar
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDeleteLink(link.id)}
						>
							<Trash2 className="mr-2 h-4 w-4" /> Deletar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</article>
	);
};

// --- Componente Principal ---
const LinkCard = (props: LinkCardProps) => {
	if (props.link.isEditing) {
		return <EditingView {...props} />;
	}
	return <DisplayView {...props} />;
};

export default LinkCard;

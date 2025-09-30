"use client";

import {
	Archive as ArchiveBox,
	Clock,
	Edit,
	Grip,
	Image,
	Lock,
	MoreVertical,
	MousePointerClick,
	Save,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ArchivingLoader from "@/components/animations/ArchivingLoader";
import { BaseButton } from "@/components/buttons/BaseButton";
import ImageCropModal from "@/components/modals/ImageCropModal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useLinkAnimation } from "@/providers/linkAnimationProvider";
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
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onClickLink: (id: number) => void;
	onUpdateCustomImage?: (id: number, imageUrl: string) => void;
	onRemoveCustomImage?: (id: number) => void;
	borderRadius?: number;
	archivingLinkId?: number | null;
	isTogglingActive?: boolean;
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
	| "onArchiveLink"
	| "onDeleteLink"
	| "onClickLink"
>) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSaveEditing(link.id, link.title, link.url || "");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 rounded-lg border-2 border-blue-500 p-3 sm:p-4">
			<div className="flex items-center gap-2">
				<div className="flex-1 space-y-1.5">
					<div className="space-y-1">
						<Input
							maxLength={80}
							onChange={(e) => onLinkChange(link.id, "title", e.target.value)}
							placeholder="Título"
							value={link.title}
						/>
						<p className="text-muted-foreground text-xs">
							{link.title.length}/80 caracteres
						</p>
					</div>
					<div className="space-y-1">
						<Input
							onChange={(e) => onLinkChange(link.id, "url", e.target.value)}
							placeholder="URL"
							value={link.url || ""}
						/>
						<div className="h-4"></div>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<BaseButton
						disabled={!(isValidUrl(link.url || "") && link.title)}
						loading={isLoading}
						onClick={handleSave}
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
};

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
			href={isLinkLocked ? "#" : link.url || "#"}
			onClick={() => !isLinkLocked && onClickLink(link.id)}
			rel="noopener noreferrer"
			target="_blank"
		>
			{link.url && link.url.length > 30
				? `${link.url.slice(0, 30)}...`
				: link.url || ""}
		</Link>
	);
};

// Função auxiliar para calcular estados do link
const useLinkStates = (link: LinkItem, archivingLinkId?: number | null) => {
	const { animatedLinks } = useLinkAnimation();
	const isLinkAnimated = animatedLinks.has(link.id.toString());
	const isArchiving = archivingLinkId === link.id;

	const isLaunching = !!(
		link.launchesAt && new Date(link.launchesAt) > new Date()
	);
	const isExpiring = !!(
		link.expiresAt && new Date(link.expiresAt) > new Date()
	);
	const isLinkLocked = isLaunching;

	return { isLinkAnimated, isArchiving, isLaunching, isExpiring, isLinkLocked };
};

// Componente para botões de ação
const LinkActionButtons = ({
	link,
	isLinkAnimated,
	setIsImageModalOpen,
	toggleAnimation,
}: {
	link: LinkItem;
	isLinkAnimated: boolean;
	setIsImageModalOpen: (open: boolean) => void;
	toggleAnimation: (id: number) => Promise<void>;
}) => (
	<div className="flex flex-wrap items-center gap-2">
		{/* Botão de imagem simples */}
		<Button
			className={cn(
				"h-8 w-8 flex-shrink-0",
				link.customImageUrl
					? "text-green-600 hover:text-green-700"
					: "text-muted-foreground hover:text-foreground"
			)}
			onClick={() => setIsImageModalOpen(true)}
			size="icon"
			title={
				link.customImageUrl
					? "Alterar imagem personalizada"
					: "Adicionar imagem personalizada"
			}
			variant="ghost"
		>
			<Image className="h-4 w-4" />
		</Button>
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					className={cn(
						"h-8 w-8 flex-shrink-0",
						isLinkAnimated
							? "text-green-600 hover:text-green-700"
							: "text-muted-foreground hover:text-foreground"
					)}
					size="icon"
					title={isLinkAnimated ? "Desativar animação" : "Ativar animação"}
					variant="ghost"
				>
					<Zap className="h-4 w-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isLinkAnimated ? "Desativar" : "Ativar"} Animação
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isLinkAnimated
							? `Esta ação desativará a animação do link "${link.title || link.url}".`
							: `Esta ação fará o link "${link.title || link.url}" dar uma tremidinha infinita na sua página para chamar atenção dos visitantes.`}
						Deseja continuar?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-green-600 hover:bg-green-700"
						onClick={async () => {
							await toggleAnimation(link.id);
						}}
					>
						{isLinkAnimated ? "Desativar" : "Ativar"} Animação
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		<Badge className="flex flex-shrink-0 items-center gap-1" variant="outline">
			<MousePointerClick className="h-3 w-3" />
			<span className="hidden sm:inline">
				{(link.clicks || 0).toLocaleString()}
			</span>
			<span className="sm:hidden">{link.clicks || 0}</span>
		</Badge>
	</div>
);

const DisplayView = (props: LinkCardProps) => {
	const {
		link,
		listeners,
		setActivatorNodeRef,
		onStartEditing,
		onToggleActive,
		onArchiveLink,
		onDeleteLink,
		onClickLink,
		onUpdateCustomImage,
		onRemoveCustomImage,
		archivingLinkId,
		isTogglingActive,
	} = props;

	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const { toggleAnimation } = useLinkAnimation();
	const { isLinkAnimated, isArchiving, isLaunching, isExpiring, isLinkLocked } =
		useLinkStates(link, archivingLinkId);

	return (
		<article
			className={cn(
				"relative flex flex-col gap-3 rounded-lg border bg-white p-3 transition-all sm:p-4 dark:bg-neutral-800",
				isArchiving && "pointer-events-none"
			)}
		>
			{/* Overlay de loading durante arquivamento */}
			{isArchiving && (
				<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm dark:bg-neutral-800/90">
					<ArchivingLoader size="md" />
				</div>
			)}
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
						<h3 className="font-medium">
							{link.title.length > 64
								? `${link.title.slice(0, 64)}...`
								: link.title}
						</h3>
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
			<div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
				<LinkActionButtons
					isLinkAnimated={isLinkAnimated}
					link={link}
					setIsImageModalOpen={setIsImageModalOpen}
					toggleAnimation={toggleAnimation}
				/>
				<div className="flex items-center justify-between gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={link.active}
							disabled={isTogglingActive}
							id={`switch-${link.id}`}
							onCheckedChange={(checked) => onToggleActive(link.id, checked)}
						/>
						<Label
							className={cn(
								"text-sm",
								isTogglingActive
									? "cursor-default opacity-50"
									: "cursor-pointer"
							)}
							htmlFor={`switch-${link.id}`}
						>
							{link.active ? "Ativo" : "Inativo"}
						</Label>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 w-8 flex-shrink-0"
								size="icon"
								variant="ghost"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => onStartEditing(link.id)}>
								<Edit className="mr-2 h-4 w-4" /> Editar
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
			</div>

			{/* Modal de upload de imagem */}
			<ImageCropModal
				currentImageUrl={link.customImageUrl}
				isOpen={isImageModalOpen}
				linkId={link.id.toString()}
				onClose={() => setIsImageModalOpen(false)}
				onImageRemove={() => onRemoveCustomImage?.(link.id)}
				onImageSave={(imageUrl) => {
					onUpdateCustomImage?.(link.id, imageUrl);
					setIsImageModalOpen(false);
				}}
			/>
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

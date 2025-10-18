"use client";

import {
	Archive,
	Edit,
	Grip,
	Image as ImageIcon,
	LinkIcon,
	MoreVertical,
	MousePointerClick,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ImageItem, SectionItem } from "../types/links.types";
import AddNewImageForm from "./links.AddNewImageForm";

interface ImageCardProps {
	image: ImageItem;
	isDragging?: boolean;
	listeners?: any;
	setActivatorNodeRef?: (node: HTMLElement | null) => void;
	onToggleActive?: (id: number, isActive: boolean) => Promise<void>;
	onStartEditingImage?: (id: number) => void;
	onArchiveImage?: (id: number) => void;
	onDeleteImage?: (id: number) => void;
	onImageChange?: (
		id: number,
		field: "title" | "description",
		value: string
	) => void;
	onSaveEditingImage?: (id: number, payload: Partial<ImageItem>) => void;
	onCancelEditingImage?: (id: number) => void;
	isTogglingActive?: boolean;
	originalImage?: ImageItem | null;
	existingSections?: SectionItem[];
}

const EditingView = ({
	image,
	onSaveEditingImage,
	onCancelEditingImage,
	existingSections,
}: Pick<
	ImageCardProps,
	"image" | "onSaveEditingImage" | "onCancelEditingImage" | "existingSections"
>) => {
	const [localData, setLocalData] = useState(() => ({
		title: image.title || "",
		description: image.description || "",
		layout: image.layout,
		ratio: image.ratio,
		sizePercent: image.sizePercent,
		images: (image.items || []).map((it) => ({
			url: it.url,
			linkUrl: it.linkUrl || undefined,
		})),
		sectionId: image.sectionId ?? null,
	}));

	const handleSave = () => {
		const payload: Partial<ImageItem> = {
			title: localData.title || null,
			description: localData.description || null,
			layout: localData.layout,
			ratio: localData.ratio,
			sizePercent: localData.sizePercent,
			sectionId: localData.sectionId ?? null,
			items: localData.images.map((img) => ({
				url: img.url,
				linkUrl: img.linkUrl || null,
			})),
			isEditing: false as any,
		} as any;
		onSaveEditingImage?.(image.id, payload);
	};

	return (
		<div className="flex flex-col gap-3 rounded-lg border-2 border-foreground/20 p-3 sm:p-4">
			<AddNewImageForm
				existingSections={existingSections}
				formData={localData as any}
				maxImages={10}
				mode="edit"
				onCancel={() => onCancelEditingImage?.(image.id)}
				onSave={handleSave}
				setFormData={(d) => setLocalData(d as any)}
			/>
		</div>
	);
};

const DisplayView = ({
	image,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onStartEditingImage,
	onArchiveImage,
	onDeleteImage,
	isTogglingActive,
}: ImageCardProps) => {
	const handleStartEditing = () => {
		onStartEditingImage?.(image.id);
	};

	const handleArchive = () => {
		onArchiveImage?.(image.id);
	};

	const handleDelete = () => {
		onDeleteImage?.(image.id);
	};

	const itemCount = Array.isArray(image.items) ? image.items.length : 0;
	const clickableCount = Array.isArray(image.items)
		? image.items.filter((it) => !!(it.linkUrl && it.linkUrl?.trim())).length
		: 0;

	const totalClicks = Array.isArray(image.items)
		? image.items.reduce(
				(sum: number, it: any) => sum + (Number(it?.clicks) || 0),
				0
			)
		: 0;

	const layoutLabel = (() => {
		switch (image.layout) {
			case "single":
				return "Única";
			case "column":
				return "Coluna";
			case "carousel":
				return "Carrossel";
			default:
				return image.layout;
		}
	})();

	return (
		<article
			className={cn(
				"relative flex flex-col gap-3 rounded-lg border bg-white p-3 transition-all sm:p-4 dark:bg-neutral-900",
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
					<header className="flex items-center gap-3">
						<div
							className={cn(
								"flex items-center justify-center rounded-md bg-lime-500 p-1.5"
							)}
						>
							<ImageIcon className="h-4 w-4 text-white" />
						</div>
						<span className="font-medium text-sm">Imagem ({layoutLabel})</span>
						{/* Removed inline item count next to title */}
					</header>

					{(image.title || image.description) && (
						<div className="space-y-1">
							{image.title && (
								<h3 className="font-medium">
									{image.title.length > 64
										? `${image.title.slice(0, 64)}...`
										: image.title}
								</h3>
							)}
							{image.description && (
								<p className="text-muted-foreground text-sm">
									{image.description.length > 100
										? `${image.description.slice(0, 100)}...`
										: image.description}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center justify-between border-t pt-3">
				<div className="flex items-center gap-2">
					<Badge
						className="flex items-center gap-1"
						title="Quantidade de imagens"
						variant="outline"
					>
						<ImageIcon className="h-3 w-3" />
						<span className="hidden sm:inline">
							{itemCount.toLocaleString()}
						</span>
						<span className="sm:hidden">{itemCount}</span>
					</Badge>
					{clickableCount > 0 && (
						<Badge
							className="flex items-center gap-1"
							title="Imagens com link"
							variant="outline"
						>
							<LinkIcon className="h-3 w-3" />
							<span className="hidden sm:inline">
								{clickableCount.toLocaleString()}
							</span>
							<span className="sm:hidden">{clickableCount}</span>
						</Badge>
					)}
					{totalClicks > 0 && (
						<Badge
							className="flex items-center gap-1"
							title="Total de cliques"
							variant="outline"
						>
							<MousePointerClick className="h-3 w-3" />
							<span className="hidden sm:inline">
								{totalClicks.toLocaleString()}
							</span>
							<span className="sm:hidden">{totalClicks}</span>
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={image.active}
							disabled={isTogglingActive}
							id={`switch-${image.id}`}
							onCheckedChange={async (checked) => {
								try {
									await onToggleActive?.(image.id, checked);
								} catch {
									// noop
								}
							}}
						/>
						<Label
							className={cn(
								"text-sm",
								isTogglingActive
									? "cursor-default opacity-50"
									: "cursor-pointer"
							)}
							htmlFor={`switch-${image.id}`}
						>
							{image.active ? "Ativo" : "Inativo"}
						</Label>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="h-8 w-8" size="icon" variant="ghost">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleStartEditing}>
								<Edit className="mr-2 h-4 w-4" /> Editar
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleArchive}>
								<Archive className="mr-2 h-4 w-4" /> Arquivar
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onClick={handleDelete}
							>
								<Trash2 className="mr-2 h-4 w-4" /> Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</article>
	);
};

const ImageCard = (props: ImageCardProps) => {
	if (props.image.isEditing) {
		return <EditingView {...props} />;
	}
	return <DisplayView {...props} />;
};

export default ImageCard;

"use client";

import { Archive, Edit, Grip, MoreVertical, Trash2, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { VideoItem } from "../types/links.types";
import { getVideoPlatform, isValidVideoUrl } from "../utils/video.helpers";

interface VideoCardProps {
	video: VideoItem;
	isDragging?: boolean;
	listeners?: any;
	setActivatorNodeRef?: (node: HTMLElement | null) => void;
	onToggleActive?: (id: number, isActive: boolean) => Promise<void>;
	onStartEditingVideo?: (id: number) => void;
	onArchiveVideo?: (id: number) => void;
	onDeleteVideo?: (id: number) => void;
	onVideoChange?: (
		id: number,
		field: "title" | "description" | "url",
		value: string
	) => void;
	onSaveEditingVideo?: (
		id: number,
		title: string,
		description: string,
		url: string
	) => void;
	onCancelEditingVideo?: (id: number) => void;
	isTogglingActive?: boolean;
	originalVideo?: VideoItem | null;
}

// Subcomponentes
const EditingView = ({
	video,
	onVideoChange,
	onSaveEditingVideo,
	onCancelEditingVideo,
	originalVideo,
}: Pick<
	VideoCardProps,
	| "video"
	| "onVideoChange"
	| "onSaveEditingVideo"
	| "onCancelEditingVideo"
	| "originalVideo"
>) => {
	const [isLoading, setIsLoading] = useState(false);
	const [urlError, setUrlError] = useState<string | null>(null);

	const hasChanges = originalVideo
		? video.title !== originalVideo.title ||
			video.description !== originalVideo.description ||
			video.url !== originalVideo.url
		: true;

	const handleSave = async () => {
		const { valid, error } = isValidVideoUrl(video.url || "");
		if (!valid) {
			setUrlError(error || null);
			return;
		}
		if (video.title && video.url) {
			setIsLoading(true);
			try {
				await onSaveEditingVideo?.(
					video.id,
					video.title,
					video.description || "",
					video.url
				);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleCancel = () => {
		onCancelEditingVideo?.(video.id);
	};

	return (
		<div className="flex flex-col gap-3 rounded-3xl border-2 bg-white p-3 sm:p-4 dark:bg-zinc-900">
			<div className="space-y-3">
				<div>
					<Label className="font-medium text-sm" htmlFor="video-title">
						Título
					</Label>
					<Input
						id="video-title"
						maxLength={100}
						onChange={(e) => onVideoChange?.(video.id, "title", e.target.value)}
						placeholder="Digite o título do vídeo"
						value={video.title || ""}
					/>
				</div>

				<div>
					<Label className="font-medium text-sm" htmlFor="video-description">
						Descrição
					</Label>
					<Textarea
					className="max-h-40"
						id="video-description"
						maxLength={200}
						onChange={(e) =>
							onVideoChange?.(video.id, "description", e.target.value)
						}
						placeholder="Digite uma descrição (opcional)"
						rows={3}
						value={video.description || ""}
					/>
				</div>

				<div>
					<Label className="font-medium text-sm" htmlFor="video-url">
						URL do Vídeo
					</Label>
					<Input
						aria-invalid={!!urlError}
						id="video-url"
						onChange={(e) => {
							const nextUrl = e.target.value;
							const { valid, error } = isValidVideoUrl(nextUrl);
							setUrlError(valid ? null : error || null);
							onVideoChange?.(video.id, "url", nextUrl);
						}}
						placeholder="Cole a URL do vídeo (YouTube, Vimeo, TikTok, Twitch ou arquivo .mp4/.webm/.ogg)"
						value={video.url}
					/>
					{urlError && <p className="text-destructive text-xs">{urlError}</p>}
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<BaseButton onClick={handleCancel} variant="white">
					Cancelar
				</BaseButton>
				<BaseButton
					disabled={!(video.title && video.url && hasChanges) || !!urlError}
					loading={isLoading}
					onClick={handleSave}
				>
					Salvar
				</BaseButton>
			</div>
		</div>
	);
};

const DisplayView = ({
	video,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onStartEditingVideo,
	onArchiveVideo,
	onDeleteVideo,
	isTogglingActive,
}: VideoCardProps) => {
	const platform = getVideoPlatform(video.url);

	const handleStartEditing = () => {
		onStartEditingVideo?.(video.id);
	};

	const handleArchive = () => {
		onArchiveVideo?.(video.id);
	};

	const handleDelete = () => {
		onDeleteVideo?.(video.id);
	};

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
					<header className="flex items-center gap-3">
						{platform.iconPath ? (
							<div
								className={cn(
									"flex items-center justify-center rounded-md p-1.5",
									platform.bgColor
								)}
							>
								<Image
									alt={platform.name}
									className="h-4 w-4 brightness-0 invert"
									height={16}
									src={platform.iconPath}
									width={16}
								/>
							</div>
						) : (
							<div
								className={cn(
									"flex items-center justify-center rounded-md p-1.5",
									platform.bgColor
								)}
							>
								<Video className="h-4 w-4 text-white" />
							</div>
						)}
						<span className="font-medium text-sm">{platform.name}</span>
					</header>

					{(video.title || video.description) && (
						<div className="space-y-1">
							{video.title && (
								<h3 className="font-medium">
									{video.title.length > 64
										? `${video.title.slice(0, 64)}...`
										: video.title}
								</h3>
							)}
							{video.description && (
								<p className="text-muted-foreground text-sm">
									{video.description.length > 100
										? `${video.description.slice(0, 100)}...`
										: video.description}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center justify-end border-t pt-3">
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={video.active}
							disabled={isTogglingActive}
							id={`switch-${video.id}`}
							onCheckedChange={async (checked) => {
								try {
									await onToggleActive?.(video.id, checked);
								} catch {
									// Em caso de erro, o switch volta ao estado anterior
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
							htmlFor={`switch-${video.id}`}
						>
							{video.active ? "Ativo" : "Inativo"}
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

const VideoCard = (props: VideoCardProps) => {
	if (props.video.isEditing) {
		return <EditingView {...props} />;
	}
	return <DisplayView {...props} />;
};

export default VideoCard;

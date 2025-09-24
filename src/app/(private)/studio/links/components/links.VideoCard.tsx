"use client";

import {
	Archive,
	Edit,
	Grip,
	MoreVertical,
	Save,
	Trash2,
	X,
} from "lucide-react";
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
import VideoPlayer from "@/components/VideoPlayer";
import type { VideoItem } from "../types/links.types";

interface VideoCardProps {
	video: VideoItem;
	isDragging?: boolean;
	listeners?: any;
	setActivatorNodeRef?: (node: HTMLElement | null) => void;
	onToggleActive?: (id: number, isActive: boolean) => void;
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
}

const VideoCard = ({
	video,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onStartEditingVideo,
	onArchiveVideo,
	onDeleteVideo,
	onVideoChange,
	onSaveEditingVideo,
	onCancelEditingVideo,
}: VideoCardProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleToggleActive = () => {
		if (onToggleActive) {
			onToggleActive(video.id, !video.active);
		}
	};

	const handleStartEditing = () => {
		if (onStartEditingVideo) {
			onStartEditingVideo(video.id);
		}
		setIsMenuOpen(false);
	};

	const handleArchive = () => {
		if (onArchiveVideo) {
			onArchiveVideo(video.id);
		}
		setIsMenuOpen(false);
	};

	const handleDelete = () => {
		if (onDeleteVideo) {
			onDeleteVideo(video.id);
		}
		setIsMenuOpen(false);
	};

	const handleSave = () => {
		if (onSaveEditingVideo && video.title && video.url) {
			onSaveEditingVideo(
				video.id,
				video.title,
				video.description || "",
				video.url
			);
		}
	};

	const handleCancel = () => {
		if (onCancelEditingVideo) {
			onCancelEditingVideo(video.id);
		}
	};

	const handleFieldChange = (
		field: "title" | "description" | "url",
		value: string
	) => {
		if (onVideoChange) {
			onVideoChange(video.id, field, value);
		}
	};

	if (video.isEditing) {
		return (
			<div
				className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 ${
					isDragging ? "opacity-50" : ""
				}`}
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-gray-900 text-sm dark:text-white">
							Editando Vídeo
						</h3>
						<div className="flex items-center gap-2">
							<Button
								className="h-8 px-3"
								disabled={!(video.title?.trim() && video.url?.trim())}
								onClick={handleSave}
								size="sm"
							>
								<Save className="h-4 w-4" />
							</Button>
							<Button
								className="h-8 px-3"
								onClick={handleCancel}
								size="sm"
								variant="outline"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<Label htmlFor={`video-title-${video.id}`}>Título</Label>
							<Input
								className="mt-1"
								id={`video-title-${video.id}`}
								onChange={(e) => handleFieldChange("title", e.target.value)}
								placeholder="Título do vídeo"
								value={video.title || ""}
							/>
						</div>

						<div>
							<Label htmlFor={`video-description-${video.id}`}>Descrição</Label>
							<Textarea
								className="mt-1 min-h-[80px]"
								id={`video-description-${video.id}`}
								onChange={(e) =>
									handleFieldChange("description", e.target.value)
								}
								placeholder="Descrição do vídeo"
								value={video.description || ""}
							/>
						</div>

						<div>
							<Label htmlFor={`video-url-${video.id}`}>URL do Vídeo</Label>
							<Input
								className="mt-1"
								id={`video-url-${video.id}`}
								onChange={(e) => handleFieldChange("url", e.target.value)}
								placeholder="URL do vídeo"
								value={video.url}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`group relative rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
				isDragging ? "opacity-50" : ""
			} ${video.active ? "" : "opacity-60"}`}
		>
			<div className="flex items-start gap-3">
				<button
					ref={setActivatorNodeRef}
					{...listeners}
					className="mt-1 cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
					type="button"
				>
					<Grip className="h-4 w-4" />
				</button>

				<div className="flex-1 space-y-3">
					{video.title && (
						<h3 className="font-medium text-gray-900 dark:text-white">
							{video.title}
						</h3>
					)}

					{video.description && (
						<p className="text-gray-600 text-sm dark:text-gray-300">
							{video.description}
						</p>
					)}

					<div className="overflow-hidden rounded-lg">
						<VideoPlayer
							title={video.title || undefined}
							type={video.type}
							url={video.url}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Switch
								checked={video.active}
								className="data-[state=checked]:bg-green-600"
								onCheckedChange={handleToggleActive}
							/>
							<span className="text-gray-600 text-sm dark:text-gray-300">
								{video.active ? "Ativo" : "Inativo"}
							</span>
						</div>

						<DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
							<DropdownMenuTrigger asChild>
								<BaseButton
									className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
									size="sm"
									variant="white"
								>
									<MoreVertical className="h-4 w-4" />
								</BaseButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem onClick={handleStartEditing}>
									<Edit className="mr-2 h-4 w-4" />
									Editar
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleArchive}>
									<Archive className="mr-2 h-4 w-4" />
									Arquivar
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-red-600 focus:text-red-600"
									onClick={handleDelete}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Excluir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoCard;

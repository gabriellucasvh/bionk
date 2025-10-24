"use client";

import {
	Archive,
	Edit,
	Grip,
	MoreVertical,
	Music2,
	Trash2,
	X,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { fetchMetadataFromProvider, parseMusicUrl } from "@/utils/music";
import type { MusicItem } from "../types/links.types";
import { getMusicPlatform, isValidMusicUrl } from "../utils/music.helpers";

interface MusicCardProps {
	music: MusicItem;
	isDragging?: boolean;
	listeners?: any;
	setActivatorNodeRef?: (node: HTMLElement | null) => void;
	onToggleActive?: (id: number, isActive: boolean) => Promise<void>;
	onStartEditingMusic?: (id: number) => void;
	onArchiveMusic?: (id: number) => void;
	onDeleteMusic?: (id: number) => void;
	onMusicChange?: (
		id: number,
		field: "title" | "url" | "usePreview",
		value: string | boolean
	) => void;
	onSaveEditingMusic?: (
		id: number,
		title: string,
		url: string,
		usePreview: boolean
	) => void;
	onCancelEditingMusic?: (id: number) => void;
	isTogglingActive?: boolean;
	originalMusic?: MusicItem | null;
}

// Subcomponentes
const EditingView = ({
	music,
	onMusicChange,
	onSaveEditingMusic,
	onCancelEditingMusic,
	originalMusic,
}: Pick<
	MusicCardProps,
	| "music"
	| "onMusicChange"
	| "onSaveEditingMusic"
	| "onCancelEditingMusic"
	| "originalMusic"
>) => {
	const [isLoading, setIsLoading] = useState(false);
	const [urlError, setUrlError] = useState<string | null>(null);

	const hasChanges = originalMusic
		? music.title !== originalMusic.title ||
			music.url !== originalMusic.url ||
			music.usePreview !== (originalMusic.usePreview ?? false)
		: true;

	const tryAutoFillTitle = async (url: string) => {
		try {
			const { valid } = isValidMusicUrl(url);
			if (!valid) {
				return;
			}
			if ((music.title || "").trim().length > 0) {
				return;
			}
			const parsed = parseMusicUrl(url);
			const meta = await fetchMetadataFromProvider(parsed);
			const nextTitle = (meta?.title || "").toString();
			if (nextTitle.trim().length > 0) {
				onMusicChange?.(music.id, "title", nextTitle);
			}
		} catch {
			// silent
		}
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSaveEditingMusic?.(
				music.id,
				music.title || "",
				music.url,
				!!music.usePreview
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		onCancelEditingMusic?.(music.id);
	};

	return (
		<div className="flex flex-col gap-3 rounded-lg border-2 border-foreground/20 p-3 sm:p-4">
			<div className="space-y-3">
				<div>
					<Label className="font-medium text-sm" htmlFor="music-title">
						Título
					</Label>
					<Input
						id="music-title"
						maxLength={100}
						onChange={(e) => onMusicChange?.(music.id, "title", e.target.value)}
						placeholder="Digite o título da música"
						value={music.title || ""}
					/>
				</div>

				<div>
					<Label className="font-medium text-sm" htmlFor="music-url">
						URL da Música
					</Label>
					<Input
						aria-invalid={!!urlError}
						id="music-url"
						onBlur={async (e) => {
							const nextUrl = e.target.value;
							await tryAutoFillTitle(nextUrl);
						}}
						onChange={(e) => {
							const nextUrl = e.target.value;
							const { valid, error } = isValidMusicUrl(nextUrl);
							setUrlError(valid ? null : error || null);
							onMusicChange?.(music.id, "url", nextUrl);
						}}
						placeholder="Cole a URL da música (Spotify)"
						value={music.url}
					/>
					{urlError && <p className="text-destructive text-xs">{urlError}</p>}
				</div>

				<div className="grid gap-2">
					<Label className="text-sm">Como exibir</Label>
					<div className="flex items-center gap-4">
						<RadioGroup
							className="flex gap-6"
							onValueChange={(value) =>
								onMusicChange?.(music.id, "usePreview", value === "preview")
							}
							value={music.usePreview ? "preview" : "direct"}
						>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									id={`music-opt-preview-${music.id}`}
									value="preview"
								/>
								<Label htmlFor={`music-opt-preview-${music.id}`}>
									Preview (padrão)
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									id={`music-opt-direct-${music.id}`}
									value="direct"
								/>
								<Label htmlFor={`music-opt-direct-${music.id}`}>
									Link Direto
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<BaseButton
					className="px-4"
					disabled={!hasChanges || !!urlError}
					loading={isLoading}
					onClick={handleSave}
				>
					Salvar
				</BaseButton>
				<Button onClick={handleCancel} variant="outline">
					<X className="mr-2 h-4 w-4" /> Cancelar
				</Button>
			</div>
		</div>
	);
};

const DisplayView = ({
	music,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onStartEditingMusic,
	onArchiveMusic,
	onDeleteMusic,
	isTogglingActive,
}: MusicCardProps) => {
	const platform = getMusicPlatform(music.url);

	const handleStartEditing = () => {
		onStartEditingMusic?.(music.id);
	};

	const handleArchive = () => {
		onArchiveMusic?.(music.id);
	};

	const handleDelete = () => {
		onDeleteMusic?.(music.id);
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
								<Music2 className="h-4 w-4 text-white" />
							</div>
						)}
						<span className="font-medium text-sm">{platform.name}</span>
					</header>

					{music.title && (
						<div className="space-y-1">
							<h3 className="font-medium">
								{music.title.length > 64
									? `${music.title.slice(0, 64)}...`
									: music.title}
							</h3>
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center justify-end border-t pt-3">
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={music.active}
							disabled={isTogglingActive}
							id={`switch-${music.id}`}
							onCheckedChange={async (checked) => {
								try {
									await onToggleActive?.(music.id, checked);
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
							htmlFor={`switch-${music.id}`}
						>
							{music.active ? "Ativo" : "Inativo"}
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

const MusicCard = (props: MusicCardProps) => {
	if (props.music.isEditing) {
		return <EditingView {...props} />;
	}
	return <DisplayView {...props} />;
};

export default MusicCard;

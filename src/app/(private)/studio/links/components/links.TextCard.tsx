"use client";

import {
	AlignCenter,
	AlignLeft,
	AlignRight,
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
import type { TextItem } from "../types/links.types";

interface TextCardProps {
	text: TextItem;
	isDragging?: boolean;
	listeners?: any;
	setActivatorNodeRef?: (node: HTMLElement | null) => void;
	onToggleActive?: (id: number, isActive: boolean) => void;
	onStartEditingText?: (id: number) => void;
	onArchiveText?: (id: number) => void;
	onDeleteText?: (id: number) => void;
	onTextChange?: (
		id: number,
		field: "title" | "description" | "position" | "hasBackground" | "isCompact",
		value: string | boolean
	) => void;
	onSaveEditingText?: (
		id: number,
		title: string,
		description: string,
		position: "left" | "center" | "right",
		hasBackground: boolean,
		isCompact: boolean
	) => void;
	onCancelEditingText?: (id: number) => void;
	isTogglingActive?: boolean;
	originalText?: TextItem | null;
}

const TextCard = ({
	text,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onStartEditingText,
	onArchiveText,
	onDeleteText,
	onTextChange,
	onSaveEditingText,
	onCancelEditingText,
	isTogglingActive,
	originalText,
}: TextCardProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const hasChanges = originalText
		? text.title !== originalText.title ||
			text.description !== originalText.description ||
			text.position !== originalText.position ||
			text.hasBackground !== originalText.hasBackground ||
			text.isCompact !== originalText.isCompact
		: true;

	const handleEdit = () => {
		if (onStartEditingText) {
			onStartEditingText(text.id);
		}
		setIsMenuOpen(false);
	};

	const handleArchive = () => {
		if (onArchiveText) {
			onArchiveText(text.id);
		}
		setIsMenuOpen(false);
	};

	const handleDelete = () => {
		if (onDeleteText) {
			onDeleteText(text.id);
		}
		setIsMenuOpen(false);
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			if (onSaveEditingText) {
				await onSaveEditingText(
					text.id,
					text.title,
					text.description,
					text.position,
					text.hasBackground,
					text.isCompact
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		if (onCancelEditingText) {
			onCancelEditingText(text.id);
		}
	};

	const handleFieldChange = (
		field: "title" | "description" | "position" | "hasBackground" | "isCompact",
		value: string | boolean
	) => {
		if (onTextChange) {
			onTextChange(text.id, field, value);
		}
	};

	if (text.isEditing) {
		return (
			<article
				className={`relative flex flex-col gap-3 rounded-lg border bg-white p-3 transition-all sm:p-4 dark:bg-neutral-900 ${
					isDragging ? "opacity-50" : ""
				}`}
			>
				<div className="flex items-start gap-2 sm:gap-4">
					<div
						ref={setActivatorNodeRef}
						{...listeners}
						className="cursor-grab touch-none pt-1"
					>
						<Grip className="h-5 w-5 text-muted-foreground" />
					</div>
					<div className="flex-1 space-y-4">
						<div className="space-y-2">
							<Label htmlFor={`title-${text.id}`}>Título</Label>
							<Input
								className="break-words"
								id={`title-${text.id}`}
								onChange={(e) => handleFieldChange("title", e.target.value)}
								placeholder="Digite o título do texto"
								value={text.title}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={`description-${text.id}`}>Descrição</Label>
							<Textarea
								className="resize-none whitespace-pre-wrap break-words"
								id={`description-${text.id}`}
								maxLength={1500}
								onChange={(e) => {
									if (e.target.value.length <= 1500) {
										handleFieldChange("description", e.target.value);
									}
								}}
								placeholder="Digite a descrição do texto"
								rows={3}
								value={text.description}
							/>
							<div className="text-right text-muted-foreground text-xs">
								{text.description.length}/1500 caracteres
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor={`position-${text.id}`}>Posição do texto</Label>
							<div className="flex gap-2">
								<BaseButton
									className="rounded-lg"
									onClick={() => handleFieldChange("position", "left")}
									size="icon"
									type="button"
									variant={text.position === "left" ? "default" : "white"}
								>
									<AlignLeft className="h-4 w-4" />
								</BaseButton>
								<BaseButton
									className="rounded-lg"
									onClick={() => handleFieldChange("position", "center")}
									size="icon"
									type="button"
									variant={text.position === "center" ? "default" : "white"}
								>
									<AlignCenter className="h-4 w-4" />
								</BaseButton>
								<BaseButton
									className="rounded-lg"
									onClick={() => handleFieldChange("position", "right")}
									size="icon"
									type="button"
									variant={text.position === "right" ? "default" : "white"}
								>
									<AlignRight className="h-4 w-4" />
								</BaseButton>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								checked={text.hasBackground}
								id={`background-${text.id}`}
								onCheckedChange={(checked) =>
									handleFieldChange("hasBackground", checked)
								}
							/>
							<Label htmlFor={`background-${text.id}`}>Background</Label>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								checked={text.isCompact}
								id={`compact-${text.id}`}
								onCheckedChange={(checked) =>
									handleFieldChange("isCompact", checked)
								}
							/>
							<Label htmlFor={`compact-${text.id}`}>Modo Compacto</Label>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-2 border-t pt-3">
					<BaseButton onClick={handleCancel} size="sm" variant="white">
						<X className="mr-2 h-4 w-4" />
						Cancelar
					</BaseButton>
					<BaseButton
						disabled={isLoading || !text.title || !hasChanges}
						loading={isLoading}
						onClick={handleSave}
						size="sm"
						variant="default"
					>
						<Save className="mr-2 h-4 w-4" />
						Salvar
					</BaseButton>
				</div>
			</article>
		);
	}

	return (
		<article
			className={`relative flex flex-col gap-3 rounded-lg border bg-white p-3 transition-all sm:p-4 dark:bg-neutral-900 ${
				isDragging ? "opacity-50" : ""
			}`}
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
						<h3 className="font-medium">
							{text.title.length > 64
								? `${text.title.slice(0, 64)}...`
								: text.title}
						</h3>
					</header>

					<p className="text-muted-foreground text-sm">
						{text.description.length > 100
							? `${text.description.slice(0, 100)}...`
							: text.description}
					</p>
				</div>
			</div>
			<div className="flex items-center justify-between border-t pt-3">
				<div className="flex-1" />
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={text.active}
							disabled={isTogglingActive}
							id={`switch-${text.id}`}
							onCheckedChange={(checked) => onToggleActive?.(text.id, checked)}
						/>
						<Label
							className={`text-sm ${isTogglingActive ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
							htmlFor={`switch-${text.id}`}
						>
							{text.active ? "Ativo" : "Inativo"}
						</Label>
					</div>
					<DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
						<DropdownMenuTrigger asChild>
							<Button className="h-8 w-8" size="icon" variant="ghost">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleEdit}>
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
								<Trash2 className="mr-2 h-4 w-4" /> Deletar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</article>
	);
};

export default TextCard;

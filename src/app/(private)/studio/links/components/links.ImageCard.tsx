"use client";

import {
    Archive,
    Edit,
    Grip,
    MoreVertical,
    Save,
    Trash2,
    Image as ImageIcon,
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
import { cn } from "@/lib/utils";
import type { ImageItem } from "../types/links.types";

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
    onSaveEditingImage?: (
        id: number,
        title: string,
        description: string
    ) => void;
    onCancelEditingImage?: (id: number) => void;
    isTogglingActive?: boolean;
    originalImage?: ImageItem | null;
}

const EditingView = ({
    image,
    onImageChange,
    onSaveEditingImage,
    onCancelEditingImage,
    originalImage,
}: Pick<
    ImageCardProps,
    | "image"
    | "onImageChange"
    | "onSaveEditingImage"
    | "onCancelEditingImage"
    | "originalImage"
>) => {
    const [isLoading, setIsLoading] = useState(false);

    const hasChanges = originalImage
        ? (image.title || "") !== (originalImage.title || "") ||
          (image.description || "") !== (originalImage.description || "")
        : true;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSaveEditingImage?.(
                image.id,
                image.title || "",
                image.description || ""
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onCancelEditingImage?.(image.id);
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border-2 border-indigo-500 p-3 sm:p-4">
            <div className="space-y-3">
                <div>
                    <Label className="font-medium text-sm" htmlFor={`image-title-${image.id}`}>
                        Título
                    </Label>
                    <Input
                        id={`image-title-${image.id}`}
                        maxLength={100}
                        onChange={(e) => onImageChange?.(image.id, "title", e.target.value)}
                        placeholder="Digite o título (opcional)"
                        value={image.title || ""}
                    />
                </div>

                <div>
                    <Label className="font-medium text-sm" htmlFor={`image-description-${image.id}`}>
                        Descrição
                    </Label>
                    <Textarea
                        id={`image-description-${image.id}`}
                        maxLength={200}
                        onChange={(e) => onImageChange?.(image.id, "description", e.target.value)}
                        placeholder="Digite uma descrição (opcional)"
                        rows={3}
                        value={image.description || ""}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <BaseButton onClick={handleCancel} size="sm" variant="white">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                </BaseButton>
                <BaseButton
                    disabled={!hasChanges}
                    loading={isLoading}
                    onClick={handleSave}
                    size="sm"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                </BaseButton>
            </div>
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
                        <div className={cn("flex items-center justify-center rounded-md bg-indigo-600 p-1.5")}> 
                            <ImageIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">Imagem ({layoutLabel})</span>
                        <span className="text-muted-foreground text-xs">{itemCount} item(s)</span>
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
            <div className="flex items-center justify-end border-t pt-3">
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
                                isTogglingActive ? "cursor-default opacity-50" : "cursor-pointer"
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
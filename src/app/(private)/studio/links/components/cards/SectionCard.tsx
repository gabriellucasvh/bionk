// links/components/links.SectionCard.tsx
"use client";

import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Grip, MoreHorizontal, Plus, Trash2, Ungroup } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UnifiedItem } from "../../hooks/useLinksManager";
import type {
	EventItem,
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../../types/links.types";
import LinkCard from "../cards/LinkCard";
import SortableItem from "../sortable/SortableItem";
import EventCard from "./EventCard";
import ImageCard from "./ImageCard";
import MusicCard from "./MusicCard";
import TextCard from "./TextCard";
import VideoCard from "./VideoCard";

interface SectionCardProps {
	section: SectionItem;
	items?: UnifiedItem[];
	onSectionUpdate: (id: number, payload: Partial<SectionItem>) => void;
	onSectionDelete: (id: number) => void;
	onSectionUngroup: (id: number) => void;
	onArchiveLink: (id: number) => void;
	onDeleteLink: (id: number) => void;
	onSaveEditing: (id: number, title: string, url: string) => void;
	onToggleActive: (id: number, isActive: boolean) => void;
	onLinkChange: (id: number, field: "title" | "url", value: string) => void;
	onCancelEditing: (id: number) => void;
	onStartEditing: (id: number) => void;
	onClickLink: (id: number) => void;
	listeners: any;
	setActivatorNodeRef: (element: HTMLElement | null) => void;
	isDragging: boolean;
	archivingLinkId?: number | null;
	onAddLinkToSection?: (sectionId: number) => void;
	onSaveNewSection?: (id: number, title: string) => void;
	onCancelNewSection?: (id: number) => void;
	linksManager?: any;
	onUpdateCustomImage?: (id: number, imageUrl: string) => void;
	onRemoveCustomImage?: (id: number) => void;
	isTogglingActive?: boolean;
	existingSections?: SectionItem[];
	togglingLinkId?: number | null;
	originalLink?: LinkItem | null;
	onDeleteText?: (id: number) => void;
	onArchiveText?: (id: number) => void;
	onStartEditingText?: (id: number) => void;
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
	togglingTextId?: number | null;
	originalText?: TextItem | null;
	onDeleteVideo?: (id: number) => void;
	onArchiveVideo?: (id: number) => void;
	onStartEditingVideo?: (id: number) => void;
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
	togglingVideoId?: number | null;
	originalVideo?: VideoItem | null;
	onDeleteImage?: (id: number) => void;
	onArchiveImage?: (id: number) => void;
	onStartEditingImage?: (id: number) => void;
	onImageChange?: (
		id: number,
		field: "title" | "description",
		value: string
	) => void;
	onSaveEditingImage?: (id: number, payload: Partial<ImageItem>) => void;
	onCancelEditingImage?: (id: number) => void;
	togglingImageId?: number | null;
	originalImage?: ImageItem | null;
	onDeleteMusic?: (id: number) => void;
	onArchiveMusic?: (id: number) => void;
	onStartEditingMusic?: (id: number) => void;
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
	togglingMusicId?: number | null;
	originalMusic?: MusicItem | null;
	onDeleteEvent?: (id: number) => void;
	onStartEditingEvent?: (id: number) => void;
    handleSaveEditingEvent?: (id: number, payload: Partial<EventItem>) => void;
    handleCancelEditingEvent?: (id: number) => void;
    togglingEventId?: number | null;
    originalEvent?: EventItem | null;
    onArchiveEvent?: (id: number) => void;
}

const SectionCard = ({
	section,
	items,
	onSectionUpdate,
	onSectionDelete,
	onSectionUngroup,
	listeners,
	setActivatorNodeRef,
	isDragging,
	onAddLinkToSection,
	onSaveNewSection,
	onCancelNewSection,
	linksManager,
	isTogglingActive,
	existingSections,
	...linkCardProps
}: SectionCardProps) => {
	const [title, setTitle] = useState(section.title || "");
	const isDraftSection = !section.dbId;
	const sectionNumericId =
		typeof section.dbId === "number" && Number.isFinite(section.dbId)
			? section.dbId
			: Number(section.id);
	const sectionStringId = (section.id ?? "").toString();
	const childrenFromItems: UnifiedItem[] = (items || []).filter((i) => {
		const raw = (i as any).sectionId;
		if (raw === null || typeof raw === "undefined") {
			return false;
		}
		if (typeof raw === "number") {
			if (Number.isFinite(raw) && raw === sectionNumericId) {
				return true;
			}
			if (String(raw) === sectionStringId) {
				return true;
			}
			return false;
		}
		if (typeof raw === "string") {
			if (raw === sectionStringId) {
				return true;
			}
			const asNum = Number(raw);
			if (Number.isFinite(asNum) && asNum === sectionNumericId) {
				return true;
			}
			return false;
		}
		return false;
	});
	const otherChildren: UnifiedItem[] = childrenFromItems.filter((c: any) => {
		if (c.isSection) {
			return false;
		}
		if (
			c.isText ||
			c.isVideo ||
			(c as any).isImage ||
			(c as any).isMusic ||
			(c as any).isEvent
		) {
			return true;
		}
		return false;
	});
	const children: UnifiedItem[] = [
		...(section.links || []),
		...otherChildren,
	].sort((a: any, b: any) => {
		const ao = typeof a.order === "number" ? a.order : 0;
		const bo = typeof b.order === "number" ? b.order : 0;
		return ao - bo;
	});
	return (
		<section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
			{/* Header reorganizado para dispositivos móveis */}
			<div className="space-y-3">
				{/* Primeira linha: Grip, Título e Menu de opções */}
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<div
							ref={setActivatorNodeRef}
							{...listeners}
							className="flex-shrink-0 cursor-grab touch-none p-1"
						>
							<Grip className="h-4 w-4 text-muted-foreground" />
						</div>
						{isDraftSection ? (
							<input
								className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-1 text-lg outline-none dark:border-zinc-700"
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Título da seção"
								value={title}
							/>
						) : (
							<h2 className="truncate font-bold text-foreground text-lg">
								{section.title}
							</h2>
						)}
					</div>
					{isDraftSection ? null : (
						<DropdownMenu>
							<DropdownMenuTrigger className="p-1">
								<MoreHorizontal className="h-4 w-4" />
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="space-y-2 py-2">
								<DropdownMenuItem
									onClick={() => onSectionUngroup(section.dbId)}
								>
									<Ungroup className="mr-2 h-4 w-4" />
									<span>Desagrupar</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => onSectionDelete(section.dbId)}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Deletar</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>

				{/* Segunda linha: Botão adicionar conteúdo e Toggle ativo/inativo */}
				<div className="flex flex-wrap items-center justify-between gap-3">
					<BaseButton
						className="h-8 flex-shrink-0 rounded-full"
						disabled={isDraftSection}
						onClick={async () => {
							if (linksManager?.openAddContentModalForSection) {
								linksManager.openAddContentModalForSection(section.dbId);
							} else if (onAddLinkToSection) {
								await onAddLinkToSection(section.dbId);
							}
						}}
						variant="studio"
					>
						<Plus className="mr-1 h-3 w-3" />
						<span className="hidden sm:inline">Adicionar Conteúdo</span>
						<span className="sm:hidden">Adicionar</span>
					</BaseButton>
					<div className="flex flex-shrink-0 items-center space-x-2">
						{isDraftSection ? null : (
							<>
								<Switch
									checked={section.active}
									disabled={isTogglingActive}
									id={`section-switch-${section.id}`}
									onCheckedChange={(checked) =>
										onSectionUpdate(section.dbId, { active: checked })
									}
								/>
								<Label
									className={`cursor-pointer text-sm ${isTogglingActive ? "opacity-50" : ""}`}
									htmlFor={`section-switch-${section.id}`}
								>
									{section.active ? "Ativa" : "Inativa"}
								</Label>
							</>
						)}
					</div>
				</div>
			</div>

			{isDraftSection && (
				<div className="flex items-center gap-2">
					<Button
						className="h-8 rounded-full"
						onClick={() => {
							if (onSaveNewSection) {
								onSaveNewSection(Number(section.id), title);
							}
						}}
						size="sm"
					>
						Salvar seção
					</Button>
					<Button
						className="h-8 rounded-full"
						onClick={() => {
							if (onCancelNewSection) {
								onCancelNewSection(Number(section.id));
							}
						}}
						size="sm"
						variant="ghost"
					>
						Cancelar
					</Button>
				</div>
			)}

			{!isDragging && (
				<SortableContext
					items={children.map((child) => {
						if ((child as any).isSection) {
							return `section-${child.id}`;
						}
						if ((child as any).isText) {
							return `text-${child.id}`;
						}
						if ((child as any).isVideo) {
							return `video-${child.id}`;
						}
						if ((child as any).isImage) {
							return `image-${child.id}`;
						}
						if ((child as any).isMusic) {
							return `music-${child.id}`;
						}
						if ((child as any).isEvent) {
							return `event-${child.id}`;
						}
						return `link-${child.id}`;
					})}
					strategy={verticalListSortingStrategy}
				>
					<div className="space-y-3">
						{children.map((child) => {
							const childIdStr = (() => {
								if ((child as any).isText) {
									return `text-${child.id}`;
								}
								if ((child as any).isVideo) {
									return `video-${child.id}`;
								}
								if ((child as any).isImage) {
									return `image-${child.id}`;
								}
								if ((child as any).isMusic) {
									return `music-${child.id}`;
								}
								if ((child as any).isEvent) {
									return `event-${child.id}`;
								}
								return `link-${child.id}`;
							})();
							return (
								<SortableItem id={childIdStr} key={childIdStr}>
									{({
										listeners: childListeners,
										setActivatorNodeRef: childSetRef,
									}) => {
										if ((child as any).isText) {
											return (
												<TextCard
													isDragging={false}
													listeners={childListeners}
													onArchiveText={linkCardProps.onArchiveText as any}
													onCancelEditingText={
														linkCardProps.onCancelEditingText as any
													}
													onDeleteText={linkCardProps.onDeleteText as any}
													onSaveEditingText={
														linkCardProps.onSaveEditingText as any
													}
													onStartEditingText={
														linkCardProps.onStartEditingText as any
													}
													onTextChange={linkCardProps.onTextChange as any}
													onToggleActive={linkCardProps.onToggleActive as any}
													setActivatorNodeRef={childSetRef}
													text={child as any}
												/>
											);
										}
										if ((child as any).isVideo) {
											return (
												<VideoCard
													isDragging={false}
													isTogglingActive={
														linkCardProps.togglingVideoId === child.id
													}
													listeners={childListeners}
													onArchiveVideo={linkCardProps.onArchiveVideo as any}
													onCancelEditingVideo={
														linkCardProps.onCancelEditingVideo as any
													}
													onDeleteVideo={linkCardProps.onDeleteVideo as any}
													onSaveEditingVideo={
														linkCardProps.onSaveEditingVideo as any
													}
													onStartEditingVideo={
														linkCardProps.onStartEditingVideo as any
													}
													onToggleActive={linkCardProps.onToggleActive as any}
													onVideoChange={linkCardProps.onVideoChange as any}
													originalVideo={linkCardProps.originalVideo as any}
													setActivatorNodeRef={childSetRef}
													video={child as any}
												/>
											);
										}
										if ((child as any).isImage) {
											return (
												<ImageCard
													existingSections={existingSections as any}
													image={child as any}
													isDragging={false}
													isTogglingActive={
														linkCardProps.togglingImageId === child.id
													}
													listeners={childListeners}
													onArchiveImage={linkCardProps.onArchiveImage as any}
													onCancelEditingImage={
														linkCardProps.onCancelEditingImage as any
													}
													onDeleteImage={linkCardProps.onDeleteImage as any}
													onImageChange={linkCardProps.onImageChange as any}
													onSaveEditingImage={
														linkCardProps.onSaveEditingImage as any
													}
													onStartEditingImage={
														linkCardProps.onStartEditingImage as any
													}
													onToggleActive={linkCardProps.onToggleActive as any}
													originalImage={linkCardProps.originalImage as any}
													setActivatorNodeRef={childSetRef}
												/>
											);
										}
										if ((child as any).isMusic) {
											return (
												<MusicCard
													isDragging={false}
													isTogglingActive={
														linkCardProps.togglingMusicId === child.id
													}
													listeners={childListeners}
													music={child as any}
													onArchiveMusic={linkCardProps.onArchiveMusic as any}
													onCancelEditingMusic={
														linkCardProps.onCancelEditingMusic as any
													}
													onDeleteMusic={linkCardProps.onDeleteMusic as any}
													onMusicChange={linkCardProps.onMusicChange as any}
													onSaveEditingMusic={
														linkCardProps.onSaveEditingMusic as any
													}
													onStartEditingMusic={
														linkCardProps.onStartEditingMusic as any
													}
													onToggleActive={linkCardProps.onToggleActive as any}
													originalMusic={linkCardProps.originalMusic as any}
													setActivatorNodeRef={childSetRef}
												/>
											);
										}
                                        if ((child as any).isEvent) {
                                            return (
                                                <EventCard
                                                    event={child as any}
                                                    isDragging={false}
                                                    isTogglingActive={
                                                        linkCardProps.togglingEventId === child.id
                                                    }
                                                    listeners={childListeners}
                                                    onCancelEditingEvent={
                                                        linkCardProps.handleCancelEditingEvent as any
                                                    }
                                                    onDeleteEvent={linkCardProps.onDeleteEvent as any}
                                                    onSaveEditingEvent={
                                                        linkCardProps.handleSaveEditingEvent as any
                                                    }
                                                    onStartEditingEvent={
                                                        linkCardProps.onStartEditingEvent as any
                                                    }
                                                    onArchiveEvent={linkCardProps.onArchiveEvent as any}
                                                    onToggleActive={linkCardProps.onToggleActive as any}
                                                    originalEvent={linkCardProps.originalEvent as any}
                                                    setActivatorNodeRef={childSetRef}
                                                />
                                            );
                                        }
										return (
											<LinkCard
												archivingLinkId={linkCardProps.archivingLinkId as any}
												isTogglingActive={
													linkCardProps.togglingLinkId === child.id
												}
												link={child as any}
												listeners={childListeners}
												onRemoveCustomImage={
													linkCardProps.onRemoveCustomImage as any
												}
												onUpdateCustomImage={
													linkCardProps.onUpdateCustomImage as any
												}
												originalLink={linkCardProps.originalLink as any}
												setActivatorNodeRef={childSetRef}
												{...linkCardProps}
											/>
										);
									}}
								</SortableItem>
							);
						})}
					</div>
				</SortableContext>
			)}
		</section>
	);
};

export default SectionCard;

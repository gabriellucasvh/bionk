"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import type { DragEndEvent } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Session } from "next-auth";
import { useEffect, useMemo, useState } from "react";
import type { LinkItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import LinkCard from "./links.LinkCard";
import SortableItem from "./links.SortableItem";

type LinkFormData = {
	title: string;
	url: string;
	sectionTitle: string;
	badge: string;
	password?: string;
	expiresAt?: Date;
	deleteOnClicks?: number;
	launchesAt?: Date;
	isProduct: boolean;
	price?: number;
	productImageFile?: File;
};

const initialFormData: LinkFormData = {
	title: "",
	url: "",
	sectionTitle: "",
	badge: "",
	password: "",
	deleteOnClicks: undefined,
	expiresAt: undefined,
	launchesAt: undefined,
	isProduct: false,
	price: undefined,
	productImageFile: undefined,
};

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	mutateLinks: () => Promise<any>;
	session: Session | null;
}

const urlRegex = /^https?:\/\//;

const LinksTabContent = ({
	initialLinks,
	mutateLinks,
}: LinksTabContentProps) => {
	const [links, setLinks] = useState<LinkItem[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [formData, setFormData] = useState<LinkFormData>(initialFormData);

	useEffect(() => {
		const sorted = [...initialLinks].sort((a, b) => a.order - b.order);
		setLinks(sorted.map((link) => ({ ...link, isEditing: false })));
	}, [initialLinks]);

	const existingSections = useMemo(() => {
		const sections = new Set(
			initialLinks.map((link) => link.sectionTitle).filter(Boolean) as string[]
		);
		return Array.from(sections);
	}, [initialLinks]);

	const groupedLinks = useMemo(() => {
		return links.reduce(
			(acc, link) => {
				const section = link.sectionTitle || "Links Gerais";
				if (!acc[section]) {
					acc[section] = [];
				}
				acc[section].push(link);
				return acc;
			},
			{} as Record<string, LinkItem[]>
		);
	}, [links]);

	const handleClickLink = async (id: number) => {
		await fetch("/api/link-click", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ linkId: id }),
		});
		await mutateLinks();
	};

	const handleAddNewLink = async () => {
		let formattedUrl = formData.url.trim();
		if (!urlRegex.test(formattedUrl)) {
			formattedUrl = `https://${formattedUrl}`;
		}
		if (!isValidUrl(formattedUrl)) {
			return;
		}

		const res = await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: formData.title,
				url: formattedUrl,
				sectionTitle: formData.sectionTitle,
				badge: formData.badge,
				password: formData.password,
				expiresAt: formData.expiresAt?.toISOString(),
				launchesAt: formData.launchesAt?.toISOString(),
				deleteOnClicks: formData.deleteOnClicks,
				isProduct: formData.isProduct,
				price: formData.price
					? Number.parseFloat(String(formData.price))
					: null,
			}),
		});

		if (!res.ok) {
			return;
		}
		const newLink = await res.json();

		if (formData.productImageFile && newLink.id) {
			const imageFormData = new FormData();
			imageFormData.append("file", formData.productImageFile);
			await fetch(`/api/links/${newLink.id}/upload-product-image`, {
				method: "POST",
				body: imageFormData,
			});
		}

		await mutateLinks();
		setFormData(initialFormData);
		setIsAdding(false);
	};

	const handleLinkUpdate = async (id: number, payload: Partial<LinkItem>) => {
		await fetch(`/api/links/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		await mutateLinks();
	};

	const toggleActive = (id: number, isActive: boolean) => {
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, active: isActive } : link
			)
		);
		handleLinkUpdate(id, { active: isActive });
	};

	const toggleSensitive = (id: number) => {
		const linkToUpdate = links.find((l) => l.id === id);
		if (!linkToUpdate) {
			return;
		}
		const newSensitiveState = !linkToUpdate.sensitive;
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, sensitive: newSensitiveState } : link
			)
		);
		handleLinkUpdate(id, { sensitive: newSensitiveState });
	};

	const startEditing = (id: number) =>
		setLinks((prev) =>
			prev.map((link) => (link.id === id ? { ...link, isEditing: true } : link))
		);

	const cancelEditing = (id: number) => {
		const originalLink = initialLinks.find((l) => l.id === id);
		if (!originalLink) {return}; // Verificação de segurança adicionada
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...originalLink, isEditing: false } : link
			)
		);
	};

	const handleLinkChange = (
		id: number,
		field: "title" | "url",
		value: string
	) => {
		setLinks((prev) =>
			prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
		);
	};

	const saveEditing = async (id: number, title: string, url: string) => {
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, title, url, isEditing: false } : link
			)
		);
		await handleLinkUpdate(id, { title, url });
	};

	const handleDeleteLink = async (id: number) => {
		const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
		if (res.ok) {
			await mutateLinks();
		}
	};

	const handleArchiveLink = async (id: number) => {
		await handleLinkUpdate(id, { archived: true });
	};

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 250, tolerance: 5 },
		})
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = links.findIndex((l) => l.id === active.id);
			const newIndex = links.findIndex((l) => l.id === over?.id);
			if (oldIndex === -1 || newIndex === -1) {return};
			const newOrder = arrayMove(links, oldIndex, newIndex);
			setLinks(newOrder);
			await fetch("/api/links/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					order: newOrder.map((l) => l.id),
				}),
			});
			await mutateLinks();
		}
	};

	return (
		<div className="space-y-4">
			{!isAdding && (
				<BaseButton
					className="w-full sm:w-auto"
					onClick={() => setIsAdding(true)}
				>
					<span className="flex items-center justify-center">
						<Plus className="mr-1 h-4 w-4" /> Adicionar novo link
					</span>
				</BaseButton>
			)}

			{isAdding && (
				<AddNewLinkForm
					existingSections={existingSections}
					formData={formData}
					isSaveDisabled={
						!isValidUrl(formData.url) || formData.title.trim().length === 0
					}
					onCancel={() => setIsAdding(false)}
					onSave={handleAddNewLink}
					setFormData={setFormData}
				/>
			)}

			<div className="space-y-6 border-t pt-6">
				<DndContext
					collisionDetection={closestCenter}
					modifiers={[restrictToParentElement]}
					onDragEnd={handleDragEnd}
					sensors={sensors}
				>
					<SortableContext
						items={links.map((link) => link.id)}
						strategy={verticalListSortingStrategy}
					>
						{Object.keys(groupedLinks).length > 0
							? Object.entries(groupedLinks).map(
									([sectionTitle, sectionLinks]) => (
										<section className="space-y-4" key={sectionTitle}>
											<h2 className="font-bold text-foreground text-xl">
												{sectionTitle}
											</h2>
											{sectionLinks.map((link) => (
												<SortableItem id={link.id} key={link.id}>
													{({ listeners, setActivatorNodeRef }) => (
														<LinkCard
															link={link}
															listeners={listeners}
															onArchiveLink={handleArchiveLink}
															onCancelEditing={cancelEditing}
															onClickLink={handleClickLink}
															onDeleteLink={handleDeleteLink}
															onLinkChange={handleLinkChange}
															onSaveEditing={saveEditing}
															onStartEditing={startEditing}
															onToggleActive={toggleActive}
															onToggleSensitive={toggleSensitive}
															setActivatorNodeRef={setActivatorNodeRef}
														/>
													)}
												</SortableItem>
											))}
										</section>
									)
								)
							: !isAdding && (
									<p className="py-6 text-center text-muted-foreground">
										Você ainda não adicionou nenhum link. Clique em "Adicionar
										novo link" para começar.
									</p>
								)}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
};

export default LinksTabContent;

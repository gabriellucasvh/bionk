// app/dashboard/links/components/LinksTabContent.tsx

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
import { useEffect, useState } from "react";
// Ajuste os imports para a nova estrutura de pastas se necessário
import type { LinkItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import LinkCard from "./links.LinkCard";
import SortableItem from "./links.SortableItem";

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	mutateLinks: () => Promise<any>;
	session: Session | null;
}
const urlRegex = /^https?:\/\//;

const LinksTabContent = ({
	initialLinks,
	mutateLinks,
	session,
}: LinksTabContentProps) => {
	const [links, setLinks] = useState<LinkItem[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newUrl, setNewUrl] = useState("");

	useEffect(() => {
		const sorted = [...initialLinks].sort((a, b) => a.order - b.order);
		setLinks(sorted);
	}, [initialLinks]);

	const handleClickLink = async (id: number) => {
		await fetch("/api/link-click", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ linkId: id }),
		});
		await mutateLinks();
	};

	const handleAddNewLink = async () => {
		let formatted = newUrl.trim();

		if (!urlRegex.test(formatted)) {
			formatted = `https://${formatted}`;
		}

		if (!isValidUrl(formatted)) {
			return;
		}

		const res = await fetch("/api/links", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				userId: session?.user?.id,
				title: newTitle,
				url: formatted,
			}),
		});
		if (res.ok) {
			await mutateLinks();
			setNewTitle("");
			setNewUrl("");
			setIsAdding(false);
		}
	};

	const handleLinkUpdate = async (id: number, payload: object) => {
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

	const cancelEditing = (id: number) =>
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, isEditing: false } : link
			)
		);

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
			setLinks((prev) => prev.filter((link) => link.id !== id));
			await mutateLinks();
		}
	};

	const handleArchiveLink = async (id: number) => {
		setLinks((prev) => prev.filter((link) => link.id !== id));
		try {
			await fetch(`/api/links/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ archived: true }),
			});
		} finally {
			await mutateLinks();
		}
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
			const newOrder = arrayMove(links, oldIndex, newIndex);
			setLinks(newOrder);

			await fetch("/api/links/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: session?.user?.id,
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
						<Plus className="mr-1 h-4 w-4" />
						Adicionar novo link
					</span>
				</BaseButton>
			)}

			{isAdding && (
				<AddNewLinkForm
					isSaveDisabled={!isValidUrl(newUrl) || newTitle.trim().length === 0}
					newTitle={newTitle}
					newUrl={newUrl}
					onCancel={() => setIsAdding(false)}
					onNewTitleChange={setNewTitle}
					onNewUrlChange={setNewUrl}
					onSave={handleAddNewLink}
				/>
			)}

			<div className="space-y-4 border-t pt-4">
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
						{links.length > 0 ? (
							links.map((link) => (
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
							))
						) : (
							<p className="py-6 text-center text-muted-foreground">
								Você ainda não adicionou nenhum link. Clique em "Adicionar novo
								link" para começar.
							</p>
						)}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
};

export default LinksTabContent;

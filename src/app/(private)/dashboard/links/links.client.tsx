"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	PointerSensor,
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
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import LoadingPage from "@/components/layout/LoadingPage";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import AddNewLinkForm from "./links.AddNewLinkForm";
import { fetcher, isValidUrl } from "./links.helpers";
import LinkCard from "./links.LinkCard";
import SortableItem from "./links.SortableItem";
import type { LinkItem } from "./links.types";

const LinksClient = () => {
	const { data: session } = useSession();
	const [links, setLinks] = useState<LinkItem[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newUrl, setNewUrl] = useState("");
	const [isProfileLoading, setIsProfileLoading] = useState(true);

	const { data: swrData, mutate: mutateLinks } = useSWR<{ links: LinkItem[] }>(
		session?.user?.id ? `/api/links?userId=${session.user.id}` : null,
		fetcher,
	);

	useEffect(() => {
		if (swrData?.links) {
			const sorted = [...swrData.links].sort((a, b) => a.order - b.order);
			setLinks(sorted);
			setIsProfileLoading(false);
		}
	}, [swrData]);

	// --- Handlers de Interação com a API e Estado ---

	const handleClickLink = async (id: number) => {
		try {
			await fetch(`/api/link-click`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ linkId: id }),
			});
			mutateLinks();
		} catch (err) {
			console.error("Erro ao registrar clique:", err);
		}
	};

	const handleAddNewLink = async () => {
		let formatted = newUrl.trim();
		if (!/^https?:\/\//.test(formatted)) formatted = `https://${formatted}`;
		if (!isValidUrl(formatted)) return;

		const res = await fetch(`/api/links`, {
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
				link.id === id ? { ...link, active: isActive } : link,
			),
		);
		handleLinkUpdate(id, { active: isActive });
	};

	const toggleSensitive = (id: number) => {
		const linkToUpdate = links.find((l) => l.id === id);
		if (!linkToUpdate) return;
		const newSensitiveState = !linkToUpdate.sensitive;
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, sensitive: newSensitiveState } : link,
			),
		);
		handleLinkUpdate(id, { sensitive: newSensitiveState });
	};

	const startEditing = (id: number) =>
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, isEditing: true } : link,
			),
		);
	const cancelEditing = (id: number) =>
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, isEditing: false } : link,
			),
		);

	const handleLinkChange = (
		id: number,
		field: "title" | "url",
		value: string,
	) => {
		setLinks((prev) =>
			prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
		);
	};

	const saveEditing = async (id: number, title: string, url: string) => {
		setLinks((prev) =>
			prev.map((link) =>
				link.id === id ? { ...link, title, url, isEditing: false } : link,
			),
		);
		handleLinkUpdate(id, { title, url });
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
			const res = await fetch(`/api/links/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ archived: true }),
			});
			if (!res.ok)
				console.error("Falha ao arquivar o link, forçando revalidação...");
		} catch (error) {
			console.error("Erro ao arquivar o link:", error);
		} finally {
			await mutateLinks();
		}
	};

	// --- Drag and Drop ---

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = links.findIndex((l) => l.id === active.id);
			const newIndex = links.findIndex((l) => l.id === over?.id);
			const newOrder = arrayMove(links, oldIndex, newIndex);
			setLinks(newOrder);

			await fetch(`/api/links/reorder`, {
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

	if (isProfileLoading) return <LoadingPage />;

	return (
		<section className="w-full md:w-10/12 lg:w-7/12 p-2 sm:p-4 space-y-4">
			<header className="flex items-center justify-between">
				<h2 className="text-xl sm:text-2xl font-bold">Gerenciar links</h2>
			</header>

			{isAdding && (
				<AddNewLinkForm
					newTitle={newTitle}
					onNewTitleChange={setNewTitle}
					newUrl={newUrl}
					onNewUrlChange={setNewUrl}
					onSave={handleAddNewLink}
					onCancel={() => setIsAdding(false)}
					isSaveDisabled={!isValidUrl(newUrl) || newTitle.length === 0}
				/>
			)}

			<Card className="pb-14 md:pb-0">
				<CardHeader>
					<CardTitle className="text-lg sm:text-xl">Seus Links</CardTitle>
					<CardDescription className="text-sm">
						Gerencie, edite e organize seus links.
					</CardDescription>
					<Button
						onClick={() => setIsAdding(true)}
						className="w-full sm:w-auto"
					>
						<Plus className="mr-1 h-4 w-4" />
						Adicionar novo link
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-2 sm:p-6">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToParentElement]}
					>
						<SortableContext
							items={links.map((link) => link.id)}
							strategy={verticalListSortingStrategy}
						>
							{links.map((link) => (
								<SortableItem key={link.id} id={link.id}>
									{({ listeners }) => (
										<LinkCard
											link={link}
											listeners={listeners}
											onLinkChange={handleLinkChange}
											onSaveEditing={saveEditing}
											onCancelEditing={cancelEditing}
											onStartEditing={startEditing}
											onToggleActive={toggleActive}
											onToggleSensitive={toggleSensitive}
											onArchiveLink={handleArchiveLink}
											onDeleteLink={handleDeleteLink}
											onClickLink={handleClickLink}
										/>
									)}
								</SortableItem>
							))}
						</SortableContext>
					</DndContext>
				</CardContent>
			</Card>
		</section>
	);
};

export default LinksClient;

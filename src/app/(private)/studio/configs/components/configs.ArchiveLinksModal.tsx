// configs.ArchiveLinksModal.tsx
"use client";

import { RotateCcw, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LinkItem = {
	id: number;
	title: string;
	url: string;
	active: boolean;
	archived?: boolean;
};

type TextItem = {
	id: number;
	title: string;
	description: string;
	active: boolean;
	archived?: boolean;
};

interface ArchivedLinksModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ArchivedLinksModal = ({ isOpen, onClose }: ArchivedLinksModalProps) => {
	const { data: session } = useSession();
	const [archivedLinks, setArchivedLinks] = useState<LinkItem[]>([]);
	const [archivedTexts, setArchivedTexts] = useState<TextItem[]>([]);

	useEffect(() => {
		if (isOpen && session?.user?.id) {
			const fetchArchivedItems = async () => {
				const [linksRes, textsRes] = await Promise.all([
					fetch(`/api/links?userId=${session.user.id}&status=archived`),
					fetch(`/api/texts?userId=${session.user.id}&status=archived`),
				]);

				const linksData = await linksRes.json();
				const textsData = await textsRes.json();

				setArchivedLinks(linksData.links || []);
				setArchivedTexts(textsData.texts || []);
			};
			fetchArchivedItems();
		}
	}, [isOpen, session]);

	const restoreLink = async (id: number) => {
		const res = await fetch(`/api/links/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ archived: false, active: true }), // Reativa o link ao restaurar
		});
		if (res.ok) {
			setArchivedLinks(archivedLinks.filter((link) => link.id !== id));
		}
	};

	const restoreAllLinks = async () => {
		const promises = archivedLinks.map((link) =>
			fetch(`/api/links/${link.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ archived: false, active: true }),
			})
		);
		const results = await Promise.all(promises);
		if (results.every((res) => res.ok)) {
			setArchivedLinks([]);
		}
	};

	const restoreText = async (id: number) => {
		const res = await fetch(`/api/texts/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ archived: false, active: true }),
		});
		if (res.ok) {
			setArchivedTexts(archivedTexts.filter((text) => text.id !== id));
		}
	};

	const restoreAllTexts = async () => {
		const promises = archivedTexts.map((text) =>
			fetch(`/api/texts/${text.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ archived: false, active: true }),
			})
		);
		const results = await Promise.all(promises);
		if (results.every((res) => res.ok)) {
			setArchivedTexts([]);
		}
	};

	const deleteAllTexts = async () => {
		const promises = archivedTexts.map((text) =>
			fetch(`/api/texts/${text.id}`, {
				method: "DELETE",
			})
		);
		const results = await Promise.all(promises);
		if (results.every((res) => res.ok)) {
			setArchivedTexts([]);
		}
	};

	const restoreAllItems = async () => {
		await Promise.all([restoreAllLinks(), restoreAllTexts()]);
	};

	const deleteAllItems = async () => {
		await Promise.all([deleteAllLinks(), deleteAllTexts()]);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
			<section className="w-11/12 max-w-md rounded-lg bg-white shadow-lg dark:bg-neutral-800">
				<header className="flex items-center justify-between border-b px-4 py-2">
					<h2 className="font-bold text-xl">Itens Arquivados</h2>
					<Button
						className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-neutral-700"
						onClick={onClose}
						size="sm"
						variant="ghost"
					>
						<X className="h-4 w-4" />
					</Button>
				</header>
				<main className="max-h-80 space-y-4 overflow-y-auto p-4">
					{archivedLinks.length === 0 && archivedTexts.length === 0 ? (
						<p>Nenhum item arquivado.</p>
					) : (
						<div className="space-y-4">
							{archivedLinks.length > 0 && (
								<div>
									<h3 className="mb-2 font-medium text-muted-foreground text-sm">
										Links
									</h3>
									<ul className="space-y-2">
										{archivedLinks.map((link) => (
											<li
												className="flex items-center justify-between rounded border p-2"
												key={`link-${link.id}`}
											>
												<div className="overflow-hidden">
													<p className="truncate font-medium">{link.title}</p>
													<p className="truncate text-blue-500 text-sm">
														{link.url}
													</p>
												</div>
												<Button
													className="ml-4 flex-shrink-0 bg-green-500 hover:bg-green-600"
													onClick={() => restoreLink(link.id)}
												>
													Restaurar
												</Button>
											</li>
										))}
									</ul>
								</div>
							)}
							{archivedTexts.length > 0 && (
								<div>
									<h3 className="mb-2 font-medium text-muted-foreground text-sm">
										Textos
									</h3>
									<ul className="space-y-2">
										{archivedTexts.map((text) => (
											<li
												className="flex items-center justify-between rounded border p-2"
												key={`text-${text.id}`}
											>
												<div className="overflow-hidden">
													<p className="truncate font-medium">{text.title}</p>
													<p className="truncate text-muted-foreground text-sm">
														{text.description.length > 50
															? `${text.description.slice(0, 50)}...`
															: text.description}
													</p>
												</div>
												<Button
													className="ml-4 flex-shrink-0 bg-green-500 hover:bg-green-600"
													onClick={() => restoreText(text.id)}
												>
													Restaurar
												</Button>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</main>
				<footer className="flex justify-end border-t px-4 py-2">
					<div className="flex gap-2">
						<Button
							className=" text-green-600 hover:bg-green-100 hover:text-green-600"
							disabled={
								archivedLinks.length === 0 && archivedTexts.length === 0
							}
							onClick={restoreAllItems}
							variant="outline"
						>
							<RotateCcw />
							Todos
						</Button>
						<Button
							className="text-red-600 hover:bg-red-100 hover:text-red-600"
							disabled={
								archivedLinks.length === 0 && archivedTexts.length === 0
							}
							onClick={deleteAllItems}
							variant="outline"
						>
							<Trash2 /> Todos
						</Button>
					</div>
				</footer>
			</section>
		</div>
	);
};

export default ArchivedLinksModal;

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

interface ArchivedLinksModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ArchivedLinksModal = ({ isOpen, onClose }: ArchivedLinksModalProps) => {
	const { data: session } = useSession();
	const [archivedLinks, setArchivedLinks] = useState<LinkItem[]>([]);

	useEffect(() => {
		if (isOpen && session?.user?.id) {
			const fetchArchivedLinks = async () => {
				const res = await fetch(
					`/api/links?userId=${session.user.id}&status=archived`
				);
				const data = await res.json();
				setArchivedLinks(data.links || []);
			};
			fetchArchivedLinks();
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

	const deleteAllLinks = async () => {
		const promises = archivedLinks.map((link) =>
			fetch(`/api/links/${link.id}`, {
				method: "DELETE",
			})
		);
		const results = await Promise.all(promises);
		if (results.every((res) => res.ok)) {
			setArchivedLinks([]);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
			<section className="w-11/12 max-w-md rounded-lg bg-white shadow-lg dark:bg-neutral-800">
				<header className="flex items-center justify-between border-b px-4 py-2">
					<h2 className="font-bold text-xl">Links Arquivados</h2>
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
					{archivedLinks.length === 0 ? (
						<p>Nenhum link arquivado.</p>
					) : (
						<ul className="space-y-2">
							{archivedLinks.map((link) => (
								<li
									className="flex items-center justify-between rounded border p-2"
									key={link.id}
								>
									<div className="overflow-hidden">
										<p className="truncate font-medium">{link.title}</p>
										<p className="truncate text-blue-500 text-sm">{link.url}</p>
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
					)}
				</main>
				<footer className="flex justify-end border-t px-4 py-2">
					<div className="flex gap-2">
						<Button
							className=" text-green-600 hover:bg-green-100 hover:text-green-600"
							disabled={archivedLinks.length === 0}
							onClick={restoreAllLinks}
							variant="outline"
						>
							<RotateCcw />
							Todos
						</Button>
						<Button
							className="text-red-600 hover:bg-red-100 hover:text-red-600"
							disabled={archivedLinks.length === 0}
							onClick={deleteAllLinks}
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

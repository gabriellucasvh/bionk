// configs.ArchiveLinksModal.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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
			<section className="w-11/12 max-w-md rounded-lg bg-white shadow-lg">
				<header className="border-b px-4 py-2">
					<h2 className="font-bold text-xl">Links Arquivados</h2>
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
							variant="outline"
							className="bg-green-500 text-white hover:text-white hover:bg-green-600"
							onClick={restoreAllLinks}
							disabled={archivedLinks.length === 0}
						>
							Rest. Todos
						</Button>
						<Button
							variant="outline"
							className="bg-red-500 text-white hover:text-white hover:bg-red-600"
							onClick={deleteAllLinks}
							disabled={archivedLinks.length === 0}
						>
							Apagar Todos
						</Button>
					<Button onClick={onClose}>Fechar</Button>
					</div>
				</footer>
			</section>
		</div>
	);
};

export default ArchivedLinksModal;

"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

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

export default function ArchivedItemsPage() {
	const { data: session } = useSession();
	const [archivedLinks, setArchivedLinks] = useState<LinkItem[]>([]);
	const [archivedTexts, setArchivedTexts] = useState<TextItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchArchivedItems = async () => {
			if (!session?.user?.id) {
				return;
			}
			const [linksRes, textsRes] = await Promise.all([
				fetch("/api/links?status=archived"),
				fetch("/api/texts?status=archived"),
			]);
			const linksData = await linksRes.json();
			const textsData = await textsRes.json();
			setArchivedLinks(linksData.links || []);
			setArchivedTexts(textsData.texts || []);
			setIsLoading(false);
		};
		fetchArchivedItems();
	}, [session]);

	const restoreLink = async (id: number) => {
		const res = await fetch(`/api/links/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ archived: false, active: true }),
		});
		if (!res.ok) {
			return;
		}
		setArchivedLinks((prev) => prev.filter((link) => link.id !== id));
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
		if (!results.every((r) => r.ok)) {
			return;
		}
		setArchivedLinks([]);
	};

	const restoreText = async (id: number) => {
		const res = await fetch(`/api/texts/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ archived: false, active: true }),
		});
		if (!res.ok) {
			return;
		}
		setArchivedTexts((prev) => prev.filter((text) => text.id !== id));
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
		if (!results.every((r) => r.ok)) {
			return;
		}
		setArchivedTexts([]);
	};

	const deleteAllTexts = async () => {
		const promises = archivedTexts.map((text) =>
			fetch(`/api/texts/${text.id}`, { method: "DELETE" })
		);
		const results = await Promise.all(promises);
		if (!results.every((r) => r.ok)) {
			return;
		}
		setArchivedTexts([]);
	};

	const deleteAllLinks = async () => {
		const promises = archivedLinks.map((link) =>
			fetch(`/api/links/${link.id}`, { method: "DELETE" })
		);
		const results = await Promise.all(promises);
		if (!results.every((r) => r.ok)) {
			return;
		}
		setArchivedLinks([]);
	};

	const restoreAllItems = async () => {
		await Promise.all([restoreAllLinks(), restoreAllTexts()]);
	};

	const deleteAllItems = async () => {
		await Promise.all([deleteAllLinks(), deleteAllTexts()]);
	};

	if (isLoading) {
		return (
			<main className="h-full w-full bg-zinc-100 dark:bg-zinc-800">
				<div className="container mx-auto max-w-4xl p-3 sm:p-6">
					<h1 className="font-bold text-xl sm:text-2xl lg:text-3xl dark:text-white">
						Itens Arquivados
					</h1>
				</div>
			</main>
		);
	}

	return (
		<main className="h-full w-full bg-zinc-100 dark:bg-zinc-800">
			<div className="container mx-auto max-w-4xl space-y-4 p-3 pb-24 sm:space-y-6 sm:p-6 sm:pb-8 lg:space-y-8 dark:text-white">
				<header className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-xl sm:text-2xl lg:text-3xl dark:text-white">
							Itens Arquivados
						</h1>
						<p className="text-muted-foreground text-xs sm:text-sm lg:text-base dark:text-zinc-400">
							Visualize e restaure itens arquivados
						</p>
					</div>
					<Link className="flex items-center" href="/studio/configs">
						<ChevronLeft className="mr-2 h-4 w-4" />
						Voltar
					</Link>
				</header>

				{archivedLinks.length === 0 && archivedTexts.length === 0 ? (
					<p className="text-muted-foreground dark:text-zinc-400">
						Nenhum item arquivado.
					</p>
				) : (
					<div className="space-y-6">
						{archivedLinks.length > 0 ? (
							<section className="space-y-3">
								<h2 className="font-semibold text-lg dark:text-white">Links</h2>
								<ul className="space-y-2">
									{archivedLinks.map((link) => (
										<li
											className="flex items-center justify-between rounded-3xl border bg-white p-4 dark:border-zinc-700"
											key={`link-${link.id}`}
										>
											<div className="overflow-hidden">
												<p className="truncate font-medium">{link.title}</p>
												<p className="truncate text-blue-500 text-sm">
													{link.url}
												</p>
											</div>
											<BaseButton
												className="ml-4 flex-shrink-0 bg-green-500 hover:bg-green-600"
												onClick={() => restoreLink(link.id)}
											>
												Restaurar
											</BaseButton>
										</li>
									))}
								</ul>
							</section>
						) : null}

						{archivedTexts.length > 0 ? (
							<section className="space-y-3">
								<h2 className="font-semibold text-lg dark:text-white">
									Textos
								</h2>
								<ul className="space-y-2">
									{archivedTexts.map((text) => (
										<li
											className="flex items-center justify-between rounded border p-2 dark:border-zinc-700"
											key={`text-${text.id}`}
										>
											<div className="overflow-hidden">
												<p className="truncate font-medium">{text.title}</p>
												<p className="truncate text-muted-foreground text-sm dark:text-zinc-400">
													{text.description.length > 50
														? `${text.description.slice(0, 50)}...`
														: text.description}
												</p>
											</div>
											<BaseButton
												className="ml-4 flex-shrink-0 bg-green-500 hover:bg-green-600"
												onClick={() => restoreText(text.id)}
											>
												Restaurar
											</BaseButton>
										</li>
									))}
								</ul>
							</section>
						) : null}

						<div className="flex justify-end gap-2">
							<BaseButton
								disabled={
									archivedLinks.length === 0 && archivedTexts.length === 0
								}
								onClick={restoreAllItems}
								variant="white"
							>
								Restaurar Todos
							</BaseButton>
							<BaseButton
								disabled={
									archivedLinks.length === 0 && archivedTexts.length === 0
								}
								onClick={deleteAllItems}
							>
								Apagar Todos
							</BaseButton>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

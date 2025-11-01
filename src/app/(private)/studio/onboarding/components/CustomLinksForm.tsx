"use client";

import { ALargeSmall, Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REJEX_URL = /^https?:\/\//i;

export default function CustomLinksForm({
	value,
	onChange,
}: {
	value: { title: string; url: string }[];
	onChange: (v: { title: string; url: string }[]) => void;
}) {
	const [title, setTitle] = useState<string>("");
	const [url, setUrl] = useState<string>("");
	const [editedIndex, setEditedIndex] = useState<number | null>(null);
	const [editedTitle, setEditedTitle] = useState<string>("");
	const [editedUrl, setEditedUrl] = useState<string>("");

	const addLink = () => {
		const t = title.trim();
		let u = url.trim();
		if (!(t && u)) {
			return;
		}
		if (t.length > 80) {
			return;
		}
		if (!REJEX_URL.test(u)) {
			u = `https://${u}`;
		}
		const next = [...value, { title: t, url: u }];
		onChange(next);
		setTitle("");
		setUrl("");
	};

	const startEditing = (idx: number, v: { title: string; url: string }) => {
		setEditedIndex(idx);
		setEditedTitle(v.title);
		setEditedUrl(v.url);
	};

	const cancelEdited = () => {
		setEditedIndex(null);
		setEditedTitle("");
		setEditedUrl("");
	};

	const saveEdited = () => {
		if (editedIndex === null) {
			return;
		}
		const t = editedTitle.trim();
		let u = editedUrl.trim();
		if (!(t && u)) {
			return;
		}
		if (t.length > 80) {
			return;
		}
		if (!REJEX_URL.test(u)) {
			u = `https://${u}`;
		}
		const next = value.map((item, i) =>
			i === editedIndex ? { title: t, url: u } : item
		);
		onChange(next);
		cancelEdited();
	};

	return (
		<div className="space-y-2">
			<Label>Adicionar links</Label>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<div className="mb-2 space-y-1">
					<Input
						maxLength={80}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Título"
						value={title}
					/>
				</div>
				<Input
					onChange={(e) => setUrl(e.target.value)}
					placeholder="URL"
					value={url}
				/>
			</div>
			<BaseButton
				disabled={!(title.trim() && url.trim())}
				onClick={addLink}
			>
				Adicionar
			</BaseButton>
			{value.length > 0 && (
				<ul className="mt-2 space-y-1">
					{value.map((v, idx) => (
						<li
							className="flex items-center justify-between rounded border p-2"
							key={`${v.title}-${idx}`}
						>
							<div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row">
								<div className="flex items-center gap-3">
									<ALargeSmall className="h-4 w-4" />
									<Input
										className="w-[220px] overflow-hidden truncate text-ellipsis whitespace-nowrap rounded-full bg-gray-200 px-4 py-2 text-gray-800 text-sm sm:w-[220px] md:w-[300px] dark:bg-gray-800 dark:text-gray-200"
										id={`title-pill-${idx}`}
										maxLength={80}
										onChange={(e) => {
											if (editedIndex !== idx) {
												startEditing(idx, v);
											}
											setEditedTitle(e.target.value);
										}}
										onFocus={() => startEditing(idx, v)}
										placeholder="Título"
										value={editedIndex === idx ? editedTitle : v.title}
									/>
								</div>
								<div className="flex items-center gap-3">
									<Link2 className="h-4 w-4" />
									<Input
										className="w-[220px] overflow-hidden truncate text-ellipsis whitespace-nowrap rounded-full bg-gray-200 px-4 py-2 text-gray-800 text-sm sm:w-[220px] md:w-[300px] dark:bg-gray-800 dark:text-gray-200"
										id={`url-pill-${idx}`}
										onChange={(e) => {
											if (editedIndex !== idx) {
												startEditing(idx, v);
											}
											setEditedUrl(e.target.value);
										}}
										onFocus={() => startEditing(idx, v)}
										placeholder="URL"
										type="url"
										value={editedIndex === idx ? editedUrl : v.url}
									/>
								</div>
								{editedIndex === idx &&
									(editedTitle !== v.title || editedUrl !== v.url) && (
										<div className="mt-2 flex w-full justify-end gap-2">
											<BaseButton onClick={cancelEdited} variant="white">
												Cancelar
											</BaseButton>
											<BaseButton onClick={saveEdited}>Salvar</BaseButton>
										</div>
									)}
							</div>
							<div className="flex flex-shrink-0 items-center gap-2">
								<button
									className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
									onClick={() => onChange(value.filter((_, i) => i !== idx))}
									title="Remover"
									type="button"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

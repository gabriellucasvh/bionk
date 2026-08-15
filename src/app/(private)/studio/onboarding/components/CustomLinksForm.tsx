"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CustomLinksForm({
	value,
	onChange,
}: {
	value: { title: string; url: string }[];
	onChange: (v: { title: string; url: string }[]) => void;
}) {
	// Garante que existam exatamente 3 campos
	const links = [
		value[0] || { title: "", url: "" },
		value[1] || { title: "", url: "" },
		value[2] || { title: "", url: "" },
	];

	const handleChange = (index: number, field: "title" | "url", val: string) => {
		const next = [...links];
		next[index] = { ...next[index], [field]: val };
		onChange(next);
	};

	return (
		<div className="space-y-4">
			<Label>Adicionar links</Label>
			<div className="grid gap-3">
				{links.map((link, idx) => (
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2" key={idx}>
					<Input
						maxLength={80}
						onChange={(e) => handleChange(idx, "title", e.target.value)}
						placeholder={`Título do link ${idx + 1}`}
						value={link.title}
					/>
					<Input
						onChange={(e) => handleChange(idx, "url", e.target.value)}
						placeholder="URL (ex: https://site.com)"
						value={link.url}
					/>
				</div>
			))}
			</div>
		</div>
	);
}

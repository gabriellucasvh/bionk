"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ContentFormData } from "../../../types/content.types";

interface TextFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const TextForm = ({ formData, setFormData }: TextFormProps) => {
	const formatOptions = [
		{
			value: "plain",
			label: "Texto Simples",
			description: "Texto sem formatação",
		},
		{
			value: "markdown",
			label: "Markdown",
			description: "Suporte a **negrito**, *itálico*, etc.",
		},
		{
			value: "rich",
			label: "Texto Rico",
			description: "Editor visual completo",
		},
	] as const;

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-3">
					<Label>Tipo de Formatação</Label>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{formatOptions.map(({ value, label, description }) => (
							<button
								className={cn(
									"rounded-lg border-2 p-4 text-left transition-all",
									formData.textFormatting === value
										? "border-green-500 bg-green-50 dark:bg-green-950/20"
										: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
								)}
								key={value}
								onClick={() =>
									setFormData({ ...formData, textFormatting: value })
								}
								type="button"
							>
								<div className="mb-1 font-medium text-sm">{label}</div>
								<div className="text-muted-foreground text-xs">
									{description}
								</div>
							</button>
						))}
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="textContent">Conteúdo</Label>
					<Textarea
						autoFocus
						id="textContent"
						onChange={(e) =>
							setFormData({ ...formData, textContent: e.target.value })
						}
						placeholder="Digite seu texto aqui..."
						rows={10}
						value={formData.textContent || ""}
					/>
					{formData.textFormatting === "markdown" && (
						<p className="text-muted-foreground text-xs">
							Suporte a Markdown: **negrito**, *itálico*, [links](url), #
							títulos
						</p>
					)}
				</div>
			</div>

			<div className="rounded-lg border border-gray-300 border-dashed p-6 text-center dark:border-gray-600">
				<div className="text-muted-foreground text-sm">
					<p className="mb-2">
						✍️ <strong>Dica:</strong>
					</p>
					<p>
						Use blocos de texto para compartilhar informações, histórias ou
						qualquer conteúdo textual.
					</p>
				</div>
			</div>
		</div>
	);
};

export default TextForm;

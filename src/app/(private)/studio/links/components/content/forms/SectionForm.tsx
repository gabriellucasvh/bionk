"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentFormData } from "../../../types/content.types";

interface SectionFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const SectionForm = ({ formData, setFormData }: SectionFormProps) => {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="sectionTitle">Título da Seção</Label>
					<Input
						autoFocus
						id="sectionTitle"
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						placeholder="Ex: Redes Sociais, Projetos, Contato"
						value={formData.title || ""}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="sectionDescription">Descrição (Opcional)</Label>
					<Textarea
						id="sectionDescription"
						onChange={(e) =>
							setFormData({ ...formData, textContent: e.target.value })
						}
						placeholder="Descreva brevemente o conteúdo desta seção"
						rows={3}
						value={formData.textContent || ""}
					/>
				</div>
			</div>

			<div className="rounded-lg border border-gray-300 border-dashed p-6 text-center dark:border-gray-600">
				<div className="text-muted-foreground text-sm">
					<p className="mb-2">
						💡 <strong>Dica:</strong>
					</p>
					<p>
						As seções ajudam a organizar seus links em categorias. Após criar a
						seção, você poderá adicionar links diretamente a ela.
					</p>
				</div>
			</div>
		</div>
	);
};

export default SectionForm;

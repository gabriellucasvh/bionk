"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Tipos e Interfaces
type SectionFormData = {
	title: string;
};

import type { SectionItem } from "../types/links.types";

interface AddNewSectionFormProps {
	formData: SectionFormData;
	setFormData: (data: SectionFormData) => void;
	onSave: () => void;
	isSaveDisabled: boolean;
	existingSections: SectionItem[];
}

// --- Componente Principal ---
const AddNewSectionForm = ({
	formData,
	setFormData,
	onSave,
	isSaveDisabled,
}: AddNewSectionFormProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
			{/* Campo Principal */}
			<div className="grid gap-2">
				<Label htmlFor="sectionTitleInput">Título da Seção</Label>
				<Input
					autoFocus
					id="sectionTitleInput"
					onChange={(e) => setFormData({ ...formData, title: e.target.value })}
					placeholder="Ex: Redes Sociais, Projetos, Contato"
					value={formData.title}
				/>
			</div>

			{/* Botões de Ação */}
			<div className="flex gap-2 border-t pt-4">
				<BaseButton
					className="flex-1"
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Criar Seção
				</BaseButton>
			</div>
		</section>
	);
};

export default AddNewSectionForm;

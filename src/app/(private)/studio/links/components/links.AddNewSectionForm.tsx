"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Tipos e Interfaces
type SectionFormData = {
	title: string;
};

interface AddNewSectionFormProps {
	formData: SectionFormData;
	setFormData: (data: SectionFormData) => void;
	onSave: () => void;
	onCancel: () => void;
	isSaveDisabled: boolean;
	existingSections: string[];
}

// --- Componente Principal ---
const AddNewSectionForm = ({
	formData,
	setFormData,
	onSave,
	onCancel,
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
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Criar Seção
				</BaseButton>
				<BaseButton onClick={onCancel} variant="white">
					Cancelar
				</BaseButton>
			</div>
		</section>
	);
};

export default AddNewSectionForm;

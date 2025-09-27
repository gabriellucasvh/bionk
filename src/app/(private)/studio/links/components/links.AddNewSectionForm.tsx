"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Tipos e Interfaces
type SectionFormData = {
	title: string;
};

interface AddNewSectionFormProps {
	formData: SectionFormData;
	setFormData: (data: SectionFormData) => void;
	onSave: () => void;
	isSaveDisabled: boolean;
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
		<div className="flex h-full flex-col space-y-4">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<section className="space-y-3 rounded-lg border bg-muted/20 p-4">
					{/* Campo Principal */}
					<div className="grid gap-2">
						<Label htmlFor="sectionTitleInput">Título da Seção</Label>
						<Input
							autoFocus
							id="sectionTitleInput"
							maxLength={60}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="Ex: Redes Sociais, Projetos, Contato"
							value={formData.title}
						/>
						<p className="text-muted-foreground text-xs">
							{formData.title.length}/60 caracteres
						</p>
					</div>
				</section>
			</div>

			{/* Botão de Ação Fixo */}
			<div className="flex-shrink-0 border-t pt-3">
				<BaseButton
					className="w-full"
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Criar Seção
				</BaseButton>
			</div>
		</div>
	);
};

export default AddNewSectionForm;

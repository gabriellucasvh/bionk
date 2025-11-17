"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionFormData = {
    title: string;
};

interface AddNewSectionFormProps {
	formData: SectionFormData;
	setFormData: (data: SectionFormData) => void;
	onSave: () => void;
	onCancel?: () => void;
	isSaveDisabled: boolean;
}

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
		<div className="flex flex-col gap-3 rounded-3xl border-2 bg-white p-3 sm:p-4 dark:bg-zinc-900">
			<div className="flex-1 space-y-3 overflow-y-auto">
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
			</div>
			<div className="flex-shrink-0 border-t pt-3">
				<div className="flex items-center justify-end gap-3">
					<BaseButton
						className="px-4"
						onClick={onCancel}
						type="button"
						variant="white"
					>
						Cancelar
					</BaseButton>
					<BaseButton
						className="px-4"
						disabled={isSaveDisabled}
						loading={isLoading}
						onClick={handleSave}
						type="button"
					>
						Salvar
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default AddNewSectionForm;

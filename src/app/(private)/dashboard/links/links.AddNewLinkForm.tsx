"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

interface AddNewLinkFormProps {
	newTitle: string;
	onNewTitleChange: (title: string) => void;
	newUrl: string;
	onNewUrlChange: (url: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isSaveDisabled: boolean;
}

const AddNewLinkForm = ({
	newTitle,
	onNewTitleChange,
	newUrl,
	onNewUrlChange,
	onSave,
	onCancel,
	isSaveDisabled,
}: AddNewLinkFormProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave();
		} catch (error) {
			console.error("Error saving link:", error);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<section className="p-2 sm:p-4 border rounded-lg space-y-4">
			<div>
				<label htmlFor="titulo" className="block mb-1 font-medium">
					Título
				</label>
				<input
					type="text"
					placeholder="Título do link"
					className="w-full border rounded px-3 py-2"
					value={newTitle}
					onChange={(e) => onNewTitleChange(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="url" className="block mb-1 font-medium">
					URL
				</label>
				<input
					type="url"
					placeholder="https://exemplo.com"
					className="w-full border rounded px-3 py-2"
					value={newUrl}
					onChange={(e) => onNewUrlChange(e.target.value)}
				/>
			</div>
			<div className="flex gap-2">
				<BaseButton
					onClick={handleSave}
					disabled={isSaveDisabled}
					loading={isLoading}
				>
					Salvar
				</BaseButton>
				<BaseButton variant="white" onClick={onCancel}>
					Cancelar
				</BaseButton>
			</div>
		</section>
	);
};

export default AddNewLinkForm;

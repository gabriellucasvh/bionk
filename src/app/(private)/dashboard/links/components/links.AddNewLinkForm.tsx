"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { useState } from "react";

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
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<section className="space-y-4 rounded-lg border p-2 sm:p-4">
			<div>
				<label className="mb-1 block font-medium" htmlFor="titulo">
					Título
				</label>
				<input
					className="w-full rounded border px-3 py-2"
					onChange={(e) => onNewTitleChange(e.target.value)}
					placeholder="Título do link"
					type="text"
					value={newTitle}
				/>
			</div>
			<div>
				<label className="mb-1 block font-medium" htmlFor="url">
					URL
				</label>
				<input
					className="w-full rounded border px-3 py-2"
					onChange={(e) => onNewUrlChange(e.target.value)}
					placeholder="https://exemplo.com"
					type="url"
					value={newUrl}
				/>
			</div>
			<div className="flex gap-2">
				<BaseButton
					disabled={isSaveDisabled}
					loading={isLoading}
					onClick={handleSave}
				>
					Salvar
				</BaseButton>
				<BaseButton onClick={onCancel} variant="white">
					Cancelar
				</BaseButton>
			</div>
		</section>
	);
};

export default AddNewLinkForm;

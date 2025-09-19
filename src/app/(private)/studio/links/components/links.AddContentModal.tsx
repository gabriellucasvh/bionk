"use client";

import { Layers2, Plus } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import AddNewSectionForm from "./links.AddNewSectionForm";

interface AddContentModalProps {
	isAdding: boolean;
	isAddingSection: boolean;
	formData: any;
	sectionFormData: any;
	existingSections: string[];
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setFormData: (data: any) => void;
	setSectionFormData: (data: any) => void;
	handleAddNewLink: () => void;
	handleAddNewSection: () => void;
}

const AddContentModal = ({
	isAdding,
	isAddingSection,
	formData,
	sectionFormData,
	existingSections,
	setIsAdding,
	setIsAddingSection,
	setFormData,
	setSectionFormData,
	handleAddNewLink,
	handleAddNewSection,
}: AddContentModalProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState<
		"link" | "section" | null
	>(null);

	const handleOptionSelect = (option: "link" | "section") => {
		setSelectedOption(option);
		if (option === "link") {
			setIsAdding(true);
		} else {
			setIsAddingSection(true);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setSelectedOption(null);
		setIsAdding(false);
		setIsAddingSection(false);
	};

	const handleCancel = () => {
		setSelectedOption(null);
		setIsAdding(false);
		setIsAddingSection(false);
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				<BaseButton
					className="w-full sm:w-auto"
					onClick={() => setIsOpen(true)}
				>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Conteúdo
				</BaseButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Adicionar Conteúdo</DialogTitle>
				</DialogHeader>

				{!selectedOption && (
					<div className="space-y-6 py-4">
						<p className="text-center text-muted-foreground text-sm">
							Escolha o tipo de conteúdo que deseja adicionar:
						</p>

						<div className="flex justify-center gap-8">
							<button
								className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
								onClick={() => handleOptionSelect("link")}
								type="button"
							>
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-black">
									<Plus className="h-8 w-8" strokeWidth={1.5} />
								</div>
								<span className="font-medium text-sm">Adicionar Link</span>
							</button>

							<button
								className="flex flex-col items-center space-y-3 rounded-lg p-4 transition-colors hover:bg-muted/50"
								onClick={() => handleOptionSelect("section")}
								type="button"
							>
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
									<Layers2 className="h-8 w-8" strokeWidth={1.5} />
								</div>
								<span className="font-medium text-sm">Criar Seção</span>
							</button>
						</div>
					</div>
				)}

				{selectedOption === "link" && isAdding && (
					<div className="space-y-4">
						<AddNewLinkForm
							existingSections={existingSections}
							formData={formData}
							isSaveDisabled={
								!isValidUrl(formData.url) || formData.title.trim().length === 0
							}
							onCancel={handleCancel}
							onSave={() => {
								handleAddNewLink();
								handleClose();
							}}
							setFormData={setFormData}
						/>
					</div>
				)}

				{selectedOption === "section" && isAddingSection && (
					<div className="space-y-4">
						<AddNewSectionForm
							existingSections={existingSections}
							formData={sectionFormData}
							isSaveDisabled={sectionFormData.title.trim().length === 0}
							onCancel={handleCancel}
							onSave={() => {
								handleAddNewSection();
								handleClose();
							}}
							setFormData={setSectionFormData}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default AddContentModal;

"use client";

import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ContentFormData, ContentType } from "../../types/content.types";
import { getDefaultFormData } from "../../utils/content.helpers";
import ContentForm from "./ContentForm";
import ContentSelector from "./content-selector";

interface AddContentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: ContentFormData) => void;
}

const AddContentModal = ({ isOpen, onClose, onSave }: AddContentModalProps) => {
	const [step, setStep] = useState<"select" | "form">("select");
	const [selectedType, setSelectedType] = useState<ContentType | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [formData, setFormData] = useState<ContentFormData>(
		getDefaultFormData()
	);

	const handleTypeSelect = (type: ContentType) => {
		setSelectedType(type);
		setFormData(getDefaultFormData(type));
		setStep("form");
	};

	const handleBack = () => {
		setStep("select");
		setSelectedType(null);
	};

	const handleSave = () => {
		setIsLoading(true);
		try {
			onSave(formData);
			handleClose();
		} finally {
			setIsLoading(false);
		}
	};

	const handleUrlDetected = (url: string) => {
		setSelectedType("link");
		setFormData({ ...getDefaultFormData("link"), url });
		setStep("form");
	};

	const handleClose = () => {
		setStep("select");
		setSelectedType(null);
		setSearchQuery("");
		setFormData(getDefaultFormData());
		onClose();
	};

	const getModalTitle = () => {
		if (step === "select") {
			return "Adicionar Conteúdo";
		}

		const typeLabels: Record<ContentType, string> = {
			link: "Adicionar Link",
			section: "Adicionar Seção",
			image: "Adicionar Imagem",
			video: "Adicionar Vídeo",
			music: "Adicionar Música",
			text: "Adicionar Texto",
			"social-feed": "Adicionar Feed Social",
			"contact-form": "Adicionar Formulário",
			integration: "Adicionar Integração",
		};

		return selectedType ? typeLabels[selectedType] : "Adicionar Conteúdo";
	};

	return (
		<Dialog onOpenChange={handleClose} open={isOpen}>
			<DialogContent
				className={cn(
					"flex max-h-[90vh] max-w-4xl flex-col overflow-hidden lg:max-w-[900px]",
					step === "select" ? "w-full" : "w-full"
				)}
			>
				<DialogHeader className="flex-shrink-0 border-b pb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{step === "form" && (
								<Button
									className="p-2"
									onClick={handleBack}
									size="sm"
									variant="ghost"
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							)}
							<DialogTitle className="font-semibold text-xl">
								{getModalTitle()}
							</DialogTitle>
						</div>
						<Button
							className="p-2"
							onClick={handleClose}
							size="sm"
							variant="ghost"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					{step === "select" ? (
						<ContentSelector
							onTypeSelect={handleTypeSelect}
							onUrlDetected={handleUrlDetected}
							searchQuery={searchQuery}
						/>
					) : (
						selectedType && (
							<ContentForm
								existingSections={[]}
								formData={formData}
								isLoading={isLoading}
								onBack={handleBack}
								onSave={handleSave}
								setFormData={setFormData}
								type={selectedType}
							/>
						)
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AddContentModal;

"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentFormData, ContentType } from "../../types/content.types";
import { validateFormData } from "../../utils/content.helpers";
import {
	ContactFormForm,
	ImageForm,
	IntegrationForm,
	LinkForm,
	MusicForm,
	SectionForm,
	SocialFeedForm,
	TextForm,
	VideoForm,
} from "./forms";

interface ContentFormProps {
	type: ContentType;
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
	existingSections: string[];
	onBack: () => void;
	onSave: () => void;
	isLoading: boolean;
}

const ContentForm = ({
	type,
	formData,
	setFormData,
	existingSections,
	onBack,
	onSave,
	isLoading,
}: ContentFormProps) => {
	const isValid = validateFormData(type, formData);

	const renderForm = () => {
		switch (type) {
			case "link":
				return (
					<LinkForm
						existingSections={existingSections}
						formData={formData}
						setFormData={setFormData}
					/>
				);
			case "section":
				return <SectionForm formData={formData} setFormData={setFormData} />;
			case "image":
				return <ImageForm formData={formData} setFormData={setFormData} />;
			case "video":
				return <VideoForm formData={formData} setFormData={setFormData} />;
			case "music":
				return <MusicForm formData={formData} setFormData={setFormData} />;
			case "text":
				return <TextForm formData={formData} setFormData={setFormData} />;
			case "social-feed":
				return <SocialFeedForm formData={formData} setFormData={setFormData} />;
			case "contact-form":
				return (
					<ContactFormForm formData={formData} setFormData={setFormData} />
				);
			case "integration":
				return (
					<IntegrationForm formData={formData} setFormData={setFormData} />
				);
			default:
				return <div>Tipo de conteúdo não suportado</div>;
		}
	};

	return (
		<div className="flex h-full flex-col">
			{/* Form Content */}
			<div className="flex-1 overflow-y-auto p-6">{renderForm()}</div>

			{/* Footer Actions */}
			<div className="border-t bg-gray-50 px-6 py-4 dark:bg-gray-800/50">
				<div className="flex items-center justify-between">
					<Button
						className="flex items-center gap-2"
						onClick={onBack}
						variant="ghost"
					>
						<ArrowLeft className="h-4 w-4" />
						Voltar
					</Button>

					<div className="flex items-center gap-3">
						<Button onClick={onBack} variant="outline">
							Cancelar
						</Button>
						<Button
							className="min-w-[100px]"
							disabled={!isValid || isLoading}
							onClick={onSave}
						>
							{isLoading ? "Salvando..." : "Salvar"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContentForm;

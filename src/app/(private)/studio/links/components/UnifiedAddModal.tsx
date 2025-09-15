"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ContentFormData, ContentType } from "../types/content.types";
import ContentForm from "./content/ContentForm";
import ContentSelector from "./content/content-selector";

interface UnifiedAddModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (type: ContentType, data: ContentFormData) => Promise<void>;
	existingSections?: string[];
}

type ModalStep = "selector" | "form";

const UnifiedAddModal = ({
	isOpen,
	onClose,
	onSave,
	existingSections = [],
}: UnifiedAddModalProps) => {
	const [currentStep, setCurrentStep] = useState<ModalStep>("selector");
	const [selectedType, setSelectedType] = useState<ContentType | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [formData, setFormData] = useState<ContentFormData>({});
	const [isLoading, setIsLoading] = useState(false);

	const handleClose = () => {
		setCurrentStep("selector");
		setSelectedType(null);
		setSearchQuery("");
		setFormData({});
		onClose();
	};

	const handleTypeSelect = (type: ContentType) => {
		setSelectedType(type);
		setCurrentStep("form");
		// Initialize form data based on type
		setFormData(getInitialFormData(type));
	};

	const handleBack = () => {
		setCurrentStep("selector");
		setSelectedType(null);
		setFormData({});
	};

	const handleSave = async () => {
		if (!selectedType) {
			return;
		}

		setIsLoading(true);
		try {
			await onSave(selectedType, formData);
			handleClose();
		} catch (error) {
			console.error("Error saving content:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getInitialFormData = (type: ContentType): ContentFormData => {
		switch (type) {
			case "link":
				return { title: "", url: "", badge: "" };
			case "section":
				return { title: "" };
			case "image":
				return { imageType: "individual", images: [], imageUrls: [] };
			case "video":
				return { videoUrl: "", videoTitle: "" };
			case "music":
				return { musicPlatform: "spotify", musicUrl: "", musicTitle: "" };
			case "text":
				return { textContent: "", textFormatting: "plain" };
			case "social-feed":
				return {
					socialPlatform: "instagram",
					socialUsername: "",
					feedLimit: 6,
				};
			case "contact-form":
				return { formTitle: "", formFields: [] };
			case "integration":
				return { integrationType: "custom", integrationConfig: {} };
			default:
				return {};
		}
	};

	return (
		<Dialog onOpenChange={handleClose} open={isOpen}>
			<DialogContent className="max-h-[90vh] max-w-7xl overflow-hidden p-0 lg:max-h-[85vh]">
				<DialogHeader className="border-b px-6 py-4">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-xl">
							{currentStep === "selector"
								? "Adicionar"
								: getContentTypeName(selectedType)}
						</h2>
						<Button
							className="h-8 w-8 p-0"
							onClick={handleClose}
							size="sm"
							variant="ghost"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{currentStep === "selector" && (
						<div className="relative mt-4">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								className="h-12 pl-10 text-base"
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Pesquisar ou colar um link"
								value={searchQuery}
							/>
						</div>
					)}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					{(() => {
						if (currentStep === "selector") {
							return (
								<ContentSelector
									onTypeSelect={handleTypeSelect}
									onUrlDetected={(url) => {
										setSelectedType("link");
										setFormData({ title: "", url, badge: "" });
										setCurrentStep("form");
									}}
									searchQuery={searchQuery}
								/>
							);
						}

						if (selectedType) {
							return (
								<ContentForm
									existingSections={existingSections}
									formData={formData}
									isLoading={isLoading}
									onBack={handleBack}
									onSave={handleSave}
									setFormData={setFormData}
									type={selectedType}
								/>
							);
						}

						return null;
					})()}
				</div>
			</DialogContent>
		</Dialog>
	);
};

const getContentTypeName = (type: ContentType | null): string => {
	const names: Record<ContentType, string> = {
		link: "Adicionar Link",
		section: "Criar Seção",
		image: "Adicionar Imagem",
		video: "Adicionar Vídeo",
		music: "Adicionar Música",
		text: "Adicionar Texto",
		"social-feed": "Feed de Rede Social",
		"contact-form": "Formulário de Contato",
		integration: "Integração",
	};

	return type ? names[type] : "Adicionar";
};

export default UnifiedAddModal;

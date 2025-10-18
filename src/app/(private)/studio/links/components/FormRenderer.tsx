"use client";

import { ArrowLeft } from "lucide-react";
import { BaseButton } from "@/components/buttons/BaseButton";
import type {
	ImageFormData,
	LinkFormData,
	SectionFormData,
	TextFormData,
	VideoFormData,
} from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import { isValidVideoUrl } from "../utils/video.helpers";
import AddNewImageCarouselForm from "./links.AddNewImageCarouselForm";
import AddNewImageColumnForm from "./links.AddNewImageColumnForm";
import AddNewImageSingleForm from "./links.AddNewImageSingleForm";
import AddNewLinkForm from "./links.AddNewLinkForm";
import AddNewSectionForm from "./links.AddNewSectionForm";
import AddNewTextForm from "./links.AddNewTextForm";
import AddNewVideoForm from "./links.AddNewVideoForm";

interface FormRendererProps {
	selectedOption: string | null;
	isMobile: boolean;
	isAdding: boolean;
	isAddingSection: boolean;
	isAddingText: boolean;
	isAddingVideo: boolean;
	isAddingImage: boolean;
	formData: LinkFormData;
	sectionFormData: SectionFormData;
	textFormData: TextFormData;
	videoFormData: VideoFormData;
	imageFormData: ImageFormData;
	existingSections: SectionItem[];
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	setImageFormData: (data: ImageFormData) => void;
	onCancel: () => void;
	onLinkSubmit: () => void;
	onSectionSubmit: () => void;
	onTextSubmit: () => void;
	onVideoSubmit: () => void;
	onImageSubmit: () => void;
	onBack: () => void;
}

const validateLinkForm = (
	formData: LinkFormData,
	isMobile: boolean
): boolean => {
	if (isMobile) {
		return !!(formData.url && formData.title);
	}
	return isValidUrl(formData.url) && formData.title.trim().length > 0;
};

const validateSectionForm = (sectionFormData: SectionFormData): boolean => {
	return sectionFormData.title.trim().length > 0;
};

const validateTextForm = (textFormData: TextFormData): boolean => {
	return (
		textFormData.title.trim().length > 0 &&
		textFormData.description.trim().length > 0
	);
};

const validateVideoForm = (videoFormData: VideoFormData): boolean => {
	const { valid } = isValidVideoUrl(videoFormData.url || "");
	return valid;
};

const validateImageForm = (imageFormData: ImageFormData): boolean => {
	const count = Array.isArray(imageFormData.images)
		? imageFormData.images.length
		: 0;
	if (imageFormData.layout === "column") {
		return count > 0 && imageFormData.title.trim().length > 0;
	}
	if (imageFormData.layout === "carousel") {
		return count >= 2;
	}
	return count > 0;
};

const isVideoOption = (selectedOption: string | null): boolean => {
	const videoOptions = ["video", "youtube", "vimeo", "tiktok", "twitch"];
	return videoOptions.includes(selectedOption || "");
};

const FormHeader = ({
	title,
	onBack,
}: {
	title: string;
	onBack: () => void;
}) => (
	<div className="mb-4 flex items-center">
		<BaseButton className="mr-2 p-2" onClick={onBack} size="sm" variant="white">
			<ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.5} />
			<span className="text-sm">Voltar</span>
		</BaseButton>
		<h2 className="font-semibold text-xl">{title}</h2>
	</div>
);

const LinkFormRenderer = ({
	formData,
	isMobile,
	existingSections,
	onLinkSubmit,
	setFormData,
	onBack,
}: {
	formData: LinkFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onLinkSubmit: () => void;
	setFormData: (data: LinkFormData) => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Link" />
		<div className="min-h-0 flex-1">
			<AddNewLinkForm
				existingSections={isMobile ? undefined : existingSections}
				formData={formData}
				isSaveDisabled={!validateLinkForm(formData, isMobile)}
				onSave={onLinkSubmit}
				setFormData={setFormData}
			/>
		</div>
	</div>
);

const SectionFormRenderer = ({
	formData,
	onSectionSubmit,
	setFormData,
	onBack,
}: {
	formData: SectionFormData;
	onSectionSubmit: () => void;
	setFormData: (data: SectionFormData) => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Seção" />
		<div className="min-h-0 flex-1">
			<AddNewSectionForm
				formData={formData}
				isSaveDisabled={!validateSectionForm(formData)}
				onSave={onSectionSubmit}
				setFormData={setFormData}
			/>
		</div>
	</div>
);

const TextFormRenderer = ({
	textFormData,
	isMobile,
	existingSections,
	onTextSubmit,
	setTextFormData,
	onCancel,
	onBack,
}: {
	textFormData: TextFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onTextSubmit: () => void;
	setTextFormData: (data: TextFormData) => void;
	onCancel: () => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Texto" />
		<div className="min-h-0 flex-1">
			<AddNewTextForm
				existingSections={isMobile ? undefined : existingSections}
				formData={textFormData}
				isSaveDisabled={!validateTextForm(textFormData)}
				onCancel={onCancel}
				onSave={onTextSubmit}
				setFormData={setTextFormData}
			/>
		</div>
	</div>
);

const VideoFormRenderer = ({
	videoFormData,
	isMobile,
	existingSections,
	onVideoSubmit,
	setVideoFormData,
	onCancel,
	onBack,
}: {
	videoFormData: VideoFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onVideoSubmit: () => void;
	setVideoFormData: (data: VideoFormData) => void;
	onCancel: () => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Vídeo" />
		<div className="min-h-0 flex-1">
			<AddNewVideoForm
				existingSections={isMobile ? undefined : existingSections}
				formData={videoFormData}
				isSaveDisabled={!validateVideoForm(videoFormData)}
				onCancel={onCancel}
				onSave={onVideoSubmit}
				setFormData={setVideoFormData}
			/>
		</div>
	</div>
);

const ImageSingleFormRenderer = ({
	imageFormData,
	isMobile,
	existingSections,
	onImageSubmit,
	setImageFormData,
	onCancel,
	onBack,
}: {
	imageFormData: ImageFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onImageSubmit: () => void;
	setImageFormData: (data: ImageFormData) => void;
	onCancel: () => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Imagem Única" />
		<div className="min-h-0 flex-1">
			<AddNewImageSingleForm
				existingSections={isMobile ? undefined : existingSections}
				formData={imageFormData}
				isSaveDisabled={
					!validateImageForm({ ...imageFormData, layout: "single" })
				}
				onCancel={onCancel}
				onSave={onImageSubmit}
				setFormData={setImageFormData}
			/>
		</div>
	</div>
);

const ImageColumnFormRenderer = ({
	imageFormData,
	isMobile,
	existingSections,
	onImageSubmit,
	setImageFormData,
	onCancel,
	onBack,
}: {
	imageFormData: ImageFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onImageSubmit: () => void;
	setImageFormData: (data: ImageFormData) => void;
	onCancel: () => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Imagens em Coluna" />
		<div className="min-h-0 flex-1">
			<AddNewImageColumnForm
				existingSections={isMobile ? undefined : existingSections}
				formData={imageFormData}
				isSaveDisabled={
					!validateImageForm({ ...imageFormData, layout: "column" })
				}
				onCancel={onCancel}
				onSave={onImageSubmit}
				setFormData={setImageFormData}
			/>
		</div>
	</div>
);

const ImageCarouselFormRenderer = ({
	imageFormData,
	isMobile,
	existingSections,
	onImageSubmit,
	setImageFormData,
	onCancel,
	onBack,
}: {
	imageFormData: ImageFormData;
	isMobile: boolean;
	existingSections: SectionItem[];
	onImageSubmit: () => void;
	setImageFormData: (data: ImageFormData) => void;
	onCancel: () => void;
	onBack: () => void;
}) => (
	<div className="flex h-full flex-col p-4">
		<FormHeader onBack={onBack} title="Adicionar Carrossel de Imagens" />
		<div className="min-h-0 flex-1">
			<AddNewImageCarouselForm
				existingSections={isMobile ? undefined : existingSections}
				formData={imageFormData}
				isSaveDisabled={
					!validateImageForm({ ...imageFormData, layout: "carousel" })
				}
				onCancel={onCancel}
				onSave={onImageSubmit}
				setFormData={setImageFormData}
			/>
		</div>
	</div>
);

const FormRenderer = ({
	selectedOption,
	isMobile,
	isAdding,
	isAddingSection,
	isAddingText,
	isAddingVideo,
	isAddingImage,
	formData,
	sectionFormData,
	textFormData,
	videoFormData,
	imageFormData,
	existingSections,
	setFormData,
	setSectionFormData,
	setTextFormData,
	setVideoFormData,
	setImageFormData,
	onCancel,
	onLinkSubmit,
	onSectionSubmit,
	onTextSubmit,
	onVideoSubmit,
	onImageSubmit,
	onBack,
}: FormRendererProps) => {
	if (selectedOption === "link" && (isMobile || isAdding)) {
		return (
			<LinkFormRenderer
				existingSections={existingSections}
				formData={formData}
				isMobile={isMobile}
				onBack={onBack}
				onLinkSubmit={onLinkSubmit}
				setFormData={setFormData}
			/>
		);
	}

	if (selectedOption === "section" && (isMobile || isAddingSection)) {
		return (
			<SectionFormRenderer
				formData={sectionFormData}
				onBack={onBack}
				onSectionSubmit={onSectionSubmit}
				setFormData={setSectionFormData}
			/>
		);
	}

	if (selectedOption === "text" && (isMobile || isAddingText)) {
		return (
			<TextFormRenderer
				existingSections={existingSections}
				isMobile={isMobile}
				onBack={onBack}
				onCancel={onCancel}
				onTextSubmit={onTextSubmit}
				setTextFormData={setTextFormData}
				textFormData={textFormData}
			/>
		);
	}

	if (isVideoOption(selectedOption) && (isMobile || isAddingVideo)) {
		return (
			<VideoFormRenderer
				existingSections={existingSections}
				isMobile={isMobile}
				onBack={onBack}
				onCancel={onCancel}
				onVideoSubmit={onVideoSubmit}
				setVideoFormData={setVideoFormData}
				videoFormData={videoFormData}
			/>
		);
	}

	if (isMobile || isAddingImage) {
		if (selectedOption === "image_single") {
			return (
				<ImageSingleFormRenderer
					existingSections={existingSections}
					imageFormData={imageFormData}
					isMobile={isMobile}
					onBack={onBack}
					onCancel={onCancel}
					onImageSubmit={onImageSubmit}
					setImageFormData={setImageFormData}
				/>
			);
		}
		if (selectedOption === "image_column") {
			return (
				<ImageColumnFormRenderer
					existingSections={existingSections}
					imageFormData={imageFormData}
					isMobile={isMobile}
					onBack={onBack}
					onCancel={onCancel}
					onImageSubmit={onImageSubmit}
					setImageFormData={setImageFormData}
				/>
			);
		}
		if (selectedOption === "image_carousel") {
			return (
				<ImageCarouselFormRenderer
					existingSections={existingSections}
					imageFormData={imageFormData}
					isMobile={isMobile}
					onBack={onBack}
					onCancel={onCancel}
					onImageSubmit={onImageSubmit}
					setImageFormData={setImageFormData}
				/>
			);
		}
	}

	return null;
};

export default FormRenderer;

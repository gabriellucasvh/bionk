"use client";

import { ArrowLeft } from "lucide-react";
import { BaseButton } from "@/components/buttons/BaseButton";
import type {
	LinkFormData,
	SectionFormData,
	TextFormData,
	VideoFormData,
} from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
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
	formData: LinkFormData;
	sectionFormData: SectionFormData;
	textFormData: TextFormData;
	videoFormData: VideoFormData;
	existingSections: SectionItem[];
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	onCancel: () => void;
	onLinkSubmit: () => void;
	onSectionSubmit: () => void;
	onTextSubmit: () => void;
	onVideoSubmit: () => void;
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
	return (
		videoFormData.title.trim().length > 0 &&
		videoFormData.description.trim().length > 0 &&
		videoFormData.url.trim().length > 0
	);
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
	<>
		<FormHeader onBack={onBack} title="Adicionar Link" />
		<AddNewLinkForm
			existingSections={isMobile ? undefined : existingSections}
			formData={formData}
			isSaveDisabled={!validateLinkForm(formData, isMobile)}
			onSave={onLinkSubmit}
			setFormData={setFormData}
		/>
	</>
);

const SectionFormRenderer = ({
	sectionFormData,
	existingSections,
	onSectionSubmit,
	setSectionFormData,
	onBack,
}: {
	sectionFormData: SectionFormData;
	existingSections: SectionItem[];
	onSectionSubmit: () => void;
	setSectionFormData: (data: SectionFormData) => void;
	onBack: () => void;
}) => (
	<>
		<FormHeader onBack={onBack} title="Adicionar Seção" />
		<AddNewSectionForm
			existingSections={existingSections}
			formData={sectionFormData}
			isSaveDisabled={!validateSectionForm(sectionFormData)}
			onSave={onSectionSubmit}
			setFormData={setSectionFormData}
		/>
	</>
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
	<>
		<FormHeader onBack={onBack} title="Adicionar Texto" />
		<AddNewTextForm
			existingSections={isMobile ? undefined : existingSections}
			formData={textFormData}
			isSaveDisabled={!validateTextForm(textFormData)}
			onCancel={onCancel}
			onSave={onTextSubmit}
			setFormData={setTextFormData}
		/>
	</>
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
	<>
		<FormHeader onBack={onBack} title="Adicionar Vídeo" />
		<AddNewVideoForm
			existingSections={isMobile ? undefined : existingSections}
			formData={videoFormData}
			isSaveDisabled={!validateVideoForm(videoFormData)}
			onCancel={onCancel}
			onSave={onVideoSubmit}
			setFormData={setVideoFormData}
		/>
	</>
);

const FormRenderer = ({
	selectedOption,
	isMobile,
	isAdding,
	isAddingSection,
	isAddingText,
	isAddingVideo,
	formData,
	sectionFormData,
	textFormData,
	videoFormData,
	existingSections,
	setFormData,
	setSectionFormData,
	setTextFormData,
	setVideoFormData,
	onCancel,
	onLinkSubmit,
	onSectionSubmit,
	onTextSubmit,
	onVideoSubmit,
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
				existingSections={existingSections}
				onBack={onBack}
				onSectionSubmit={onSectionSubmit}
				sectionFormData={sectionFormData}
				setSectionFormData={setSectionFormData}
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

	return null;
};

export default FormRenderer;

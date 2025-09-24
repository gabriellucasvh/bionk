"use client";

import type {
	LinkFormData,
	SectionFormData,
	TextFormData,
	VideoFormData,
} from "../hooks/useLinksManager";
import { isValidUrl } from "../utils/links.helpers";

interface UseModalHandlersProps {
	formData: LinkFormData;
	sectionFormData: SectionFormData;
	textFormData: TextFormData;
	videoFormData: VideoFormData;
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setIsAddingText: (value: boolean) => void;
	setIsAddingVideo: (value: boolean) => void;
	handleAddNewLink: () => Promise<void>;
	handleAddNewSection: () => Promise<void>;
	handleAddNewText: () => Promise<void>;
	handleAddNewVideo: () => Promise<void>;
	onClose: () => void;
}

export const useModalHandlers = ({
	formData,
	sectionFormData,
	textFormData,
	videoFormData,
	setFormData,
	setSectionFormData,
	setTextFormData,
	setVideoFormData,
	setIsAdding,
	setIsAddingSection,
	setIsAddingText,
	setIsAddingVideo,
	handleAddNewLink,
	handleAddNewSection,
	handleAddNewText,
	handleAddNewVideo,
	onClose,
}: UseModalHandlersProps) => {
	const handleLinkSubmit = async () => {
		if (!isValidUrl(formData.url) || formData.title.trim().length === 0) {
			return;
		}

		setIsAdding(true);
		try {
			await handleAddNewLink();
			setFormData({
				title: "",
				url: "",
				sectionId: null,
				badge: "",
				password: "",
				deleteOnClicks: undefined,
				expiresAt: undefined,
				launchesAt: undefined,
			});
			onClose();
		} catch (error) {
			console.error("Erro ao adicionar link:", error);
		} finally {
			setIsAdding(false);
		}
	};

	const handleSectionSubmit = async () => {
		if (sectionFormData.title.trim().length === 0) {
			return;
		}

		setIsAddingSection(true);
		try {
			await handleAddNewSection();
			setSectionFormData({ title: "" });
			onClose();
		} catch (error) {
			console.error("Erro ao adicionar seção:", error);
		} finally {
			setIsAddingSection(false);
		}
	};

	const handleTextSubmit = async () => {
		if (
			textFormData.title.trim().length === 0 ||
			textFormData.description.trim().length === 0
		) {
			return;
		}

		setIsAddingText(true);
		try {
			await handleAddNewText();
			setTextFormData({
				title: "",
				description: "",
				position: "left",
				hasBackground: true,
				sectionId: null,
			});
			onClose();
		} catch (error) {
			console.error("Erro ao adicionar texto:", error);
		} finally {
			setIsAddingText(false);
		}
	};

	const handleVideoSubmit = async () => {
		if (videoFormData.url.trim().length === 0) {
			return;
		}

		setIsAddingVideo(true);
		try {
			await handleAddNewVideo();
			setVideoFormData({
				title: "",
				description: "",
				url: "",
				type: "direct",
				sectionId: null,
			});
			onClose();
		} finally {
			setIsAddingVideo(false);
		}
	};

	const handleCancelWithState = () => {
		setIsAdding(false);
		setIsAddingSection(false);
		setIsAddingText(false);
		setIsAddingVideo(false);
	};

	return {
		handleLinkSubmit,
		handleSectionSubmit,
		handleTextSubmit,
		handleVideoSubmit,
		handleCancelWithState,
	};
};

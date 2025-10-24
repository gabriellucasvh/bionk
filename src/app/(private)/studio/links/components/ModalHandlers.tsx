"use client";

import type {
    LinkFormData,
    SectionFormData,
    TextFormData,
    VideoFormData,
    ImageFormData,
    MusicFormData,
} from "../hooks/useLinksManager";
import { isValidUrl } from "../utils/links.helpers";

interface UseModalHandlersProps {
    formData: LinkFormData;
    sectionFormData: SectionFormData;
    textFormData: TextFormData;
    videoFormData: VideoFormData;
    imageFormData: ImageFormData;
    musicFormData: MusicFormData;
    setFormData: (data: LinkFormData) => void;
    setSectionFormData: (data: SectionFormData) => void;
    setTextFormData: (data: TextFormData) => void;
    setVideoFormData: (data: VideoFormData) => void;
    setImageFormData: (data: ImageFormData) => void;
    setMusicFormData: (data: MusicFormData) => void;
    setIsAdding: (value: boolean) => void;
    setIsAddingSection: (value: boolean) => void;
    setIsAddingText: (value: boolean) => void;
    setIsAddingVideo: (value: boolean) => void;
    setIsAddingImage: (value: boolean) => void;
    setIsAddingMusic: (value: boolean) => void;
    handleAddNewLink: () => Promise<void>;
    handleAddNewSection: () => Promise<void>;
    handleAddNewText: () => Promise<void>;
    handleAddNewVideo: () => Promise<void>;
    handleAddNewImage: (override?: Partial<ImageFormData>) => Promise<void>;
    handleAddNewMusic: () => Promise<void>;
    onClose: () => void;
}

export const useModalHandlers = ({
    formData,
    sectionFormData,
    textFormData,
    videoFormData,
    imageFormData,
    musicFormData,
    setFormData,
    setSectionFormData,
    setTextFormData,
    setVideoFormData,
    setImageFormData,
    setMusicFormData,
    setIsAdding,
    setIsAddingSection,
    setIsAddingText,
    setIsAddingVideo,
    setIsAddingImage,
    setIsAddingMusic,
    handleAddNewLink,
    handleAddNewSection,
    handleAddNewText,
    handleAddNewVideo,
    handleAddNewImage,
    handleAddNewMusic,
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
				isCompact: false,
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

    const handleImageSubmit = async () => {
        const count = Array.isArray((imageFormData as any).images)
            ? (imageFormData as any).images.length
            : 0;
        const layout = (imageFormData as any).layout;
        const isValid = layout === "carousel" ? count >= 2 : count > 0;
        if (!isValid) {
            return;
        }

        setIsAddingImage(true);
        try {
            await handleAddNewImage();
            setImageFormData({
                title: "",
                description: "",
                layout: "single",
                ratio: "square",
                sizePercent: 100,
                images: [],
                sectionId: null,
            } as any);
            onClose();
        } finally {
            setIsAddingImage(false);
        }
    };

    const handleMusicSubmit = async () => {
        if (musicFormData.url.trim().length === 0) {
            return;
        }

        setIsAddingMusic(true);
        try {
            await handleAddNewMusic();
            setMusicFormData({
                title: "",
                url: "",
                usePreview: true,
                sectionId: null,
            });
            onClose();
        } finally {
            setIsAddingMusic(false);
        }
    };

    const handleCancelWithState = () => {
        setIsAdding(false);
        setIsAddingSection(false);
        setIsAddingText(false);
        setIsAddingVideo(false);
        setIsAddingImage(false);
        setIsAddingMusic(false);
    };

    return {
        handleLinkSubmit,
        handleSectionSubmit,
        handleTextSubmit,
        handleVideoSubmit,
        handleImageSubmit,
        handleMusicSubmit,
        handleCancelWithState,
    };
};

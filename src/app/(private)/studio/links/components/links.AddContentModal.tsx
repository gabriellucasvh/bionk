"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDragGesture } from "../hooks/useDragGesture";
import type {
	ImageFormData,
	LinkFormData,
	SectionFormData,
	TextFormData,
	VideoFormData,
} from "../hooks/useLinksManager";
import { useModalState } from "../hooks/useModalState";
import type { SectionItem } from "../types/links.types";
import CategorySelector from "./CategorySelector";
import ContentOptions from "./ContentOptions";
import FormRenderer from "./FormRenderer";
import ImageOptions from "./ImageOptions";
import MediaOptions from "./MediaOptions";
import MobileBottomSheet from "./MobileBottomSheet";
import { useModalHandlers } from "./ModalHandlers";

interface AddContentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
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
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setIsAddingText: (value: boolean) => void;
	setIsAddingVideo: (value: boolean) => void;
	setIsAddingImage: (value: boolean) => void;
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	setImageFormData: (data: ImageFormData) => void;
	handleAddNewLink: () => Promise<void>;
	handleAddNewSection: () => Promise<void>;
	handleAddNewText: () => Promise<void>;
	handleAddNewVideo: () => Promise<void>;
    handleAddNewImage: (override?: Partial<ImageFormData>) => Promise<void>;
}

const AddContentModal = ({
	isOpen,
	onClose,
	onOpen,
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
	setIsAdding,
	setIsAddingSection,
	setIsAddingText,
	setIsAddingVideo,
	setIsAddingImage,
	setFormData,
	setSectionFormData,
	setTextFormData,
	setVideoFormData,
	setImageFormData,
	handleAddNewLink,
	handleAddNewSection,
	handleAddNewText,
	handleAddNewVideo,
	handleAddNewImage,
}: AddContentModalProps) => {
	const {
		isAnimating,
		selectedCategory,
		selectedOption,
		isMobile,
		handleCategorySelect,
		handleOptionSelect,
		setIsAnimating,
		setSelectedOption,
	} = useModalState();

	useEffect(() => {
		if (!isOpen) {
			setSelectedOption(null);
		}
	}, [isOpen, setSelectedOption]);

	const {
		isDragging,
		dragY,
		isClosing,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	} = useDragGesture(onClose);

	const {
		handleLinkSubmit,
		handleSectionSubmit,
		handleTextSubmit,
		handleVideoSubmit,
		handleImageSubmit,
		handleCancelWithState,
	} = useModalHandlers({
		formData,
		sectionFormData,
		textFormData,
		videoFormData,
		imageFormData,
		setFormData,
		setSectionFormData,
		setTextFormData,
		setVideoFormData,
		setImageFormData,
		setIsAdding,
		setIsAddingSection,
		setIsAddingText,
		setIsAddingVideo,
		setIsAddingImage,
		handleAddNewLink,
		handleAddNewSection,
		handleAddNewText,
		handleAddNewVideo,
		handleAddNewImage,
		onClose,
	});

	useEffect(() => {
		if (isOpen && isMobile) {
			setIsAnimating(true);
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("touchmove", handleTouchMove);
			document.addEventListener("touchend", handleTouchEnd);
		} else if (!isOpen) {
			setIsAnimating(false);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [
		isOpen,
		isMobile,
		handleMouseMove,
		handleMouseUp,
		handleTouchMove,
		handleTouchEnd,
		setIsAnimating,
	]);

	const handleOptionSelectWithState = async (option: string) => {
		const validOptions = [
			"link",
			"section",
			"text",
			"video",
			"youtube",
			"vimeo",
			"tiktok",
			"twitch",
		] as const;

		if (!validOptions.includes(option as any)) {
			return;
		}

		const validOption = option as (typeof validOptions)[number];

		// Para "section", fechar o modal e abrir formulário inline na página
		if (validOption === "section") {
			onClose();
			setTimeout(() => {
				setIsAddingSection(true);
			}, 0);
			return;
		}

		// Para demais opções, fechar o modal antes de criar o rascunho inline
		// e garantir que o formulário de seção seja fechado
		setIsAddingSection(false);
		onClose();

		if (validOption === "link") {
			setTimeout(async () => {
				await handleAddNewLink();
			}, 0);
			return;
		}

		if (validOption === "text") {
			setTimeout(async () => {
				await handleAddNewText();
			}, 0);
			return;
		}

		if (
			["video", "youtube", "vimeo", "tiktok", "twitch"].includes(validOption)
		) {
			const videoType: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch" =
				validOption === "video"
					? "direct"
					: (validOption as "youtube" | "vimeo" | "tiktok" | "twitch");
			setVideoFormData({
				...videoFormData,
				type: videoType,
			});
			setTimeout(async () => {
				await handleAddNewVideo();
			}, 0);
			return;
		}
	};

    const handleImageOptionSelect = (
        option: "image_single" | "image_column" | "image_carousel"
    ) => {
        // Criar rascunho e abrir edição fora do modal
        // Garantir que o formulário de seção esteja fechado
        setIsAddingSection(false);
        const layoutMap = {
            image_single: "single",
            image_column: "column",
            image_carousel: "carousel",
        } as const;
        const layout = layoutMap[option];
        // Não depender do setState assíncrono: passar o layout diretamente
        setSelectedOption(null);
        void handleAddNewImage({ layout, images: [], title: "" }).finally(() => {
            setIsAddingImage(false);
            onClose();
        });
    };

	if (isMobile) {
		return (
			<>
				<BaseButton
					className="w-full bg-lime-400 text-black hover:bg-lime-500 sm:w-auto"
					onClick={onOpen}
				>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Conteúdo
				</BaseButton>

				<MobileBottomSheet
					dragY={dragY}
					isAnimating={isAnimating}
					isClosing={isClosing}
					isDragging={isDragging}
					isOpen={isOpen}
					onClose={onClose}
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
				>
					<FormRenderer
						existingSections={existingSections}
						formData={formData}
						imageFormData={imageFormData}
						isAdding={isAdding}
						isAddingImage={isAddingImage}
						isAddingSection={isAddingSection}
						isAddingText={isAddingText}
						isAddingVideo={isAddingVideo}
						isMobile={true}
						onBack={() => setSelectedOption(null)}
						onCancel={handleCancelWithState}
						onImageSubmit={handleImageSubmit}
						onLinkSubmit={handleLinkSubmit}
						onSectionSubmit={handleSectionSubmit}
						onTextSubmit={handleTextSubmit}
						onVideoSubmit={handleVideoSubmit}
						sectionFormData={sectionFormData}
						selectedOption={selectedOption}
						setFormData={setFormData}
						setImageFormData={setImageFormData}
						setSectionFormData={setSectionFormData}
						setTextFormData={setTextFormData}
						setVideoFormData={setVideoFormData}
						textFormData={textFormData}
						videoFormData={videoFormData}
					/>

					{!selectedOption && (
						<>
							<h2 className="mb-6 text-center font-semibold text-xl">
								Adicionar Conteúdo
							</h2>
							<div className="flex flex-col space-y-4">
								<CategorySelector
									onCategorySelect={handleCategorySelect}
									selectedCategory={selectedCategory}
								/>
								{selectedCategory === "content" && (
									<ContentOptions
										onOptionSelect={handleOptionSelectWithState}
									/>
								)}
								{selectedCategory === "video" && (
									<MediaOptions onOptionSelect={handleOptionSelectWithState} />
								)}
								{selectedCategory === "image" && (
									<ImageOptions onOptionSelect={handleImageOptionSelect} />
								)}
							</div>
						</>
					)}
				</MobileBottomSheet>
			</>
		);
	}

	return (
		<>
			<BaseButton className="w-full sm:w-auto" onClick={onOpen}>
				<Plus className="mr-2 h-4 w-4" />
				Adicionar Conteúdo
			</BaseButton>

			<Dialog onOpenChange={onClose} open={isOpen}>
				<DialogContent className="h-[80vh] max-h-[600px] min-w-[40vw] max-w-4xl p-0">
					<div className="flex h-full flex-col">
						<DialogHeader className="border-b px-6 py-4">
							<DialogTitle>Adicionar Conteúdo</DialogTitle>
						</DialogHeader>

						<div className="flex-1 overflow-y-auto">
							{selectedOption ? (
								<div className="h-full">
									<FormRenderer
										existingSections={existingSections}
										formData={formData}
										imageFormData={imageFormData}
										isAdding={isAdding}
										isAddingImage={isAddingImage}
										isAddingSection={isAddingSection}
										isAddingText={isAddingText}
										isAddingVideo={isAddingVideo}
										isMobile={false}
										onBack={() => setSelectedOption(null)}
										onCancel={handleCancelWithState}
										onImageSubmit={handleImageSubmit}
										onLinkSubmit={handleLinkSubmit}
										onSectionSubmit={handleSectionSubmit}
										onTextSubmit={handleTextSubmit}
										onVideoSubmit={handleVideoSubmit}
										sectionFormData={sectionFormData}
										selectedOption={selectedOption}
										setFormData={setFormData}
										setImageFormData={setImageFormData}
										setSectionFormData={setSectionFormData}
										setTextFormData={setTextFormData}
										setVideoFormData={setVideoFormData}
										textFormData={textFormData}
										videoFormData={videoFormData}
									/>
								</div>
							) : (
								<div className="flex h-full">
									<div className="w-48 border-r p-2">
										<CategorySelector
											onCategorySelect={handleCategorySelect}
											selectedCategory={selectedCategory}
										/>
									</div>

									<div className="flex-1 p-4">
										{selectedCategory === "content" && (
											<ContentOptions
												onOptionSelect={handleOptionSelectWithState}
											/>
										)}
										{selectedCategory === "video" && (
											<MediaOptions
												onOptionSelect={handleOptionSelectWithState}
											/>
										)}
										{selectedCategory === "image" && (
											<ImageOptions onOptionSelect={handleImageOptionSelect} />
										)}
										{!selectedCategory && (
											<div className="flex items-start justify-center pt-8 text-muted-foreground">
												Selecione uma categoria para ver as opções
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AddContentModal;

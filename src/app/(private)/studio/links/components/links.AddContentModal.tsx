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
	formData: LinkFormData;
	sectionFormData: SectionFormData;
	textFormData: TextFormData;
	videoFormData: VideoFormData;
	existingSections: SectionItem[];
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setIsAddingText: (value: boolean) => void;
	setIsAddingVideo: (value: boolean) => void;
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	handleAddNewLink: () => Promise<void>;
	handleAddNewSection: () => Promise<void>;
	handleAddNewText: () => Promise<void>;
}

const AddContentModal = ({
	isOpen,
	onClose,
	onOpen,
	isAdding,
	isAddingSection,
	isAddingText,
	isAddingVideo,
	formData,
	sectionFormData,
	textFormData,
	videoFormData,
	existingSections,
	setIsAdding,
	setIsAddingSection,
	setIsAddingText,
	setIsAddingVideo,
	setFormData,
	setSectionFormData,
	setTextFormData,
	setVideoFormData,
	handleAddNewLink,
	handleAddNewSection,
	handleAddNewText,
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
		handleCancelWithState,
	} = useModalHandlers({
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

	const handleOptionSelectWithState = (option: string) => {
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
		handleOptionSelect(validOption);

		if (validOption === "link") {
			setIsAdding(true);
		} else if (validOption === "section") {
			setIsAddingSection(true);
		} else if (validOption === "text") {
			setIsAddingText(true);
		} else if (
			["video", "youtube", "vimeo", "tiktok", "twitch"].includes(validOption)
		) {
			setIsAddingVideo(true);
			const videoType: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch" =
				validOption === "video"
					? "direct"
					: (validOption as "youtube" | "vimeo" | "tiktok" | "twitch");
			setVideoFormData({
				...videoFormData,
				type: videoType,
			});
		}
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
					isDragging={isDragging}
					isClosing={isClosing}
					isOpen={isOpen}
					onClose={onClose}
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
				>
					<FormRenderer
						existingSections={existingSections}
						formData={formData}
						isAdding={isAdding}
						isAddingSection={isAddingSection}
						isAddingText={isAddingText}
						isAddingVideo={isAddingVideo}
						isMobile={true}
						onBack={() => setSelectedOption(null)}
						onCancel={handleCancelWithState}
						onLinkSubmit={handleLinkSubmit}
						onSectionSubmit={handleSectionSubmit}
						onTextSubmit={handleTextSubmit}
						onVideoSubmit={handleVideoSubmit}
						sectionFormData={sectionFormData}
						selectedOption={selectedOption}
						setFormData={setFormData}
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
								{selectedCategory === "media" && (
									<MediaOptions onOptionSelect={handleOptionSelectWithState} />
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

						<div className="flex-1 overflow-hidden">
							{selectedOption ? (
								<div className="h-full p-6">
									<FormRenderer
										existingSections={existingSections}
										formData={formData}
										isAdding={isAdding}
										isAddingSection={isAddingSection}
										isAddingText={isAddingText}
										isAddingVideo={isAddingVideo}
										isMobile={false}
										onBack={() => setSelectedOption(null)}
										onCancel={handleCancelWithState}
										onLinkSubmit={handleLinkSubmit}
										onSectionSubmit={handleSectionSubmit}
										onTextSubmit={handleTextSubmit}
										onVideoSubmit={handleVideoSubmit}
										sectionFormData={sectionFormData}
										selectedOption={selectedOption}
										setFormData={setFormData}
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
										{selectedCategory === "media" && (
											<MediaOptions
												onOptionSelect={handleOptionSelectWithState}
											/>
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

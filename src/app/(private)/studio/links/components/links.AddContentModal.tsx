"use client";

import { Plus } from "lucide-react";
import { useEffect } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useDragGesture } from "../hooks/useDragGesture";
import { useModalState } from "../hooks/useModalState";
import { isValidUrl } from "../utils/links.helpers";
import CategorySelector from "./CategorySelector";
import ContentOptions from "./ContentOptions";
import AddNewLinkForm from "./links.AddNewLinkForm";
import AddNewSectionForm from "./links.AddNewSectionForm";
import AddNewTextForm from "./links.AddNewTextForm";
import MediaOptions from "./MediaOptions";
import MobileBottomSheet from "./MobileBottomSheet";

interface AddContentModalProps {
	isAdding: boolean;
	isAddingSection: boolean;
	isAddingText: boolean;
	formData: any;
	existingSections: string[];
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setIsAddingText: (value: boolean) => void;
	setFormData: (data: any) => void;
	setSectionFormData: (data: any) => void;
	setTextFormData: (data: any) => void;
	handleAddNewLink: () => void;
	handleAddNewSection: () => void;
	handleAddNewText: () => void;
	onAddLink?: (url: string, title: string) => void;
	onAddSection?: (title: string) => void;
	onAddText?: (content: string) => void;
}

const AddContentModal = ({
	isAdding,
	isAddingSection,
	isAddingText,
	formData,
	existingSections,
	setIsAdding,
	setIsAddingSection,
	setIsAddingText,
	setFormData,
	setSectionFormData,
	setTextFormData,
	handleAddNewLink,
	handleAddNewSection,
	handleAddNewText,
	onAddLink,
	onAddSection,
	onAddText,
}: AddContentModalProps) => {
	const {
		isOpen,
		isAnimating,
		selectedCategory,
		selectedOption,
		isMobile,
		linkData,
		sectionData,
		textData,
		setLinkData,
		setSectionData,
		setTextData,
		handleOpen,
		handleClose,
		handleCancel,
		handleCategorySelect,
		handleOptionSelect,
	} = useModalState();

	const {
		isDragging,
		dragY,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	} = useDragGesture(handleClose);

	useEffect(() => {
		if (isOpen && isMobile) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("touchmove", handleTouchMove);
			document.addEventListener("touchend", handleTouchEnd);
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
	]);

	const handleOptionSelectWithState = (
		option:
			| "link"
			| "section"
			| "text"
			| "video"
			| "youtube"
			| "vimeo"
			| "tiktok"
			| "twitch"
	) => {
		handleOptionSelect(option);
		if (option === "link") {
			setIsAdding(true);
		} else if (option === "section") {
			setIsAddingSection(true);
		} else if (option === "text") {
			setIsAddingText(true);
		}
	};

	const handleLinkSubmit = () => {
		if (linkData.url && linkData.title) {
			if (onAddLink) {
				onAddLink(linkData.url, linkData.title);
			} else {
				handleAddNewLink();
			}
			setLinkData({ url: "", title: "", badge: "" });
			handleClose();
		}
	};

	const handleSectionSubmit = () => {
		if (sectionData.title) {
			if (onAddSection) {
				onAddSection(sectionData.title);
			} else {
				handleAddNewSection();
			}
			setSectionData({ title: "" });
			handleClose();
		}
	};

	const handleTextSubmit = () => {
		if (textData.title && textData.description) {
			if (onAddText) {
				onAddText(textData.title);
			} else {
				handleAddNewText();
			}
			setTextFormData({
				title: "",
				description: "",
				position: "center" as const,
				hasBackground: true,
			});
			handleClose();
		}
	};

	const handleCancelWithState = () => {
		handleCancel();
		setIsAdding(false);
		setIsAddingSection(false);
		setIsAddingText(false);
	};

	if (isMobile) {
		return (
			<>
				<BaseButton
					className="w-full bg-lime-400 text-black hover:bg-lime-500 sm:w-auto"
					onClick={handleOpen}
				>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Conteúdo
				</BaseButton>

				<MobileBottomSheet
					dragY={dragY}
					isAnimating={isAnimating}
					isDragging={isDragging}
					isOpen={isOpen}
					onClose={handleClose}
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
				>
					<h2 className="mb-6 text-center font-semibold text-xl">
						Adicionar Conteúdo
					</h2>

					<CategorySelector
						onCategorySelect={handleCategorySelect}
						selectedCategory={selectedCategory}
					/>

					{selectedCategory === "content" && (
						<ContentOptions onOptionSelect={handleOptionSelectWithState} />
					)}

					{selectedCategory === "media" && (
						<MediaOptions onOptionSelect={handleOptionSelectWithState} />
					)}

					{selectedOption === "link" && (
						<AddNewLinkForm
							formData={linkData}
							onCancel={handleCancelWithState}
							onSave={handleLinkSubmit}
							setFormData={setLinkData}
						/>
					)}

					{selectedOption === "section" && (
						<AddNewSectionForm
							existingSections={existingSections}
							formData={sectionData}
							isSaveDisabled={sectionData.title.trim().length === 0}
							onCancel={handleCancelWithState}
							onSave={handleSectionSubmit}
							setFormData={setSectionData}
						/>
					)}

					{selectedOption === "text" && (
						<AddNewTextForm
							formData={textData}
							isSaveDisabled={
								textData.title.trim().length === 0 ||
								textData.description.trim().length === 0
							}
							onCancel={handleCancelWithState}
							onSave={handleTextSubmit}
							setFormData={setTextData}
						/>
					)}
				</MobileBottomSheet>
			</>
		);
	}

	return (
		<Dialog onOpenChange={handleOpen} open={isOpen}>
			<DialogTrigger asChild>
				<BaseButton className="w-full sm:w-auto" onClick={handleOpen}>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Conteúdo
				</BaseButton>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>Adicionar Conteúdo</DialogTitle>
				</DialogHeader>

				<div className="flex max-h-[60vh] min-h-[400px] flex-col sm:flex-row">
					<div className="mb-4 w-full border-border border-b pr-0 pb-4 sm:mb-0 sm:w-48 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0">
						<CategorySelector
							onCategorySelect={handleCategorySelect}
							selectedCategory={selectedCategory}
						/>
					</div>

					<div className="flex-1 overflow-y-auto pl-0 sm:pl-6">
						{!selectedCategory && (
							<div className="flex h-full items-center justify-center text-muted-foreground">
								<p>Selecione uma categoria na barra lateral</p>
							</div>
						)}

						{selectedCategory === "content" && !selectedOption && (
							<ContentOptions onOptionSelect={handleOptionSelectWithState} />
						)}

						{selectedCategory === "media" && !selectedOption && (
							<MediaOptions onOptionSelect={handleOptionSelectWithState} />
						)}
					</div>
				</div>

				{selectedOption === "link" && isAdding && (
					<div className="absolute inset-0 z-10 bg-background p-6">
						<AddNewLinkForm
							existingSections={existingSections}
							formData={formData}
							isSaveDisabled={
								!isValidUrl(formData.url) || formData.title.trim().length === 0
							}
							onCancel={handleCancelWithState}
							onSave={handleLinkSubmit}
							setFormData={setFormData}
						/>
					</div>
				)}

				{selectedOption === "section" && isAddingSection && (
					<div className="absolute inset-0 z-10 bg-background p-6">
						<AddNewSectionForm
							existingSections={existingSections}
							formData={sectionData}
							isSaveDisabled={sectionData.title.trim().length === 0}
							onCancel={handleCancelWithState}
							onSave={handleSectionSubmit}
							setFormData={setSectionFormData}
						/>
					</div>
				)}

				{selectedOption === "text" && isAddingText && (
					<div className="absolute inset-0 z-10 bg-background p-6">
						<AddNewTextForm
							existingSections={existingSections}
							formData={textData}
							isSaveDisabled={
								!(textData.title.trim() && textData.description.trim())
							}
							onCancel={handleCancelWithState}
							onSave={handleTextSubmit}
							setFormData={setTextFormData}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default AddContentModal;

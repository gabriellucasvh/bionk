// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { useLinksManager } from "../hooks/useLinksManager";
import type {
	LinkItem,
	SectionItem,
	TextItem,
	VideoItem,
	ImageItem,
} from "../types/links.types";
import AddContentModal from "./links.AddContentModal";
import AddNewSectionForm from "./links.AddNewSectionForm";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	currentLinks: LinkItem[];
	currentSections: SectionItem[];
	currentTexts: TextItem[];
	currentVideos: VideoItem[];
	currentImages: ImageItem[];
	mutateLinks: () => Promise<any>;
	mutateSections: () => Promise<any>;
	mutateTexts: () => Promise<any>;
	mutateVideos: () => Promise<any>;
	mutateImages: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	currentLinks,
	currentSections,
	currentTexts,
	currentVideos,
	currentImages,
	mutateLinks,
	mutateSections,
	mutateTexts,
	mutateVideos,
	mutateImages,
}: LinksTabContentProps) => {
	const {
		unifiedItems,
		isAdding,
		isAddingVideo,
		isAddingImage,
		formData,
		videoFormData,
		imageFormData,
		existingSections,
		activeId,
		archivingLinkId,
		isModalOpen,
		togglingVideoId,
		togglingImageId,
		togglingLinkId,
		togglingTextId,
		togglingSectionId,
		originalLink,
		originalText,
		originalVideo,
		originalImage,
		setActiveId,
		setIsAdding,
		setIsAddingVideo,
		setIsAddingImage,
		setFormData,
		setVideoFormData,
		setImageFormData,
		setIsModalOpen,
		handleDragEnd,
		...handlers
	} = useLinksManager(
		currentLinks,
		currentSections,
		currentTexts,
		currentVideos,
		currentImages,
		mutateLinks,
		mutateSections,
		mutateTexts,
		mutateVideos,
		mutateImages
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	return (
		<div className="space-y-4">
			<AddContentModal
				existingSections={existingSections}
				formData={formData}
				handleAddNewImage={handlers.handleAddNewImage}
				handleAddNewLink={handlers.handleAddNewLink}
				handleAddNewSection={handlers.handleAddNewSection}
				handleAddNewText={handlers.handleAddNewText}
				handleAddNewVideo={handlers.handleAddNewVideo}
				imageFormData={imageFormData}
				isAdding={isAdding}
				isAddingImage={isAddingImage}
				isAddingSection={handlers.isAddingSection}
				isAddingText={handlers.isAddingText}
				isAddingVideo={isAddingVideo}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onOpen={() => setIsModalOpen(true)}
				sectionFormData={handlers.sectionFormData}
				setFormData={setFormData}
				setImageFormData={setImageFormData}
				setIsAdding={setIsAdding}
				setIsAddingImage={setIsAddingImage}
				setIsAddingSection={handlers.setIsAddingSection}
				setIsAddingText={handlers.setIsAddingText}
				setIsAddingVideo={setIsAddingVideo}
				setSectionFormData={handlers.setSectionFormData}
				setTextFormData={handlers.setTextFormData}
				setVideoFormData={setVideoFormData}
				textFormData={handlers.textFormData}
				videoFormData={videoFormData}
			/>

			{handlers.isAddingSection && (
				<div className="rounded-lg border bg-muted/20 p-4">
					<AddNewSectionForm
						formData={handlers.sectionFormData}
						isSaveDisabled={!handlers.sectionFormData.title.trim()}
						onCancel={() => {
							handlers.setSectionFormData({ title: "" });
							handlers.setIsAddingSection(false);
						}}
						onSave={handlers.handleAddNewSection}
						setFormData={handlers.setSectionFormData}
					/>
				</div>
			)}

			<LinkList
				activeId={activeId}
				archivingLinkId={archivingLinkId}
				existingSections={existingSections}
				items={unifiedItems}
				linksManager={{
					isAdding,
					formData,
					setIsAdding,
					setFormData,
					existingSections,
					handleAddNewLink: handlers.handleAddNewLink,
				}}
				onAddLinkToSection={handlers.handleAddLinkToSection}
				onArchiveImage={handlers.handleArchiveImage}
				onArchiveLink={handlers.handleArchiveLink}
				onArchiveText={handlers.handleArchiveText}
				onArchiveVideo={handlers.handleArchiveVideo}
				onCancelEditing={handlers.handleCancelEditing}
				onCancelEditingImage={handlers.handleCancelEditingImage}
				onCancelEditingText={handlers.handleCancelEditingText}
				onCancelEditingVideo={handlers.handleCancelEditingVideo}
				onClickLink={handlers.handleClickLink}
				onDeleteImage={handlers.handleDeleteImage}
				onDeleteLink={handlers.handleDeleteLink}
				onDeleteText={handlers.handleDeleteText}
				onDeleteVideo={handlers.handleDeleteVideo}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onImageChange={handlers.handleImageChange}
				onLinkAdvancedChange={handlers.handleLinkAdvancedChange}
				onLinkChange={handlers.handleLinkChange}
				onRemoveCustomImage={handlers.handleRemoveCustomImage}
				onSaveEditing={handlers.saveEditing}
				onSaveEditingImage={handlers.handleSaveEditingImage}
				onSaveEditingText={handlers.handleSaveEditingText}
				onSaveEditingVideo={handlers.handleSaveEditingVideo}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onStartEditingImage={handlers.handleStartEditingImage}
				onStartEditingText={handlers.handleStartEditingText}
				onStartEditingVideo={handlers.handleStartEditingVideo}
				onTextChange={handlers.handleTextChange}
				onToggleActive={handlers.toggleActive}
				onUpdateCustomImage={handlers.handleUpdateCustomImage}
				onVideoChange={handlers.handleVideoChange}
				originalImage={originalImage}
				originalLink={originalLink}
				originalText={originalText}
				originalVideo={originalVideo}
				togglingImageId={togglingImageId}
				togglingLinkId={togglingLinkId}
				togglingSectionId={togglingSectionId}
				togglingTextId={togglingTextId}
				togglingVideoId={togglingVideoId}
			/>
		</div>
	);
};

export default LinksTabContent;

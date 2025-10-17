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
} from "../types/links.types";
import AddContentModal from "./links.AddContentModal";
import AddNewSectionForm from "./links.AddNewSectionForm";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	currentLinks: LinkItem[];
	currentSections: SectionItem[];
	currentTexts: TextItem[];
	currentVideos: VideoItem[];
	mutateLinks: () => Promise<any>;
	mutateSections: () => Promise<any>;
	mutateTexts: () => Promise<any>;
	mutateVideos: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	currentLinks,
	currentSections,
	currentTexts,
	currentVideos,
	mutateLinks,
	mutateSections,
	mutateTexts,
	mutateVideos,
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
		mutateLinks,
		mutateSections,
		mutateTexts,
		mutateVideos
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	return (
		<div className="space-y-4">
		<AddContentModal
			existingSections={existingSections}
			formData={formData}
			handleAddNewLink={handlers.handleAddNewLink}
			handleAddNewSection={handlers.handleAddNewSection}
			handleAddNewText={handlers.handleAddNewText}
			handleAddNewVideo={handlers.handleAddNewVideo}
			handleAddNewImage={handlers.handleAddNewImage}
			isAdding={isAdding}
			isAddingSection={handlers.isAddingSection}
			isAddingText={handlers.isAddingText}
			isAddingVideo={isAddingVideo}
			isAddingImage={isAddingImage}
			isOpen={isModalOpen}
			onClose={() => setIsModalOpen(false)}
			onOpen={() => setIsModalOpen(true)}
			sectionFormData={handlers.sectionFormData}
			setFormData={setFormData}
			setIsAdding={setIsAdding}
			setIsAddingSection={handlers.setIsAddingSection}
			setIsAddingText={handlers.setIsAddingText}
			setIsAddingVideo={setIsAddingVideo}
			setIsAddingImage={setIsAddingImage}
			setSectionFormData={handlers.setSectionFormData}
			setTextFormData={handlers.setTextFormData}
			setVideoFormData={setVideoFormData}
			setImageFormData={setImageFormData}
			textFormData={handlers.textFormData}
			videoFormData={videoFormData}
			imageFormData={imageFormData}
		/>

		{handlers.isAddingSection && (
			<div className="rounded-lg border bg-muted/20 p-4">
				<AddNewSectionForm
					formData={handlers.sectionFormData}
					setFormData={handlers.setSectionFormData}
					onSave={handlers.handleAddNewSection}
					onCancel={() => {
						handlers.setSectionFormData({ title: "" });
						handlers.setIsAddingSection(false);
					}}
					isSaveDisabled={!handlers.sectionFormData.title.trim()}
				/>
			</div>
		)}

			<LinkList
				activeId={activeId}
				archivingLinkId={archivingLinkId}
				items={unifiedItems}
				existingSections={existingSections}
				linksManager={{
					isAdding,
					formData,
					setIsAdding,
					setFormData,
					existingSections,
					handleAddNewLink: handlers.handleAddNewLink,
				}}
				onAddLinkToSection={handlers.handleAddLinkToSection}
				onArchiveLink={handlers.handleArchiveLink}
				onArchiveText={handlers.handleArchiveText}
				onArchiveVideo={handlers.handleArchiveVideo}
				onCancelEditing={handlers.handleCancelEditing}
				onCancelEditingText={handlers.handleCancelEditingText}
				onCancelEditingVideo={handlers.handleCancelEditingVideo}
				onCancelEditingImage={handlers.handleCancelEditingImage}
				onClickLink={handlers.handleClickLink}
				onDeleteLink={handlers.handleDeleteLink}
				onDeleteText={handlers.handleDeleteText}
				onDeleteVideo={handlers.handleDeleteVideo}
				onDeleteImage={handlers.handleDeleteImage}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onLinkChange={handlers.handleLinkChange}
				onRemoveCustomImage={handlers.handleRemoveCustomImage}
				onSaveEditing={handlers.saveEditing}
				onSaveEditingText={handlers.handleSaveEditingText}
				onSaveEditingVideo={handlers.handleSaveEditingVideo}
				onSaveEditingImage={handlers.handleSaveEditingImage}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onStartEditingText={handlers.handleStartEditingText}
				onStartEditingVideo={handlers.handleStartEditingVideo}
				onStartEditingImage={handlers.handleStartEditingImage}
				onTextChange={handlers.handleTextChange}
				onImageChange={handlers.handleImageChange}
				onToggleActive={handlers.toggleActive}
				onUpdateCustomImage={handlers.handleUpdateCustomImage}
				onVideoChange={handlers.handleVideoChange}
				onArchiveImage={handlers.handleArchiveImage}
				togglingVideoId={togglingVideoId}
				togglingImageId={togglingImageId}
				togglingLinkId={togglingLinkId}
				togglingTextId={togglingTextId}
				togglingSectionId={togglingSectionId}
				originalLink={originalLink}
				originalText={originalText}
				originalVideo={originalVideo}
				originalImage={originalImage}
			/>
		</div>
	);
};

export default LinksTabContent;

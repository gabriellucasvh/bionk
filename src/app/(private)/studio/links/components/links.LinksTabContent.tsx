// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { useLinksManager } from "../hooks/useLinksManager";
import type {
	EventItem,
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../types/links.types";
import AddNewEventForm from "./events.AddNewEventForm";
import AddContentModal from "./links.AddContentModal";
import AddNewSectionForm from "./links.AddNewSectionForm";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	currentLinks: LinkItem[];
	currentSections: SectionItem[];
	currentTexts: TextItem[];
	currentVideos: VideoItem[];
	currentImages: ImageItem[];
	currentMusics: MusicItem[];
	currentEvents: EventItem[];
	mutateLinks: () => Promise<any>;
	mutateSections: () => Promise<any>;
	mutateTexts: () => Promise<any>;
	mutateVideos: () => Promise<any>;
	mutateImages: () => Promise<any>;
	mutateMusics: () => Promise<any>;
	mutateEvents: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	currentLinks,
	currentSections,
	currentTexts,
	currentVideos,
	currentImages,
	currentMusics,
	currentEvents,
	mutateLinks,
	mutateSections,
	mutateTexts,
	mutateVideos,
	mutateImages,
	mutateMusics,
	mutateEvents,
}: LinksTabContentProps) => {
	const {
		unifiedItems,
		isAdding,
		isAddingVideo,
		isAddingImage,
		isAddingEvent,
		isAddingMusic,
		formData,
		videoFormData,
		imageFormData,
		musicFormData,
		existingSections,
		activeId,
		archivingLinkId,
		isModalOpen,
		togglingVideoId,
		togglingImageId,
		togglingMusicId,
		togglingEventId,
		togglingLinkId,
		togglingTextId,
		togglingSectionId,
		originalLink,
		originalText,
		originalVideo,
		originalImage,
		originalMusic,
		setActiveId,
		setIsAdding,
		setIsAddingVideo,
		setIsAddingImage,
		setIsAddingEvent,
		setIsAddingMusic,
		setFormData,
		setVideoFormData,
		setImageFormData,
		setMusicFormData,
		setIsModalOpen,
		handleDragEnd,
		...handlers
	} = useLinksManager(
		currentLinks,
		currentSections,
		currentTexts,
		currentVideos,
		currentImages,
		currentMusics,
		currentEvents,
		mutateLinks,
		mutateSections,
		mutateTexts,
		mutateVideos,
		mutateImages,
		mutateMusics,
		mutateEvents
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
				handleAddNewMusic={handlers.handleAddNewMusic}
				handleAddNewSection={handlers.handleAddNewSection}
				handleAddNewText={handlers.handleAddNewText}
				handleAddNewVideo={handlers.handleAddNewVideo}
				imageFormData={imageFormData}
				isAdding={isAdding}
				isAddingImage={isAddingImage}
				isAddingMusic={isAddingMusic}
				isAddingSection={handlers.isAddingSection}
				isAddingText={handlers.isAddingText}
				isAddingVideo={isAddingVideo}
				isOpen={isModalOpen}
				musicFormData={musicFormData}
				onClose={() => setIsModalOpen(false)}
				onOpen={() => setIsModalOpen(true)}
				sectionFormData={handlers.sectionFormData}
				setFormData={setFormData}
				setImageFormData={setImageFormData}
				setIsAdding={setIsAdding}
				setIsAddingEvent={(value: boolean) => {
					if (value) {
						handlers.closeAllActiveCreations();
					}
					setIsAddingEvent(value);
				}}
				setIsAddingImage={setIsAddingImage}
				setIsAddingMusic={setIsAddingMusic}
				setIsAddingSection={(value: boolean) => {
					if (value) {
						handlers.closeAllActiveCreations();
					}
					handlers.setIsAddingSection(value);
				}}
				setIsAddingText={handlers.setIsAddingText}
				setIsAddingVideo={setIsAddingVideo}
				setMusicFormData={setMusicFormData}
				setSectionFormData={handlers.setSectionFormData}
				setTextFormData={handlers.setTextFormData}
				setVideoFormData={setVideoFormData}
				textFormData={handlers.textFormData}
				videoFormData={videoFormData}
			/>

			{isAddingEvent && (
				<AddNewEventForm
					event={handlers.originalEvent as any}
					onClose={() => {
						setIsAddingEvent(false);
					}}
					onCreated={async () => {
						await mutateLinks();
						await mutateSections();
						await mutateTexts();
						await mutateVideos();
						await mutateImages();
						await mutateMusics();
						await mutateEvents();
						setIsAddingEvent(false);
					}}
					onSaved={async () => {
						await mutateLinks();
						await mutateSections();
						await mutateTexts();
						await mutateVideos();
						await mutateImages();
						await mutateMusics();
						await mutateEvents();
						setIsAddingEvent(false);
					}}
				/>
			)}

			{handlers.isAddingSection && (
				<AddNewSectionForm
					formData={handlers.sectionFormData}
					setFormData={handlers.setSectionFormData}
					onSave={async () => {
						await handlers.handleCreateNewSectionFromForm();
					}}
					onCancel={() => {
						handlers.setIsAddingSection(false);
						handlers.setSectionFormData({ title: "" });
					}}
					isSaveDisabled={!handlers.sectionFormData.title?.trim()}
				/>
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
				onSaveNewSection={handlers.handleSaveEditingSection}
				onCancelNewSection={handlers.handleCancelEditingSection}
				onArchiveImage={handlers.handleArchiveImage}
				onArchiveLink={handlers.handleArchiveLink}
				onArchiveMusic={handlers.handleArchiveMusic}
				onArchiveText={handlers.handleArchiveText}
				onArchiveVideo={handlers.handleArchiveVideo}
				onCancelEditing={handlers.handleCancelEditing}
				onCancelEditingImage={handlers.handleCancelEditingImage}
				onCancelEditingMusic={handlers.handleCancelEditingMusic}
				onCancelEditingText={handlers.handleCancelEditingText}
				onCancelEditingVideo={handlers.handleCancelEditingVideo}
				onClickLink={handlers.handleClickLink}
				onDeleteEvent={handlers.handleDeleteEvent}
				onDeleteImage={handlers.handleDeleteImage}
				onDeleteLink={handlers.handleDeleteLink}
				onDeleteMusic={handlers.handleDeleteMusic}
				onDeleteText={handlers.handleDeleteText}
				onDeleteVideo={handlers.handleDeleteVideo}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onImageChange={handlers.handleImageChange}
				onLinkAdvancedChange={handlers.handleLinkAdvancedChange}
				onLinkChange={handlers.handleLinkChange}
				onMusicChange={handlers.handleMusicChange}
				onRemoveCustomImage={handlers.handleRemoveCustomImage}
				onSaveEditing={handlers.saveEditing}
				onSaveEditingImage={handlers.handleSaveEditingImage}
				onSaveEditingMusic={handlers.handleSaveEditingMusic}
				onSaveEditingText={handlers.handleSaveEditingText}
				onSaveEditingVideo={handlers.handleSaveEditingVideo}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onStartEditingEvent={handlers.handleStartEditingEvent}
				onStartEditingImage={handlers.handleStartEditingImage}
				onStartEditingMusic={handlers.handleStartEditingMusic}
				onStartEditingText={handlers.handleStartEditingText}
				onStartEditingVideo={handlers.handleStartEditingVideo}
				onTextChange={handlers.handleTextChange}
				onToggleActive={handlers.toggleActive}
				onUpdateCustomImage={handlers.handleUpdateCustomImage}
				onVideoChange={handlers.handleVideoChange}
				originalImage={originalImage}
				originalLink={originalLink}
				originalMusic={originalMusic}
				originalText={originalText}
				originalVideo={originalVideo}
				togglingEventId={togglingEventId}
				togglingImageId={togglingImageId}
				togglingLinkId={togglingLinkId}
				togglingMusicId={togglingMusicId}
				togglingSectionId={togglingSectionId}
				togglingTextId={togglingTextId}
				togglingVideoId={togglingVideoId}
			/>
		</div>
	);
};

export default LinksTabContent;

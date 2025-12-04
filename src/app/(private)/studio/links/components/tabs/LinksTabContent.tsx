// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { useLinksManager } from "../../hooks/useLinksManager";
import type {
	EventItem,
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../../types/links.types";
import AddNewCountdownForm from "../forms/AddNewCountdownForm";
import AddNewEventForm from "../forms/AddNewEventForm";
import AddNewSectionForm from "../forms/AddNewSectionForm";
import LinkList from "../lists/LinkList";
import AddContentModal from "../modals/AddContentModal";

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
		isAddingEventCountdown,
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
		setIsAddingEventCountdown,
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
				setIsAddingEventCountdown={(value: boolean) => {
					if (value) {
						handlers.closeAllActiveCreations();
					}
					setIsAddingEventCountdown(value);
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
						handlers.setCreatingInSectionId(null);
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
						handlers.setCreatingInSectionId(null);
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
						handlers.setCreatingInSectionId(null);
					}}
					sectionId={handlers.creatingInSectionId as any}
				/>
			)}

			{isAddingEventCountdown && (
				<AddNewCountdownForm
					event={handlers.originalEvent as any}
					onClose={() => {
						setIsAddingEventCountdown(false);
					}}
					onCreated={async () => {
						await mutateLinks();
						await mutateSections();
						await mutateTexts();
						await mutateVideos();
						await mutateImages();
						await mutateMusics();
						await mutateEvents();
						setIsAddingEventCountdown(false);
					}}
					onSaved={async () => {
						await mutateLinks();
						await mutateSections();
						await mutateTexts();
						await mutateVideos();
						await mutateImages();
						await mutateMusics();
						await mutateEvents();
						setIsAddingEventCountdown(false);
					}}
				/>
			)}

			{handlers.isAddingSection && (
				<AddNewSectionForm
					formData={handlers.sectionFormData}
					isSaveDisabled={!handlers.sectionFormData.title?.trim()}
					onCancel={() => {
						handlers.setIsAddingSection(false);
						handlers.setSectionFormData({ title: "" });
					}}
					onSave={async () => {
						await handlers.handleCreateNewSectionFromForm();
					}}
					setFormData={handlers.setSectionFormData}
				/>
			)}

			<LinkList
				activeId={activeId}
				archivingLinkId={archivingLinkId}
				existingSections={existingSections}
				handleCancelEditingEvent={handlers.handleCancelEditingEvent}
				handleSaveEditingEvent={handlers.handleSaveEditingEvent}
				items={unifiedItems}
				linksManager={{
					isAdding,
					formData,
					setIsAdding,
					setFormData,
					existingSections,
					handleAddNewLink: handlers.handleAddNewLink,
					openAddContentModalForSection: handlers.openAddContentModalForSection,
				}}
				onAddLinkToSection={handlers.handleAddLinkToSection}
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
				onCancelNewSection={handlers.handleCancelEditingSection}
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
				onSaveNewSection={handlers.handleSaveEditingSection}
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
				originalEvent={handlers.originalEvent as any}
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

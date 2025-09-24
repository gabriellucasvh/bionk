// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { useLinksManager } from "../hooks/useLinksManager";
import type { LinkItem, SectionItem, TextItem } from "../types/links.types";
import AddContentModal from "./links.AddContentModal";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	initialSections: SectionItem[];
	initialTexts: TextItem[];
	mutateLinks: () => Promise<any>;
	mutateSections: () => Promise<any>;
	mutateTexts: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	initialLinks,
	initialSections,
	initialTexts,
	mutateLinks,
	mutateSections,
	mutateTexts,
}: LinksTabContentProps) => {
	const {
		unifiedItems,
		isAdding,
		isAddingVideo,
		formData,
		videoFormData,
		existingSections,
		activeId,
		archivingLinkId,
		isModalOpen,
		setActiveId,
		setIsAdding,
		setIsAddingVideo,
		setFormData,
		setVideoFormData,
		setIsModalOpen,
		handleDragEnd,
		...handlers
	} = useLinksManager(
		initialLinks,
		initialSections,
		initialTexts,
		mutateLinks,
		mutateSections,
		mutateTexts
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
				isAdding={isAdding}
				isAddingSection={handlers.isAddingSection}
				isAddingText={handlers.isAddingText}
				isAddingVideo={isAddingVideo}
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onOpen={() => setIsModalOpen(true)}
				sectionFormData={handlers.sectionFormData}
				setFormData={setFormData}
				setIsAdding={setIsAdding}
				setIsAddingSection={handlers.setIsAddingSection}
				setIsAddingText={handlers.setIsAddingText}
				setIsAddingVideo={setIsAddingVideo}
				setSectionFormData={handlers.setSectionFormData}
				setTextFormData={handlers.setTextFormData}
				setVideoFormData={setVideoFormData}
				textFormData={handlers.textFormData}
				videoFormData={videoFormData}
			/>

			<LinkList
				activeId={activeId}
				archivingLinkId={archivingLinkId}
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
				onArchiveLink={handlers.handleArchiveLink}
				onArchiveText={handlers.handleArchiveText}
				onCancelEditing={handlers.handleCancelEditing}
				onCancelEditingText={handlers.handleCancelEditingText}
				onClickLink={handlers.handleClickLink}
				onDeleteLink={handlers.handleDeleteLink}
				onDeleteText={handlers.handleDeleteText}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onLinkChange={handlers.handleLinkChange}
				onRemoveCustomImage={handlers.handleRemoveCustomImage}
				onSaveEditing={handlers.saveEditing}
				onSaveEditingText={handlers.handleSaveEditingText}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onStartEditingText={handlers.handleStartEditingText}
				onTextChange={handlers.handleTextChange}
				onToggleActive={handlers.toggleActive}
				onUpdateCustomImage={handlers.handleUpdateCustomImage}
			/>
		</div>
	);
};

export default LinksTabContent;

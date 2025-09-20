// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import type { LinkItem, SectionItem, TextItem } from "../types/links.types";
import { useLinksManager } from "../hooks/useLinksManager";
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
		formData,
		existingSections,
		activeId,
		archivingLinkId,
		setActiveId,
		setIsAdding,
		setFormData,
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
				isAdding={isAdding}
				isAddingSection={handlers.isAddingSection}
				isAddingText={handlers.isAddingText}
				formData={formData}
				sectionFormData={handlers.sectionFormData}
				textFormData={handlers.textFormData}
				existingSections={existingSections}
				setIsAdding={setIsAdding}
				setIsAddingSection={handlers.setIsAddingSection}
				setIsAddingText={handlers.setIsAddingText}
				setFormData={setFormData}
				setSectionFormData={handlers.setSectionFormData}
				setTextFormData={handlers.setTextFormData}
				handleAddNewLink={handlers.handleAddNewLink}
				handleAddNewSection={handlers.handleAddNewSection}
				handleAddNewText={handlers.handleAddNewText}
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
				onCancelEditing={handlers.handleCancelEditing}
				onClickLink={handlers.handleClickLink}
				onDeleteLink={handlers.handleDeleteLink}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onLinkChange={handlers.handleLinkChange}
				onRemoveCustomImage={handlers.handleRemoveCustomImage}
				onSaveEditing={handlers.saveEditing}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onToggleActive={handlers.toggleActive}
				onUpdateCustomImage={handlers.handleUpdateCustomImage}
				onDeleteText={handlers.handleDeleteText}
				onArchiveText={handlers.handleArchiveText}
				onStartEditingText={handlers.handleStartEditingText}
				onTextChange={handlers.handleTextChange}
				onSaveEditingText={handlers.handleSaveEditingText}
				onCancelEditingText={handlers.handleCancelEditingText}
			/>
		</div>
	);
};

export default LinksTabContent;

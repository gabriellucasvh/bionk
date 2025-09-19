// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import type { Session } from "next-auth";
import { useLinksManager } from "../hooks/useLinksManager";
import type { LinkItem, SectionItem } from "../types/links.types";
import AddContentModal from "./links.AddContentModal";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	initialSections: SectionItem[];
	mutateLinks: () => Promise<any>;
	mutateSections: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	initialLinks,
	initialSections,
	mutateLinks,
	mutateSections,
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
		mutateLinks,
		mutateSections
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	return (
		<div className="space-y-4">
			{!(isAdding || handlers.isAddingSection) && (
				<AddContentModal
					isAdding={isAdding}
					isAddingSection={handlers.isAddingSection}
					formData={formData}
					sectionFormData={handlers.sectionFormData}
					existingSections={existingSections}
					setIsAdding={setIsAdding}
					setIsAddingSection={handlers.setIsAddingSection}
					setFormData={setFormData}
					setSectionFormData={handlers.setSectionFormData}
					handleAddNewLink={handlers.handleAddNewLink}
					handleAddNewSection={handlers.handleAddNewSection}
				/>
			)}

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
			/>
		</div>
	);
};

export default LinksTabContent;

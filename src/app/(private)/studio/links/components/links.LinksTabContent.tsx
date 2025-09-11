// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import type { DragStartEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Session } from "next-auth";
import { BaseButton } from "@/components/buttons/BaseButton";
import { useLinksManager } from "../hooks/useLinksManager";
import type { LinkItem, SectionItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import AddNewSectionForm from "./links.AddNewSectionForm";
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
		activeId, // <<< Adicionado
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
				<div className="flex gap-2">
					<BaseButton
						className="w-full sm:w-auto"
						onClick={() => setIsAdding(true)}
					>
						<span className="flex items-center justify-center">
							<Plus className="mr-1 h-4 w-4" /> Adicionar link
						</span>
					</BaseButton>

					<BaseButton
						className="w-full sm:w-auto"
						onClick={() => handlers.setIsAddingSection(true)}
						variant="white"
					>
						<span className="flex items-center justify-center">
							<Plus className="mr-1 h-4 w-4" /> Criar seção
						</span>
					</BaseButton>
				</div>
			)}

			{isAdding && (
				<AddNewLinkForm
					existingSections={existingSections}
					formData={formData}
					isSaveDisabled={
						!isValidUrl(formData.url) || formData.title.trim().length === 0
					}
					onCancel={() => setIsAdding(false)}
					onSave={handlers.handleAddNewLink}
					setFormData={setFormData}
				/>
			)}

			{handlers.isAddingSection && (
				<AddNewSectionForm
					existingSections={existingSections}
					formData={handlers.sectionFormData}
					isSaveDisabled={handlers.sectionFormData.title.trim().length === 0}
					onCancel={() => handlers.setIsAddingSection(false)}
					onSave={handlers.handleAddNewSection}
					setFormData={handlers.setSectionFormData}
				/>
			)}

			<LinkList
				activeId={activeId} // <<< Adicionado
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

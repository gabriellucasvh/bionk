// src/app/(private)/studio/links/components/links.LinksTabContent.tsx
"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import type { DragStartEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Session } from "next-auth";
import { useLinksManager } from "../hooks/useLinksManager";
import type { LinkItem } from "../types/links.types";
import { isValidUrl } from "../utils/links.helpers";
import AddNewLinkForm from "./links.AddNewLinkForm";
import LinkList from "./links.LinkList";

interface LinksTabContentProps {
	initialLinks: LinkItem[];
	mutateLinks: () => Promise<any>;
	session: Session | null;
}

const LinksTabContent = ({
	initialLinks,
	mutateLinks,
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
	} = useLinksManager(initialLinks, mutateLinks);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id.toString());
	};

	return (
		<div className="space-y-4">
			{!isAdding && (
				<BaseButton
					className="w-full sm:w-auto"
					onClick={() => setIsAdding(true)}
				>
					<span className="flex items-center justify-center">
						<Plus className="mr-1 h-4 w-4" /> Adicionar novo link
					</span>
				</BaseButton>
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

			<LinkList
				activeId={activeId} // <<< Adicionado
				items={unifiedItems}
				onArchiveLink={handlers.handleArchiveLink}
				onCancelEditing={handlers.handleCancelEditing}
				onClickLink={handlers.handleClickLink}
				onDeleteLink={handlers.handleDeleteLink}
				onDragEnd={handleDragEnd}
				onDragStart={handleDragStart}
				onLinkChange={handlers.handleLinkChange}
				onSaveEditing={handlers.saveEditing}
				onSectionDelete={handlers.handleSectionDelete}
				onSectionUngroup={handlers.handleSectionUngroup}
				onSectionUpdate={handlers.handleSectionUpdate}
				onStartEditing={handlers.handleStartEditing}
				onToggleActive={handlers.toggleActive}
				onToggleSensitive={handlers.toggleSensitive}
			/>
		</div>
	);
};

export default LinksTabContent;

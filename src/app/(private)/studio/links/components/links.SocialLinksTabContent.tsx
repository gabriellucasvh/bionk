// app/studio/links/components/SocialLinksTabContent.tsx

"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import type { SocialLinkItem, SocialPlatform } from "@/types/social";
import { Edit, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SocialLinksTabContentProps {
	initialSocialLinks: SocialLinkItem[];
	mutateSocialLinks: () => Promise<any>;
	session: Session | null;
}

const SocialLinksTabContent = ({
	initialSocialLinks,
	mutateSocialLinks,
	session,
}: SocialLinksTabContentProps) => {
	const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
	const [selectedPlatform, setSelectedPlatform] =
		useState<SocialPlatform | null>(null);
	const [usernameInput, setUsernameInput] = useState<string>("");
	const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
	const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const sorted = [...initialSocialLinks].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0)
		);
		setSocialLinks(sorted);
	}, [initialSocialLinks]);

	const handlePlatformSelect = (platform: SocialPlatform) => {
		setSelectedPlatform(platform);
		setUsernameInput("");
		setEditingLinkId(null);
	};

	const handleAddOrUpdateSocialLink = async () => {
		if (!(selectedPlatform && usernameInput.trim() && session?.user?.id)) {
			return;
		}
		setIsSaving(true);
		const fullUrl = `${selectedPlatform.baseUrl}${usernameInput.trim()}`;
		const payload = {
			userId: session.user.id,
			platform: selectedPlatform.key,
			username: usernameInput.trim(),
			url: fullUrl,
			active: true,
		};
		try {
			const response = editingLinkId
				? await fetch(`/api/social-links/${editingLinkId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							username: usernameInput.trim(),
							url: fullUrl,
						}),
					})
				: await fetch("/api/social-links", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});
			if (response.ok) {
				await mutateSocialLinks();
				handleCancel();
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleEditSocialLink = (link: SocialLinkItem) => {
		const platform = SOCIAL_PLATFORMS.find((p) => p.key === link.platform);
		if (platform) {
			setSelectedPlatform(platform);
			setUsernameInput(link.username || "");
			setEditingLinkId(link.id);
		}
	};

	const handleDeleteSocialLink = async (linkId: string) => {
		if (!session?.user?.id) {
			return;
		}
		setDeletingLinkId(linkId);
		try {
			const response = await fetch(`/api/social-links/${linkId}`, {
				method: "DELETE",
			});
			if (response.ok) {
				await mutateSocialLinks();
				if (editingLinkId === linkId) {
					handleCancel();
				}
			}
		} finally {
			setDeletingLinkId(null);
		}
	};

	const handleCancel = () => {
		setSelectedPlatform(null);
		setUsernameInput("");
		setEditingLinkId(null);
	};

	return (
		<div className="space-y-6 pb-10">
			{!selectedPlatform && (
				<div className="space-y-3">
					<p className="font-medium text-sm">
						Clique em um ícone para adicionar ou editar uma rede social:
					</p>
					<div className="grid grid-cols-4 xs:grid-cols-5 gap-2 sm:grid-cols-6 sm:gap-3 md:grid-cols-7 lg:grid-cols-8">
						{SOCIAL_PLATFORMS.map((platform) => {
							const existingLink = socialLinks.find(
								(link) => link.platform === platform.key
							);
							return (
								<Button
									className={`flex h-20 w-full flex-col items-center justify-center p-1 transition-colors hover:bg-muted/50 sm:p-2 ${
										existingLink
											? "border-green-400 hover:border-green-500"
											: ""
									}`}
									key={platform.key}
									onClick={() =>
										existingLink
											? handleEditSocialLink(existingLink)
											: handlePlatformSelect(platform)
									}
									title={
										existingLink
											? `Editar ${platform.name}`
											: `Adicionar ${platform.name}`
									}
									variant="outline"
								>
									<Image
										alt={platform.name}
										className="mb-1 h-7 w-7 sm:mb-1.5"
										height={28}
										src={platform.icon}
										width={28}
									/>
									<span className="w-full truncate text-center text-xs">
										{platform.name}
									</span>
								</Button>
							);
						})}
					</div>
				</div>
			)}

			{selectedPlatform && (
				<div className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<div className="flex items-center gap-3">
						<Image
							alt={selectedPlatform.name}
							height={32}
							src={selectedPlatform.icon}
							width={32}
						/>
						<h3 className="font-semibold text-lg sm:text-xl">
							{selectedPlatform.name}
						</h3>
					</div>
					<div>
						<Label
							className="text-muted-foreground text-xs sm:text-sm"
							htmlFor="usernameInput"
						>
							{selectedPlatform.baseUrl}
							<span className="font-medium text-primary">
								{usernameInput || selectedPlatform.placeholder}
							</span>
						</Label>
						<div className="mt-1 flex items-center gap-2">
							<Input
								autoFocus
								className="flex-grow text-sm sm:text-base"
								id="usernameInput"
								onChange={(e) => setUsernameInput(e.target.value)}
								placeholder={selectedPlatform.placeholder}
								type="text"
								value={usernameInput}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-2 pt-2 sm:flex-row">
						<BaseButton
							className="w-full flex-grow sm:w-auto"
							loading={isSaving}
							onClick={handleAddOrUpdateSocialLink}
						>
							<span className="flex items-center justify-center">
								{editingLinkId ? (
									<Save className="mr-2 h-4 w-4" />
								) : (
									<Plus className="mr-2 h-4 w-4" />
								)}
								{editingLinkId ? "Salvar Alterações" : "Adicionar Link"}
							</span>
						</BaseButton>
						<BaseButton
							className="w-full sm:w-auto"
							onClick={handleCancel}
							variant="white"
						>
							<span className="flex items-center justify-center">
								<X className="mr-2 h-4 w-4" />
								Cancelar
							</span>
						</BaseButton>
					</div>
				</div>
			)}

			{socialLinks.length > 0 && (
				<div className="space-y-3 border-t pt-4">
					<h4 className="font-medium text-sm sm:text-base">
						Suas Redes Sociais Adicionadas:
					</h4>
					<ul className="space-y-2">
						{socialLinks.map((link) => {
							const platform = SOCIAL_PLATFORMS.find(
								(p) => p.key === link.platform
							);
							return (
								<li
									className="flex items-center justify-between rounded-lg border bg-background p-2.5 transition-colors hover:bg-muted/30"
									key={link.id}
								>
									<div className="flex min-w-0 flex-grow items-center gap-2 sm:gap-3">
										{platform && (
											<Image
												alt={platform.name}
												className="h-6 w-6"
												height={24}
												src={platform.icon}
												width={24}
											/>
										)}
										<div className="flex min-w-0 flex-col">
											<span className="truncate font-medium text-sm">
												{platform?.name || link.platform}
											</span>
											<a
												className="truncate text-muted-foreground text-xs hover:underline"
												href={link.url}
												rel="noopener noreferrer"
												target="_blank"
											>
												{link.username}
											</a>
										</div>
									</div>
									<div className="ml-2 flex flex-shrink-0 items-center gap-1 sm:gap-2">
										<Button
											className="h-8 w-8"
											onClick={() => handleEditSocialLink(link)}
											size="icon"
											variant="ghost"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											className="h-8 w-8 text-destructive hover:text-destructive/80"
											disabled={deletingLinkId === link.id}
											onClick={() => handleDeleteSocialLink(link.id)}
											size="icon"
											variant="ghost"
										>
											{deletingLinkId === link.id ? (
												<Loader2
													aria-label="Deletando..."
													className="h-4 w-4 animate-spin"
												/>
											) : (
												<Trash2 className="h-4 w-4" />
											)}
										</Button>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
};

export default SocialLinksTabContent;

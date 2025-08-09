// app/dashboard/links/components/SocialLinksTabContent.tsx

"use client";

import { Edit, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import type { SocialLinkItem, SocialPlatform } from "@/types/social";

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
			(a, b) => (a.order ?? 0) - (b.order ?? 0),
		);
		setSocialLinks(sorted);
	}, [initialSocialLinks]);

	const handlePlatformSelect = (platform: SocialPlatform) => {
		setSelectedPlatform(platform);
		setUsernameInput("");
		setEditingLinkId(null);
	};

	const handleAddOrUpdateSocialLink = async () => {
		if (!selectedPlatform || !usernameInput.trim() || !session?.user?.id)
			return;
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
			} else {
				console.error("Erro ao salvar link social:", await response.json());
			}
		} catch (error) {
			console.error("Erro na requisição:", error);
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
		if (!session?.user?.id) return;
		setDeletingLinkId(linkId);
		try {
			const response = await fetch(`/api/social-links/${linkId}`, {
				method: "DELETE",
			});
			if (response.ok) {
				await mutateSocialLinks();
				if (editingLinkId === linkId) handleCancel();
			} else {
				console.error("Erro ao deletar link social");
			}
		} catch (error) {
			console.error("Erro na requisição de delete:", error);
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
		<div className="space-y-6">
			{!selectedPlatform && (
				<div className="space-y-3">
					<p className="font-medium text-sm">
						Clique em um ícone para adicionar ou editar uma rede social:
					</p>
					<div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 sm:gap-3">
						{SOCIAL_PLATFORMS.map((platform) => {
							const existingLink = socialLinks.find(
								(link) => link.platform === platform.key,
							);
							return (
								<Button
									key={platform.key}
									variant="outline"
									className={`flex flex-col items-center justify-center h-20 w-full p-1 sm:p-2 hover:bg-muted/50 transition-colors ${
										existingLink
											? "border-green-400 hover:border-green-500"
											: ""
									}`}
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
								>
									<Image
										src={platform.icon}
										alt={platform.name}
										width={28}
										height={28}
										className="mb-1 sm:mb-1.5 w-7 h-7"
									/>
									<span className="text-xs text-center truncate w-full">
										{platform.name}
									</span>
								</Button>
							);
						})}
					</div>
				</div>
			)}

			{selectedPlatform && (
				<div className="p-4 border rounded-lg space-y-4 bg-muted/20">
					<div className="flex items-center gap-3">
						<Image
							src={selectedPlatform.icon}
							alt={selectedPlatform.name}
							width={32}
							height={32}
						/>
						<h3 className="font-semibold text-lg sm:text-xl">
							{selectedPlatform.name}
						</h3>
					</div>
					<div>
						<Label
							htmlFor="usernameInput"
							className="text-xs sm:text-sm text-muted-foreground"
						>
							{selectedPlatform.baseUrl}
							<span className="text-primary font-medium">
								{usernameInput || selectedPlatform.placeholder}
							</span>
						</Label>
						<div className="flex items-center gap-2 mt-1">
							<Input
								id="usernameInput"
								type="text"
								value={usernameInput}
								onChange={(e) => setUsernameInput(e.target.value)}
								placeholder={selectedPlatform.placeholder}
								className="flex-grow text-sm sm:text-base"
								autoFocus
							/>
						</div>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 pt-2">
						<BaseButton
							onClick={handleAddOrUpdateSocialLink}
							className="w-full sm:w-auto flex-grow"
							loading={isSaving}
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
							variant="white"
							onClick={handleCancel}
							className="w-full sm:w-auto"
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
				<div className="space-y-3 pt-4 border-t">
					<h4 className="font-medium text-sm sm:text-base">
						Suas Redes Sociais Adicionadas:
					</h4>
					<ul className="space-y-2">
						{socialLinks.map((link) => {
							const platform = SOCIAL_PLATFORMS.find(
								(p) => p.key === link.platform,
							);
							return (
								<li
									key={link.id}
									className="flex items-center justify-between p-2.5 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
								>
									<div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
										{platform && (
											<Image
												src={platform.icon}
												alt={platform.name}
												width={24}
												height={24}
												className="w-6 h-6"
											/>
										)}
										<div className="flex flex-col min-w-0">
											<span className="text-sm font-medium truncate">
												{platform?.name || link.platform}
											</span>
											<a
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs text-muted-foreground hover:underline truncate"
											>
												{link.username}
											</a>
										</div>
									</div>
									<div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={() => handleEditSocialLink(link)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive hover:text-destructive/80"
											onClick={() => handleDeleteSocialLink(link.id)}
											disabled={deletingLinkId === link.id}
										>
											{deletingLinkId === link.id ? (
												<Loader2
													className="animate-spin h-4 w-4"
													aria-label="Deletando..."
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

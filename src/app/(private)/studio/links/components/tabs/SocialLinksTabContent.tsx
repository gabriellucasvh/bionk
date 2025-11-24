// src/app/(private)/studio/links/components/links.SocialLinksTabContent.tsx
"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import type { SocialLinkItem, SocialPlatform } from "@/types/social";
import { useDragGesture } from "../../hooks/useDragGesture";
import MobileBottomSheet from "../shared/MobileBottomSheet";
import { SortableSocialLinkItem } from "../sortable/SortableSocialLinkItem";

const REGEX_URL = /^https?:\/\//i;
const APPSTORE_REGEX = /id(\d+)/;

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
	const [originalUsername, setOriginalUsername] = useState<string>("");
	const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const USERNAME_ONLY = new Set(["instagram", "threads", "x", "tiktok"]);

	const getExamplePlaceholder = (platform: SocialPlatform) => {
		if (USERNAME_ONLY.has(platform.key)) {
			const map: Record<string, string> = {
				instagram: "instagramuser",
				threads: "threadsuser",
				x: "xuser",
				tiktok: "tiktokuser",
			};
			return `Ex.: ${map[platform.key]}`;
		}
		return `Ex.: ${platform.baseUrl}${platform.placeholder}`;
	};

	const isUrlInput = (value: string) => {
		const v = value.trim();
		return REGEX_URL.test(v);
	};

	const getPlatformHostname = (platform: SocialPlatform) => {
		try {
			const u = new URL(platform.baseUrl);
			const h = u.hostname;
			return h.startsWith("www.") ? h.slice(4) : h;
		} catch {
			return "";
		}
	};

	const isFromCorrectDomain = (platform: SocialPlatform, value: string) => {
		try {
			const u = new URL(value.trim());
			const hostRaw = u.hostname.toLowerCase();
			const host = hostRaw.startsWith("www.") ? hostRaw.slice(4) : hostRaw;
			const expected = getPlatformHostname(platform).toLowerCase();
			if (!expected) {
				return false;
			}
			return host === expected || host.endsWith(`.${expected}`);
		} catch {
			return false;
		}
	};

	const extractUsernameFromUrl = (platform: SocialPlatform, value: string) => {
		try {
			const u = new URL(value.trim());
			if (platform.key === "google-play") {
				const id = u.searchParams.get("id");
				if (id) {
					return id;
				}
			}
			if (platform.key === "appstore") {
				const m = u.pathname.match(APPSTORE_REGEX);
				if (m) {
					return m[1];
				}
			}
			const parts = u.pathname.split("/").filter(Boolean);
			if (parts.length > 0) {
				return parts.at(-1);
			}
			return value.trim();
		} catch {
			return value.trim();
		}
	};

	const EXTRA_KEYS = new Set([
		"appstore",
		"epidemic-sound",
		"google-play",
		"sympla",
		"tidal",
		"vsco",
		"vimeo",
		"audiomack",
		"applemusic",
	]);

	const extraPlatforms = SOCIAL_PLATFORMS.filter((p) => EXTRA_KEYS.has(p.key));
	const visiblePlatforms = SOCIAL_PLATFORMS.filter(
		(p) => !EXTRA_KEYS.has(p.key)
	);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const handleCloseMoreModal = () => {
		setIsMoreModalOpen(false);
	};

	const {
		isDragging,
		dragY,
		isClosing,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	} = useDragGesture(handleCloseMoreModal);

	useEffect(() => {
		if (isMoreModalOpen && isMobile) {
			setIsAnimating(true);
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("touchmove", handleTouchMove);
			document.addEventListener("touchend", handleTouchEnd);
		} else if (!isMoreModalOpen) {
			setIsAnimating(false);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [
		isMoreModalOpen,
		isMobile,
		handleMouseMove,
		handleMouseUp,
		handleTouchMove,
		handleTouchEnd,
	]);

	useEffect(() => {
		const sorted = [...initialSocialLinks].sort(
			(a, b) => (a.order ?? 0) - (b.order ?? 0)
		);
		setSocialLinks(sorted);
	}, [initialSocialLinks]);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = socialLinks.findIndex((link) => link.id === active.id);
			const newIndex = socialLinks.findIndex((link) => link.id === over.id);

			const newOrder = arrayMove(socialLinks, oldIndex, newIndex);
			setSocialLinks(newOrder);

			const orderedLinks = newOrder.map((link, index) => ({
				id: link.id,
				order: index,
			}));

			try {
				await fetch("/api/social-links/reorder", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ orderedLinks }),
				});
				await mutateSocialLinks();
			} catch {
				setSocialLinks(socialLinks);
			}
		}
	};

	const handlePlatformSelect = (platform: SocialPlatform) => {
		setSelectedPlatform(platform);
		setUsernameInput("");
		setEditingLinkId(null);
		setOriginalUsername("");
	};

	const handleAddOrUpdateSocialLink = async () => {
		if (!(selectedPlatform && usernameInput.trim() && session?.user?.id)) {
			return;
		}
		setIsSaving(true);
		const isUsernameMode = USERNAME_ONLY.has(selectedPlatform.key);
		const fullUrl = isUsernameMode
			? `${selectedPlatform.baseUrl}${usernameInput.trim()}`
			: usernameInput.trim();
		const effectiveUsername = isUsernameMode
			? usernameInput.trim()
			: extractUsernameFromUrl(selectedPlatform, usernameInput);
		const payload = {
			userId: session.user.id,
			platform: selectedPlatform.key,
			username: effectiveUsername,
			url: fullUrl,
			active: true,
		};
		try {
			const response = editingLinkId
				? await fetch(`/api/social-links/${editingLinkId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							username: effectiveUsername,
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
			const isUsernameMode = USERNAME_ONLY.has(platform.key);
			setUsernameInput(isUsernameMode ? link.username || "" : link.url || "");
			setEditingLinkId(link.id);
			setOriginalUsername(link.username || "");
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
		setOriginalUsername("");
	};

	// Validação para habilitar/desabilitar o botão Salvar
	const isSaveButtonDisabled = () => {
		// Campo vazio
		if (!usernameInput.trim()) {
			return true;
		}

		// Durante edição, verificar se houve mudança
		if (editingLinkId && usernameInput.trim() === originalUsername.trim()) {
			return true;
		}

		const isUrl = isUrlInput(usernameInput);
		const isUsernameMode = selectedPlatform
			? USERNAME_ONLY.has(selectedPlatform.key)
			: false;
		if (!isUsernameMode) {
			if (
				!(
					selectedPlatform &&
					isUrl &&
					isFromCorrectDomain(selectedPlatform, usernameInput)
				)
			) {
				return true;
			}
		} else if (selectedPlatform?.pattern) {
			try {
				const re = new RegExp(selectedPlatform.pattern);
				if (!re.test(usernameInput.trim())) {
					return true;
				}
			} catch {}
		}

		return false;
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const currentValue = e.target.value;
		if (selectedPlatform?.key === "whatsapp") {
			const numbers = currentValue.replace(/[^\d]/g, "");
			if (currentValue.startsWith("+")) {
				setUsernameInput(`+${numbers}`);
			} else {
				setUsernameInput(numbers);
			}
		} else {
			const v = currentValue;
			const isUsernameMode = selectedPlatform
				? USERNAME_ONLY.has(selectedPlatform.key)
				: false;
			if (isUsernameMode) {
				setUsernameInput(v.replace(/\s/g, ""));
			} else if (isUrlInput(v)) {
				setUsernameInput(v.trim());
			} else {
				setUsernameInput(v);
			}
		}
	};

	return (
		<div className="space-y-6 pb-10">
			{!selectedPlatform && (
				<div className="space-y-3">
					<p className="font-medium text-sm">
						Clique em um ícone para adicionar ou editar uma rede social:
					</p>
					<div className="grid grid-cols-4 xs:grid-cols-5 gap-2 sm:grid-cols-6 sm:gap-3 md:grid-cols-7 lg:grid-cols-8">
						{visiblePlatforms.map((platform) => {
							const existingLink = socialLinks.find(
								(link) => link.platform === platform.key
							);
							return (
								<Button
									className={`flex h-20 w-full flex-col items-center justify-center rounded-xl p-1 transition-colors hover:bg-muted/50 sm:p-2 ${
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
									<div
										className="mb-1 h-7 w-7 sm:mb-1.5"
										style={{
											backgroundColor: platform.color,
											maskImage: `url(${platform.icon})`,
											maskSize: "contain",
											maskRepeat: "no-repeat",
											maskPosition: "center",
										}}
									/>
									<span className="w-full truncate text-center text-xs">
										{platform.name}
									</span>
								</Button>
							);
						})}
						<Button
							aria-label="Mais Ícones"
							className="flex h-20 w-full flex-col items-center justify-center rounded-xl p-1 transition-colors hover:bg-muted/50 sm:p-2"
							onClick={() => setIsMoreModalOpen(true)}
							variant="outline"
						>
							<Plus className="h-7 w-7" />
						</Button>
					</div>
				</div>
			)}

			{!isMobile && (
				<Dialog onOpenChange={setIsMoreModalOpen} open={isMoreModalOpen}>
					<DialogContent className="min-w-[20vw] max-w-3xl">
						<DialogHeader>
							<DialogTitle>Mais Ícones</DialogTitle>
						</DialogHeader>
						<div className="space-y-2">
							{extraPlatforms.map((platform) => {
								const existingLink = socialLinks.find(
									(link) => link.platform === platform.key
								);
								return (
									<Button
										className={`flex h-12 w-full items-center justify-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50 ${
											existingLink
												? "border-green-400 hover:border-green-500"
												: ""
										}`}
										key={platform.key}
										onClick={() => {
											if (existingLink) {
												handleEditSocialLink(existingLink);
											} else {
												handlePlatformSelect(platform);
											}
											setIsMoreModalOpen(false);
										}}
										title={
											existingLink
												? `Editar ${platform.name}`
												: `Adicionar ${platform.name}`
										}
										variant="outline"
									>
										<div
											className="h-6 w-6"
											style={{
												backgroundColor: platform.color,
												maskImage: `url(${platform.icon})`,
												maskSize: "contain",
												maskRepeat: "no-repeat",
												maskPosition: "center",
											}}
										/>
										<span className="truncate font-medium text-sm">
											{platform.name}
										</span>
									</Button>
								);
							})}
						</div>
					</DialogContent>
				</Dialog>
			)}

			{isMobile && (
				<MobileBottomSheet
					dragY={dragY}
					isAnimating={isAnimating}
					isClosing={isClosing}
					isDragging={isDragging}
					isOpen={isMoreModalOpen}
					onClose={handleCloseMoreModal}
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
				>
					<h2 className="mb-6 text-center font-semibold text-lg">
						Mais Ícones
					</h2>
					<div className="space-y-2">
						{extraPlatforms.map((platform) => {
							const existingLink = socialLinks.find(
								(link) => link.platform === platform.key
							);
							return (
								<Button
									className={`flex h-12 w-full items-center justify-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50 ${
										existingLink
											? "border-green-400 hover:border-green-500"
											: ""
									}`}
									key={platform.key}
									onClick={() => {
										if (existingLink) {
											handleEditSocialLink(existingLink);
										} else {
											handlePlatformSelect(platform);
										}
										handleCloseMoreModal();
									}}
									title={
										existingLink
											? `Editar ${platform.name}`
											: `Adicionar ${platform.name}`
									}
									variant="outline"
								>
									<div
										className="h-6 w-6"
										style={{
											backgroundColor: platform.color,
											maskImage: `url(${platform.icon})`,
											maskSize: "contain",
											maskRepeat: "no-repeat",
											maskPosition: "center",
										}}
									/>
									<span className="truncate font-medium text-sm">
										{platform.name}
									</span>
								</Button>
							);
						})}
					</div>
				</MobileBottomSheet>
			)}

			{selectedPlatform && (
				<div className="space-y-4 rounded-lg border bg-white p-4 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div
							className="h-8 w-8"
							style={{
								backgroundColor: selectedPlatform.color,
								maskImage: `url(${selectedPlatform.icon})`,
								maskSize: "contain",
								maskRepeat: "no-repeat",
								maskPosition: "center",
							}}
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
							{getExamplePlaceholder(selectedPlatform)}
						</Label>
						<div className="mt-1 flex items-center gap-2">
							<Input
								autoFocus
								className="flex-grow text-sm sm:text-base"
								id="usernameInput"
								onChange={handleUsernameChange}
								placeholder={getExamplePlaceholder(selectedPlatform)}
								type={
									USERNAME_ONLY.has(selectedPlatform.key)
										? selectedPlatform.key === "whatsapp"
											? "tel"
											: "text"
										: "url"
								}
								value={usernameInput}
							/>
						</div>
						{selectedPlatform.key === "whatsapp" && (
							<p className="mt-2 text-muted-foreground text-xs">
								💡 Lembre-se de incluir o código do país antes do DDD (ex: +55)
							</p>
						)}
						{selectedPlatform.pattern &&
							usernameInput &&
							isSaveButtonDisabled() && (
								<p className="mt-2 text-destructive text-xs">
									Formato inválido para {selectedPlatform.name}
								</p>
							)}
					</div>
					<div className="flex flex-col justify-end gap-2 pt-2 sm:flex-row">
						<BaseButton
							className="w-full sm:w-auto"
							onClick={handleCancel}
							variant="white"
						>
							<span className="flex items-center justify-center">Cancelar</span>
						</BaseButton>
						<BaseButton
							className="w-full sm:w-auto"
							disabled={isSaveButtonDisabled()}
							loading={isSaving}
							onClick={handleAddOrUpdateSocialLink}
							variant="studio"
						>
							<span className="flex items-center justify-center">Salvar</span>
						</BaseButton>
					</div>
				</div>
			)}

			{socialLinks.length > 0 && (
				<div className="space-y-3 border-t pt-4">
					<h4 className="font-medium text-sm sm:text-base">
						Suas Redes Sociais Adicionadas:
					</h4>
					<DndContext
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={socialLinks.map((link) => link.id)}
							strategy={verticalListSortingStrategy}
						>
							<ul className="space-y-2">
								{socialLinks.map((link) => {
									const platform = SOCIAL_PLATFORMS.find(
										(p) => p.key === link.platform
									);
									return (
										<SortableSocialLinkItem id={link.id} key={link.id}>
											<li className="flex items-center justify-between rounded-lg border bg-white p-2.5 dark:bg-zinc-900">
												<div className="flex min-w-0 flex-grow items-center gap-2 sm:gap-3">
													{platform && (
														<div
															className="h-6 w-6"
															style={{
																backgroundColor: platform.color,
																maskImage: `url(${platform.icon})`,
																maskSize: "contain",
																maskRepeat: "no-repeat",
																maskPosition: "center",
															}}
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
										</SortableSocialLinkItem>
									);
								})}
							</ul>
						</SortableContext>
					</DndContext>
				</div>
			)}
		</div>
	);
};

export default SocialLinksTabContent;

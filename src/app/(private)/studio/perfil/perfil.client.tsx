"use client";

import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingPage from "@/components/layout/LoadingPage";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import VerPerfilMobile from "../VerPerfilMobile";

interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

const PerfilClient = () => {
	const { data: session, update } = useSession();
	const [profile, setProfile] = useState({ name: "", username: "", bio: "" });
	const [originalProfile, setOriginalProfile] = useState({
		name: "",
		username: "",
		bio: "",
	});
	const [loading, setLoading] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isProfileLoading, setIsProfileLoading] = useState(true);
	const [profilePreview, setProfilePreview] = useState<string>(
		session?.user?.image ||
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		null
	);
	const [profileImageChanged, setProfileImageChanged] = useState(false);
	const [originalProfileImageUrl, setOriginalProfileImageUrl] =
		useState<string>("");
	const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
	const [validationError, setValidationError] = useState<string>("");
	const [bioValidationError, setBioValidationError] = useState<string>("");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isEditingUsername, setIsEditingUsername] = useState(false);

	const [stats, setStats] = useState<{
		views: number;
		clicks: number;
		rate: string;
	} | null>(null);
	const [notifications, setNotifications] = useState<
		Array<{
			id: string;
			type: "info" | "warning" | "error";
			title: string;
			message: string;
			createdAt: string;
		}>
	>([]);

	const validateBio = useCallback((bio: string): boolean => {
		if (bio.length > 150) {
			setBioValidationError("A biografia deve ter no máximo 150 caracteres.");
			return false;
		}
		setBioValidationError("");
		return true;
	}, []);

	useEffect(() => {
		if (!session?.user?.id) {
			return;
		}

		const fetchProfile = async () => {
			setIsProfileLoading(true);
			try {
				const res = await fetch("/api/profile");
				const { name = "", username = "", bio = "", image } = await res.json();
				const currentImage =
					image ||
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

				setProfile({ name, username, bio: bio || "" });
				setOriginalProfile({ name, username, bio: bio || "" });
				setProfilePreview(currentImage);
				setOriginalProfileImageUrl(currentImage);
			} catch {
				const fallbackUrl =
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
				setProfilePreview(fallbackUrl);
				setOriginalProfileImageUrl(fallbackUrl);
			} finally {
				setIsProfileLoading(false);
			}
		};

		fetchProfile();
	}, [session?.user?.id]);

	useEffect(() => {
		let active = true;
		const run = async () => {
			try {
				const res = await fetch("/api/analytics?range=30d", {
					cache: "no-store",
				});
				const json = await res.json();
				if (active && json && !json.error) {
					setStats({
						views: json.totalProfileViews || 0,
						clicks: json.totalClicks || 0,
						rate: String(json.performanceRate || 0),
					});
				}
			} catch {}

			try {
				const res = await fetch("/api/notifications", { cache: "no-store" });
				const json = await res.json();
				if (active && Array.isArray(json)) {
					setNotifications(json);
				}
			} catch {}
		};
		run();
		return () => {
			active = false;
		};
	}, []);

	const updateProfileText = useCallback(async (): Promise<User | null> => {
		const textChanged =
			profile.name !== originalProfile.name ||
			profile.username !== originalProfile.username ||
			profile.bio !== originalProfile.bio;

		if (!(session?.user?.id && (textChanged || profileImageChanged))) {
			return null;
		}

		try {
			const res = await fetch(`/api/profile/${session.user.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profile),
			});
			const data = await res.json();
			if (!res.ok) {
				if (
					res.status === 400 &&
					data.error === "Nome de usuário indisponível"
				) {
					setValidationError(data.error);
				}
				throw new Error(data.error || "Falha ao atualizar");
			}
			return data as User;
		} catch {
			return null;
		}
	}, [session?.user?.id, profile, originalProfile, profileImageChanged]);

	// Early return após todos os hooks
	if (isProfileLoading) {
		return <LoadingPage />;
	}

	const textChanged =
		profile.name !== originalProfile.name ||
		profile.username !== originalProfile.username ||
		profile.bio !== originalProfile.bio;
	const hasChanges = textChanged || profileImageChanged;

	const validateUsername = (username: string): boolean => {
		if (!username.trim()) {
			setValidationError("O campo de nome de usuário não pode ficar vazio.");
			return false;
		}
		if (username.length > 30) {
			setValidationError("Nome de usuário deve ter no máximo 30 caracteres.");
			return false;
		}
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			setValidationError("Este nome de usuário não está disponível.");
			return false;
		}
		setValidationError("");
		return true;
	};

	const uploadImage = async (file: File): Promise<string | null> => {
		if (!session?.user?.id) {
			return null;
		}

		setIsUploadingImage(true);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("type", "profile");

		try {
			const res = await fetch(
				`/api/profile/${session.user.id}/upload?type=profile`,
				{
					method: "POST",
					body: formData,
				}
			);
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Falha no upload");
			}
			return data.url;
		} catch {
			setProfilePreview(originalProfileImageUrl);
			return null;
		} finally {
			setIsUploadingImage(false);
		}
	};

	const syncLocalProfile = (
		updatedUserData: User | null,
		newImageUrl: string | null
	) => {
		if (updatedUserData) {
			setOriginalProfile({
				name: updatedUserData.name,
				username: updatedUserData.username,
				bio: updatedUserData.bio || "",
			});

			window.dispatchEvent(
				new CustomEvent("profileNameUpdated", {
					detail: { name: updatedUserData.name },
				})
			);

			window.dispatchEvent(
				new CustomEvent("profileUsernameUpdated", {
					detail: { username: updatedUserData.username },
				})
			);

			if (updatedUserData.image) {
				window.dispatchEvent(
					new CustomEvent("profileImageUpdated", {
						detail: { imageUrl: updatedUserData.image },
					})
				);
			}

			// Atualizar a sessão se o username mudou
			if (updatedUserData.username !== session?.user?.username) {
				update({
					user: {
						...session?.user,
						username: updatedUserData.username,
						name: updatedUserData.name,
						image: updatedUserData.image,
					},
				});
			}
		} else {
			setOriginalProfile({
				name: profile.name,
				username: profile.username,
				bio: profile.bio,
			});
		}
		if (newImageUrl) {
			setProfilePreview(newImageUrl);
			setOriginalProfileImageUrl(newImageUrl);
			setSelectedProfileFile(null);
			setProfileImageChanged(false);

			window.dispatchEvent(
				new CustomEvent("profileImageUpdated", {
					detail: { imageUrl: newImageUrl },
				})
			);
		} else if (profileImageChanged) {
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
		}
		setValidationError("");
	};

	const handleSaveProfile = async () => {
		if (!(session?.user?.id && hasChanges)) {
			return;
		}

		if (!validateUsername(profile.username)) {
			return;
		}

		setLoading(true);

		let newImageUrl: string | null = null;

		if (selectedProfileFile) {
			newImageUrl = await uploadImage(selectedProfileFile);
			if (!newImageUrl) {
				setLoading(false);
				return;
			}
		}

		const updatedUserData = await updateProfileText();

		syncLocalProfile(updatedUserData, newImageUrl);

		setLoading(false);

		setIsEditModalOpen(false);
	};

	const handleCancelChanges = () => {
		setProfile({ ...originalProfile });
		setProfilePreview(originalProfileImageUrl);
		setSelectedProfileFile(null);
		setProfileImageChanged(false);
		setValidationError("");
		setIsEditingUsername(false);
	};

	const handleProfileImageSave = (imageFile: File) => {
		const previewUrl = URL.createObjectURL(imageFile);
		setProfilePreview(previewUrl);
		setSelectedProfileFile(imageFile);
		setProfileImageChanged(true);
	};

	const handleProfileImageRemove = () => {
		const defaultImageUrl =
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
		setProfilePreview(defaultImageUrl);
		setProfile((prev) => ({ ...prev, image: defaultImageUrl }));
		setSelectedProfileFile(null);
		setProfileImageChanged(true);
	};

	return (
		<section className="mx-auto min-h-dvh w-full p-4 pb-24">
			<header className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl dark:text-white">Perfil</h2>
				<VerPerfilMobile />
			</header>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="space-y-4 px-2 lg:col-span-2">
					<Card className="shadow-none dark:bg-zinc-900">
						<CardContent className="space-y-6">
							<article className="flex flex-col gap-4 sm:items-center md:flex-row">
								<div className="relative flex items-center justify-center">
									<div
										className={`h-26 w-26 overflow-hidden rounded-full bg-muted shadow-black/20 shadow-md md:h-24 md:w-24 ${isUploadingImage ? "opacity-50" : ""}`}
									>
										<Image
											alt="Foto de perfil"
											className="h-full w-full object-cover"
											height={96}
											key={profilePreview}
											src={profilePreview}
											width={96}
										/>
										{isUploadingImage && (
											<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
												<Loader2 className="h-6 w-6 animate-spin text-white" />
											</div>
										)}
									</div>
									<BaseButton
										className="absolute right-0 bottom-0 rounded-full"
										disabled={isUploadingImage}
										onClick={() => setIsImageCropModalOpen(true)}
										size="icon"
										variant="white"
									>
										<Edit className="h-4 w-4" />
									</BaseButton>
								</div>
								<div className="flex-1 space-y-2 text-center md:text-start">
									<p className="font-semibold text-xl dark:text-white">
										{profile.name || "Seu nome"}
									</p>
									<p className="text-muted-foreground dark:text-gray-300">
										<span className="text-muted-foreground/80 dark:text-gray-400">
											bionk.me/
										</span>
										{profile.username || "username"}
									</p>
									<p className="text-sm dark:text-gray-200">
										{profile.bio || "Bio"}
									</p>
								</div>
							</article>
							<div className="flex justify-center md:justify-end">
								<BaseButton onClick={() => setIsEditModalOpen(true)}>
									Editar Perfil
								</BaseButton>
							</div>
						</CardContent>
					</Card>

					<ProfileImageCropModal
						currentImageUrl={profilePreview}
						isOpen={isImageCropModalOpen}
						onClose={() => setIsImageCropModalOpen(false)}
						onImageRemove={handleProfileImageRemove}
						onImageSave={handleProfileImageSave}
					/>

					<Dialog
						onOpenChange={(open) => {
							setIsEditModalOpen(open);
							if (!open) {
								handleCancelChanges();
							}
						}}
						open={isEditModalOpen}
					>
						<DialogContent
							className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 shadow-xl sm:max-w-lg"
							onOpenAutoFocus={(e) => e.preventDefault()}
						>
							<DialogHeader>
								<DialogTitle className="text-center">
									{isEditingUsername
										? "Alterar nome de usuário"
										: "Editar Perfil"}
								</DialogTitle>
							</DialogHeader>

							{isEditingUsername ? (
								<div className="space-y-6">
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label
												className="dark:text-white"
												htmlFor="edit-username"
											>
												Novo nome de usuário
											</Label>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground dark:text-gray-400">
													bionk.me/
												</span>
												<Input
													className={
														validationError
															? "border-red-500 dark:border-red-400"
															: "text-zinc-700 dark:bg-zinc-700 dark:text-white"
													}
													disabled={loading || isUploadingImage}
													id="edit-username"
													maxLength={30}
													onChange={(e) => {
														const sanitizedUsername = e.target.value
															.replace(/[^a-zA-Z0-9_.]/g, "")
															.toLowerCase();
														setProfile({
															...profile,
															username: sanitizedUsername,
														});
														validateUsername(sanitizedUsername);
													}}
													placeholder="username"
													value={profile.username}
												/>
											</div>
											<p className="min-h-[1.25rem] text-red-500 text-sm">
												{validationError || " "}
											</p>
										</div>

										<div>
											<h4 className="mb-2 font-semibold text-black text-sm dark:text-white">
												Atenção ao alterar seu usuário:
											</h4>
											<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm dark:text-white">
												<li>
													O nome de usuário só pode ser trocado a cada 3 dias.
												</li>
												<li>O seu link de perfil (URL) mudará.</li>
												<li>
													Você precisará atualizar o link em todas as suas redes
													sociais.
												</li>
												<li>O seu QR Code será alterado.</li>
											</ul>
										</div>
									</div>

									<div className="flex justify-end gap-2">
										<BaseButton
											disabled={
												loading ||
												isUploadingImage ||
												!!validationError ||
												!profile.username ||
												profile.username === originalProfile.username
											}
											fullWidth
											onClick={() => setIsEditingUsername(false)}
										>
											Confirmar
										</BaseButton>
									</div>
								</div>
							) : (
								<>
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label className="dark:text-white" htmlFor="edit-name">
												Nome
											</Label>
											<Input
												className="text-zinc-700 dark:bg-zinc-700 dark:text-white"
												disabled={loading || isUploadingImage}
												id="edit-name"
												maxLength={44}
												onChange={(e) => {
													setProfile({ ...profile, name: e.target.value });
												}}
												placeholder="Seu nome de exibição"
												value={profile.name}
											/>
										</div>
										<div className="grid gap-1">
											<Label className="dark:text-white">Nome de usuário</Label>
											<div className="flex items-center justify-between ">
												<div className="flex items-center gap-1 overflow-hidden">
													<span className="text-muted-foreground dark:text-gray-400">
														bionk.me/
													</span>
													<span className="truncate font-medium dark:text-white">
														{profile.username}
													</span>
												</div>
												<BaseButton
													className="h-8 px-3 text-xs"
													onClick={() => setIsEditingUsername(true)}
													size="sm"
												>
													Alterar
												</BaseButton>
											</div>
										</div>
										<div className="grid gap-2">
											<Label className="dark:text-white" htmlFor="edit-bio">
												Biografia
											</Label>
											<Textarea
												className={`min-h-32 text-zinc-700 dark:bg-zinc-700 dark:text-white ${bioValidationError ? "border-red-500 dark:border-red-400" : ""}`}
												disabled={loading || isUploadingImage}
												id="edit-bio"
												maxLength={150}
												onChange={(e) => {
													setProfile({ ...profile, bio: e.target.value });
													validateBio(e.target.value);
												}}
												placeholder="Fale um pouco sobre você"
												value={profile.bio}
											/>
											<div className="flex items-center justify-between">
												<p className="min-h-[1.25rem] text-red-500 text-sm">
													{bioValidationError || " "}
												</p>
												<p className="text-muted-foreground text-sm">
													{profile.bio.length}/150
												</p>
											</div>
										</div>
									</div>
									<div className="flex justify-end gap-2 pt-2">
										<BaseButton
											disabled={
												loading ||
												isUploadingImage ||
												!!validationError ||
												!hasChanges
											}
											fullWidth
											loading={loading || isUploadingImage}
											onClick={handleSaveProfile}
										>
											Salvar
										</BaseButton>
									</div>
								</>
							)}
						</DialogContent>
					</Dialog>
				</div>

				<div className="space-y-4 px-2">
					<Card className="dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="dark:text-white">Estatísticas</CardTitle>
						</CardHeader>
						<CardContent>
							{stats ? (
								<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
									<div className="rounded-lg border p-4 dark:bg-zinc-900">
										<p className="text-muted-foreground text-xs dark:text-gray-300">
											Visualizações
										</p>
										<p className="font-bold text-xl dark:text-white">
											{stats.views.toLocaleString()}
										</p>
									</div>
									<div className="rounded-lg border p-4 dark:bg-zinc-900">
										<p className="text-muted-foreground text-xs dark:text-gray-300">
											Cliques
										</p>
										<p className="font-bold text-xl dark:text-white">
											{stats.clicks.toLocaleString()}
										</p>
									</div>
									<div className="rounded-lg border p-4 dark:bg-zinc-900">
										<p className="text-muted-foreground text-xs dark:text-gray-300">
											Taxa de performance
										</p>
										<p className="font-bold text-xl dark:text-white">
											{stats.rate}%
										</p>
									</div>
								</div>
							) : (
								<div className="grid h-24 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
									<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-zinc-700" />
									<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-zinc-700" />
									<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-zinc-700" />
								</div>
							)}
						</CardContent>
					</Card>

					<Card className=" dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="dark:text-white">Notificações</CardTitle>
						</CardHeader>
						<CardContent>
							{notifications.length > 0 ? (
								<ul className="space-y-3">
									{notifications.map((n) => (
										<li
											className="rounded-lg border p-3 dark:bg-zinc-800"
											key={n.id}
										>
											<div className="flex items-center justify-between">
												<span
													className={`font-medium text-sm ${n.type === "error" ? "text-red-500" : n.type === "warning" ? "text-yellow-500" : "text-blue-500"}`}
												>
													{n.title}
												</span>
												<span className="text-muted-foreground text-xs">
													{new Date(n.createdAt).toLocaleDateString()}
												</span>
											</div>
											<p className="mt-1 text-sm dark:text-gray-200">
												{n.message}
											</p>
										</li>
									))}
								</ul>
							) : (
								<p className="text-muted-foreground text-sm">
									Sem notificações no momento.
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};

export default PerfilClient;

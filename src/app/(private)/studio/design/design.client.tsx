// src/app/(private)/studio/design/design.client.tsx
"use client";

import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingPage from "@/components/layout/LoadingPage";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import type { SocialLinkItem } from "@/types/social";
import CategoriasTemplates from "./components/design.CategoriasTemplates";
import DesignPanel from "./components/design.Panel";

// Definir o tipo das customizações
type UserCustomizations = {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButtonColor: string;
	customButtonTextColor: string;
	customButtonStyle: string;
	customButtonFill: string;
	customButtonCorners: string;
	headerStyle: string;
};

interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

interface UserData {
	name: string;
	username: string;
	bio?: string;
	image?: string;
	socialLinks: SocialLinkItem[];
}

const PersonalizarClient = () => {
	const { data: session } = useSession();
	const [userCustomizations, setUserCustomizations] =
		useState<UserCustomizations>({
			customBackgroundColor: "",
			customBackgroundGradient: "",
			customTextColor: "",
			customFont: "",
			customButtonColor: "",
			customButtonTextColor: "",
			customButtonStyle: "solid",
			customButtonFill: "",
			customButtonCorners: "",
			headerStyle: "default",
		});

	// Estados do perfil
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

	// Estado para dados completos do usuário (incluindo links sociais)
	const [userData, setUserData] = useState<UserData>({
		name: "",
		username: "",
		bio: "",
		image: "",
		socialLinks: [],
	});

	// Carregar perfil
	useEffect(() => {
		if (!session?.user?.id) {
			return;
		}

		const fetchProfile = async () => {
			setIsProfileLoading(true);
			try {
				// Buscar dados do perfil
				const res = await fetch(`/api/profile/${session.user.id}`);
				const { name = "", username = "", bio = "", image } = await res.json();
				const currentImage =
					image ||
					session?.user?.image ||
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

				// Buscar links sociais
				const socialRes = await fetch(
					`/api/social-links?userId=${session.user.id}`
				);
				const socialData = await socialRes.json();
				const socialLinks = socialData?.socialLinks || [];

				setProfile({ name, username, bio: bio || "" });
				setOriginalProfile({ name, username, bio: bio || "" });
				setProfilePreview(currentImage);
				setOriginalProfileImageUrl(currentImage);

				// Atualizar dados completos do usuário
				setUserData({
					name,
					username,
					bio: bio || "",
					image: currentImage,
					socialLinks,
				});
			} catch {
				const fallbackUrl =
					session?.user?.image ||
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
				setProfilePreview(fallbackUrl);
				setOriginalProfileImageUrl(fallbackUrl);

				// Dados de fallback
				setUserData({
					name: session?.user?.name || "",
					username: session?.user?.username || "",
					bio: "",
					image: fallbackUrl,
					socialLinks: [],
				});
			} finally {
				setIsProfileLoading(false);
			}
		};

		fetchProfile();
	}, [session?.user?.id, session?.user?.image]);

	// Carregar personalizações existentes
	useEffect(() => {
		const fetchCustomizations = async () => {
			const response = await fetch("/api/user-customizations");
			const data = await response.json();
			if (data) {
				setUserCustomizations(data);
			}
		};
		fetchCustomizations();
	}, []);

	// Função para lidar com mudança de template (callback)
	const handleTemplateChange = () => {
		// Resetar as personalizações localmente quando o template mudar
		const resetCustomizations: UserCustomizations = {
			customBackgroundColor: "",
			customBackgroundGradient: "",
			customTextColor: "",
			customFont: "",
			customButtonColor: "",
			customButtonTextColor: "",
			customButtonStyle: "solid",
			customButtonFill: "",
			customButtonCorners: "",
			headerStyle: "default",
		};

		setUserCustomizations(resetCustomizations);

		// Disparar evento personalizado para recarregar o iframe quando o template mudar
		window.dispatchEvent(new CustomEvent("reloadIframePreview"));
	};

	// Funções do perfil
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

			if (updatedUserData.image) {
				window.dispatchEvent(
					new CustomEvent("profileImageUpdated", {
						detail: { imageUrl: updatedUserData.image },
					})
				);
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
		const textChanged =
			profile.name !== originalProfile.name ||
			profile.username !== originalProfile.username ||
			profile.bio !== originalProfile.bio;
		const hasChanges = textChanged || profileImageChanged;

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

		// Disparar evento para recarregar o iframe após salvar o perfil
		window.dispatchEvent(new CustomEvent("reloadIframePreview"));

		setLoading(false);
	};

	const handleCancelChanges = () => {
		setProfile({ ...originalProfile });
		setProfilePreview(originalProfileImageUrl);
		setSelectedProfileFile(null);
		setProfileImageChanged(false);
		setValidationError("");
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

	// Função atualizada para aceitar personalizações parciais
	const handleSaveCustomizations = async (
		partialCustomizations: Partial<UserCustomizations>
	) => {
		const response = await fetch("/api/update-customizations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(partialCustomizations), // Enviar apenas as mudanças
		});

		if (response.ok) {
			// Atualizar o estado local mesclando as mudanças
			setUserCustomizations((prev) => ({
				...prev,
				...partialCustomizations,
			}));

			// Disparar evento personalizado para recarregar o iframe
			window.dispatchEvent(new CustomEvent("reloadIframePreview"));
		}
	};

	// Early return se ainda carregando
	if (isProfileLoading) {
		return <LoadingPage />;
	}

	const textChanged =
		profile.name !== originalProfile.name ||
		profile.username !== originalProfile.username ||
		profile.bio !== originalProfile.bio;
	const hasChanges = textChanged || profileImageChanged;

	return (
		<div className="min-h-screen w-full bg-white text-black transition-colors lg:w-7/12 dark:bg-neutral-800 dark:text-white">
			<section className="flex min-h-screen flex-col gap-6 px-6 py-8 pb-24">
				{/* Seção Header */}
				<section className="">
					<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
						Header
					</h2>
					<Card className="border-none shadow-none dark:bg-neutral-800">
						<CardContent className="space-y-6 p-6">
							<article className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<div className="relative flex items-center justify-center">
									<div
										className={`h-26 w-26 overflow-hidden rounded-full bg-muted shadow-black/20 shadow-md ${
											isUploadingImage ? "opacity-50" : ""
										}`}
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
								<div className="flex-1 space-y-4">
									<div className="grid gap-1">
										<Label className="dark:text-white" htmlFor="name">
											Nome
										</Label>
										<Input
											className="text-neutral-700 dark:bg-neutral-700 dark:text-white"
											disabled={loading || isUploadingImage}
											id="name"
											maxLength={44}
											onChange={(e) => {
												setProfile({ ...profile, name: e.target.value });
											}}
											placeholder="Seu nome de exibição"
											value={profile.name}
										/>
									</div>
									<div className="grid gap-1">
										<Label className="dark:text-white" htmlFor="username">
											Nome de usuário
										</Label>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground dark:text-gray-400">
												bionk.me/
											</span>
											<Input
												className={
													validationError
														? "border-red-500 dark:border-red-400"
														: "text-neutral-700 dark:bg-neutral-700 dark:text-white"
												}
												disabled={loading || isUploadingImage}
												id="username"
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
								</div>
							</article>
							<div className="grid gap-2">
								<Label className="dark:text-white" htmlFor="bio">
									Biografia
								</Label>
								<Textarea
									className="min-h-32 text-neutral-700 dark:bg-neutral-700 dark:text-white"
									disabled={loading || isUploadingImage}
									id="bio"
									onChange={(e) => {
										setProfile({ ...profile, bio: e.target.value });
									}}
									placeholder="Fale um pouco sobre você"
									value={profile.bio}
								/>
							</div>
							{hasChanges && (
								<div className="fixed right-6 bottom-6 z-50 flex gap-2 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm dark:bg-neutral-800/90">
									<BaseButton
										disabled={loading || isUploadingImage}
										onClick={handleCancelChanges}
										variant="white"
									>
										Cancelar
									</BaseButton>
									<BaseButton
										disabled={loading || isUploadingImage || !!validationError}
										loading={loading || isUploadingImage}
										onClick={handleSaveProfile}
									>
										Salvar
									</BaseButton>
								</div>
							)}
						</CardContent>
					</Card>
				</section>

				{/* Seção de Templates */}
				<section className="border-t pt-6 dark:border-gray-700">
					<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
						Templates
					</h2>
					<CategoriasTemplates onTemplateChange={handleTemplateChange} />
				</section>

				{/* Seção de Personalização */}
				<section className="border-t pt-6 dark:border-gray-700">
					<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
						Personalização
					</h2>

					<DesignPanel
						onSave={handleSaveCustomizations}
						userCustomizations={userCustomizations}
						userData={userData}
					/>
				</section>
			</section>

			<ProfileImageCropModal
				currentImageUrl={profilePreview}
				isOpen={isImageCropModalOpen}
				onClose={() => setIsImageCropModalOpen(false)}
				onImageRemove={handleProfileImageRemove}
				onImageSave={handleProfileImageSave}
			/>
		</div>
	);
};

export default PersonalizarClient;

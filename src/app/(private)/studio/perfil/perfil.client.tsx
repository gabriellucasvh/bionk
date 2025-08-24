"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingPage from "@/components/layout/LoadingPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface User {
	name: string;
	username: string;
	bio?: string;
	image?: string;
}

const PerfilClient = () => {
	const { data: session, update: updateSession } = useSession();

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
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png"
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		null
	);
	const [profileImageChanged, setProfileImageChanged] = useState(false);
	const profileInputRef = useRef<HTMLInputElement>(null);
	const [originalProfileImageUrl, setOriginalProfileImageUrl] =
		useState<string>("");
	const [usernameError, setUsernameError] = useState<string>("");

	useEffect(() => {
		if (!session?.user?.id) {
			return;
		}

		const fetchProfile = async () => {
			setIsProfileLoading(true);
			try {
				const res = await fetch(`/api/profile/${session.user.id}`);
				const { name = "", username = "", bio = "", image } = await res.json();
				const currentImage =
					image ||
					session?.user?.image ||
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png";

				setProfile({ name, username, bio: bio || "" });
				setOriginalProfile({ name, username, bio: bio || "" });
				setProfilePreview(currentImage);
				setOriginalProfileImageUrl(currentImage);
			} catch {
				const fallbackUrl =
					session?.user?.image ||
					"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png";
				setProfilePreview(fallbackUrl);
				setOriginalProfileImageUrl(fallbackUrl);
			} finally {
				setIsProfileLoading(false);
			}
		};

		fetchProfile();
	}, [session?.user?.id, session?.user?.image]);

	const textChanged =
		profile.name !== originalProfile.name ||
		profile.username !== originalProfile.username ||
		profile.bio !== originalProfile.bio;
	const hasChanges = textChanged || profileImageChanged;

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

	const updateProfileText = useCallback(async (): Promise<User | null> => {
		if (!(session?.user?.id && textChanged)) {
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
				throw new Error(data.error || "Falha ao atualizar");
			}
			return data.user as User;
		} catch {
			return null;
		}
	}, [session?.user?.id, profile, textChanged]);

	const applyUpdatedProfile = async (
		currentSession: any,
		updateSessionFn: any,
		updatedUserData: User | null,
		newImageUrl: string | null
	) => {
		if (!currentSession?.user) {
			return;
		}

		const newSessionUser = {
			...currentSession.user,
			name: updatedUserData?.name ?? currentSession.user.name,
			username: updatedUserData?.username ?? currentSession.user.username,
			image: newImageUrl ?? currentSession.user.image,
		};

		await updateSessionFn({ ...currentSession, user: newSessionUser });
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
		}
		if (newImageUrl) {
			setOriginalProfileImageUrl(newImageUrl);
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
		}
		setUsernameError("");
	};

	const handleSaveProfile = async () => {
		if (!(session?.user?.id && hasChanges)) {
			return;
		}

		// Validação de username
		if (profile.username.trim()) {
			setUsernameError("");
		} else {
			setUsernameError("O campo de nome de usuário não pode ficar vazio.");
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

		if (newImageUrl || updatedUserData) {
			await applyUpdatedProfile(
				session,
				updateSession,
				updatedUserData,
				newImageUrl
			);
			syncLocalProfile(updatedUserData, newImageUrl);
		}

		setLoading(false);
	};

	const handleCancelChanges = () => {
		setProfile({ ...originalProfile });
		setProfilePreview(originalProfileImageUrl);
		setSelectedProfileFile(null);
		setProfileImageChanged(false);
		setUsernameError("");
	};

	const handleProfileFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
		if (isUploadingImage) {
			return;
		}

		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			if (profileInputRef.current) {
				profileInputRef.current.value = "";
			}
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setProfilePreview(previewUrl);
		setSelectedProfileFile(file);
		setProfileImageChanged(true);

		if (profileInputRef.current) {
			profileInputRef.current.value = "";
		}
	};

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<section className="w-full space-y-4 p-4 lg:w-1/2">
			<header>
				<h2 className="font-bold text-2xl">Perfil</h2>
			</header>

			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle>Informações do perfil</CardTitle>
					<CardDescription>
						Atualize as informações do seu perfil e personalize sua página.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<article className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="relative flex items-center justify-center">
							<div
								className={`h-24 w-24 overflow-hidden rounded-full border-2 border-green-500 bg-muted shadow-black/20 shadow-md ${
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
								onClick={() => profileInputRef.current?.click()}
								size="icon"
								variant="white"
							>
								<Edit className="h-4 w-4" />
							</BaseButton>
							<input
								accept="image/*"
								className="hidden"
								disabled={isUploadingImage}
								onChange={handleProfileFileSelect}
								ref={profileInputRef}
								type="file"
							/>
						</div>
						<div className="flex-1 space-y-4">
							<div className="grid gap-1">
								<Label htmlFor="username">Nome de usuário</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">bionk.me/</span>
									<Input
										className={usernameError ? "border-red-500" : ""}
										disabled={loading || isUploadingImage}
										id="username"
										onChange={(e) => {
											const sanitizedUsername = e.target.value
												.replace(/[^a-zA-Z0-9_.]/g, "")
												.toLowerCase();
											setProfile({ ...profile, username: sanitizedUsername });

											// Atualiza o erro em tempo real
											if (usernameError && sanitizedUsername.trim() !== "") {
												setUsernameError("");
											}
										}}
										placeholder="username"
										value={profile.username}
									/>
								</div>
								{/* Mantém espaço para a mensagem de erro */}
								<p className="min-h-[1.25rem] text-red-500 text-sm">
									{usernameError || " "}
								</p>
							</div>
						</div>
					</article>
					<div className="grid gap-2">
						<Label htmlFor="bio">Biografia</Label>
						<Textarea
							className="min-h-32"
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
						<div className="mt-4 flex justify-end gap-2">
							<BaseButton
								disabled={loading || isUploadingImage}
								onClick={handleCancelChanges}
								variant="white"
							>
								Cancelar alterações
							</BaseButton>
							<BaseButton
								loading={loading || isUploadingImage}
								onClick={handleSaveProfile}
							>
								Salvar alterações
							</BaseButton>
						</div>
					)}
				</CardContent>
			</Card>
		</section>
	);
};

export default PerfilClient;

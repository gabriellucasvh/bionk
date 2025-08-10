"use client";

import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingPage from "@/components/layout/LoadingPage";
import ToastMessage from "@/components/ToastMessage";
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
	const [message, setMessage] = useState("");
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
				setMessage("Erro ao carregar dados do perfil.");
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

	useEffect(() => {
		if (!message) {
			return;
		}
		const timer = setTimeout(() => setMessage(""), 5000);
		return () => {
			clearTimeout(timer);
		};
	}, [message]);

	const textChanged =
		profile.name !== originalProfile.name ||
		profile.username !== originalProfile.username ||
		profile.bio !== originalProfile.bio;
	const hasChanges = textChanged || profileImageChanged;

	const uploadImage = async (file: File): Promise<boolean> => {
		if (!session?.user?.id) {
			return false;
		}

		setIsUploadingImage(true);
		setMessage("");
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
				throw new Error(data.error || "Falha no upload da imagem");
			}
			if (data.url) {
				setOriginalProfileImageUrl(data.url);
			}
			setMessage("Foto de perfil atualizada com sucesso!");
			return true;
		} catch (error) {
			setMessage(
				`Erro no upload: ${
					error instanceof Error ? error.message : "Ocorreu um problema"
				}`
			);
			setProfilePreview(originalProfileImageUrl);
			return false;
		} finally {
			setIsUploadingImage(false);
		}
	};

	const updateProfileText = async (): Promise<User | null> => {
		if (!session?.user?.id) {
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
				throw new Error(data.error || "Falha ao atualizar o perfil");
			}
			return data.user as User;
		} catch (error) {
			setMessage(
				`Erro ao salvar informações: ${
					error instanceof Error ? error.message : "Ocorreu um problema"
				}`
			);
			return null;
		}
	};

	const updateSessionData = async (
		updatedUserData: User | null,
		imageUploadSuccess: boolean
	) => {
		if (!(session && updateSession)) {
			return;
		}

		const sessionUpdateData = {
			...session,
			user: {
				...session.user,
				name: updatedUserData?.name ?? session.user.name,
				username: updatedUserData?.username ?? session.user.username,
				image:
					imageUploadSuccess && selectedProfileFile === null
						? originalProfileImageUrl
						: (updatedUserData?.image ?? session.user.image),
			},
		};

		try {
			await updateSession(sessionUpdateData);
		} catch {
			setMessage("Erro ao atualizar a sessão local.");
		}
	};

	const saveProfileImage = async (): Promise<{
		success: boolean;
		message: string;
	}> => {
		if (!selectedProfileFile) {
			return { success: true, message: "" };
		}

		const success = await uploadImage(selectedProfileFile);

		if (success) {
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
			return { success: true, message: "Foto de perfil atualizada. " };
		}

		return { success: false, message: "" };
	};

	const saveProfileText = async (): Promise<{
		success: boolean;
		message: string;
		userData: User | null;
	}> => {
		if (!textChanged) {
			return { success: false, message: "", userData: null };
		}

		const userData = await updateProfileText();

		if (userData !== null) {
			setOriginalProfile({
				name: userData.name,
				username: userData.username,
				bio: userData.bio || "",
			});
			return {
				success: true,
				message: "Informações do perfil atualizadas com sucesso!",
				userData,
			};
		}

		return { success: false, message: "", userData: null };
	};

	const finalizeUpdate = async (
		imageSuccess: boolean,
		textSuccess: boolean,
		statusMessage: string,
		updatedUserData: User | null
	) => {
		if (imageSuccess || textSuccess) {
			await updateSessionData(updatedUserData, imageSuccess);
			setMessage(statusMessage || "Perfil atualizado!");
			window.location.reload();
		} else {
			setMessage(
				statusMessage || "Nenhuma alteração para salvar ou erro ocorrido."
			);
		}
	};

	const handleSaveProfile = async () => {
		if (!(session?.user?.id && (textChanged || profileImageChanged))) {
			return;
		}

		setLoading(true);
		setMessage("");

		const { success: imageSuccess, message: imageMessage } =
			await saveProfileImage();
		if (!imageSuccess) {
			setLoading(false);
			return;
		}

		const {
			success: textSuccess,
			message: textMessage,
			userData,
		} = await saveProfileText();

		const finalMessage = (imageMessage || "") + (textMessage || "");

		await finalizeUpdate(imageSuccess, textSuccess, finalMessage, userData);

		setLoading(false);
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
			setMessage("Erro: A foto de perfil deve ter no máximo 2MB.");
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
			<header className="flex items-center justify-between">
				<h2 className="font-bold text-2xl">Perfil</h2>
			</header>

			{message && (
				<ToastMessage
					message={message}
					onClose={() => setMessage("")}
					variant={message.includes("Erro") ? "error" : "success"}
				/>
			)}

			<Card className="border-none shadow-none">
				<CardHeader>
					<CardTitle>Informações do perfil</CardTitle>
					<CardDescription>
						Atualize as informações do seu perfil e personalize sua página.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<article className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<div className="relative flex items-center justify-center ">
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
								className="absolute right-0 bottom-0 size-9 rounded-full"
								disabled={isUploadingImage}
								onClick={() => {
									if (!isUploadingImage && profileInputRef.current) {
										profileInputRef.current.click();
									}
								}}
								variant="white"
							>
								<Edit className="size-10 h-10 w-10" />
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
							<div className="grid gap-2">
								<Label htmlFor="name">Nome</Label>
								<Input
									disabled={loading || isUploadingImage}
									id="name"
									onChange={(e) => {
										setProfile({ ...profile, name: e.target.value });
									}}
									placeholder="Seu nome"
									value={profile.name}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="username">Nome de usuário</Label>
								<div className="flex items-center gap-2">
									<span className="text-muted-foreground">bionk.me/</span>
									<Input
										disabled={loading || isUploadingImage}
										id="username"
										onChange={(e) => {
											const sanitizedUsername = e.target.value
												.replace(/[^a-zA-Z0-9_.]/g, "")
												.toLowerCase();
											setProfile({ ...profile, username: sanitizedUsername });
										}}
										placeholder="username"
										value={profile.username}
									/>
								</div>
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
					<div className="mt-4 flex justify-end">
						<BaseButton
							loading={loading || isUploadingImage || !hasChanges}
							onClick={handleSaveProfile}
						>
							Salvar alterações
						</BaseButton>
					</div>
				</CardContent>
			</Card>
		</section>
	);
};

export default PerfilClient;

// src/app/(private)/studio/design/design.client.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { useDesignStore } from "@/stores/designStore";
import CategoriasTemplates from "./components/design.CategoriasTemplates";
import { DesignPanel } from "./components/design.Panel";
import ProfileSection from "./components/ProfileSection";
import UserPagePreview from "./components/UserPagePreview";
import { useButtonAnimations } from "./hooks/useButtonAnimations";
import { useCustomizations } from "./hooks/useCustomizations";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileImage } from "./hooks/useProfileImage";
import { useProfileValidation } from "./hooks/useProfileValidation";
import { useSaveProfile } from "./hooks/useSaveProfile";

const PersonalizarClient = () => {
	const { data: session } = useSession();
	const { loadInitialData, updateUserField } = useDesignStore();
	const [mobileView, setMobileView] = useState<"design" | "preview">("design");
	const previewContainerRef = useRef<HTMLDivElement>(null);
	const designContainerRef = useRef<HTMLDivElement>(null);

	const handleMobileViewChange = (view: "design" | "preview") => {
		setMobileView(view);
		if (view === "preview" && previewContainerRef.current) {
			setTimeout(() => {
				previewContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
			}, 100);
		}
	};

	const {
		profile,
		setProfile,
		originalProfile,
		setOriginalProfile,
		userData,
		isProfileLoading,
		updateProfileText,
		fetchProfile,
	} = useProfileData(
		session?.user?.id || undefined,
		session?.user?.image || undefined
	);

	const {
		profilePreview,
		selectedProfileFile,
		profileImageChanged,
		isUploadingImage,
		isImageCropModalOpen,
		setIsImageCropModalOpen,
		uploadImage,
		handleProfileImageSave,
		handleProfileImageRemove,
		resetImageState,
		updateOriginalImageUrl,
	} = useProfileImage(
		session?.user?.image ||
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);

	const {
		validationError,
		bioValidationError,
		isCheckingUsername,
		validateBio,
		validateUsername,
		clearValidationErrors,
	} = useProfileValidation();

	const { showButtons, animateButtonsOut } = useButtonAnimations(
		profile,
		originalProfile,
		profileImageChanged
	);

	const { userCustomizations, handleTemplateChange } = useCustomizations();

	const {
		loading,
		handleSaveProfile,
		handleCancelChanges,
		debouncedValidateUsername,
	} = useSaveProfile({
		profile,
		originalProfile,
		profileImageChanged,
		selectedProfileFile,
		validateBio,
		validateUsername,
		uploadImage,
		updateProfileText,
		setOriginalProfile,
		updateOriginalImageUrl,
		resetImageState,
		clearValidationErrors,
		animateButtonsOut,
	});

	// Atualiza a imagem de perfil do ProfileSection quando outro fluxo disparar o evento
	useEffect(() => {
		const handleProfileImageUpdate = (event: CustomEvent) => {
			const newUrl = (event as any)?.detail?.imageUrl as string | undefined;
			if (newUrl) {
				updateOriginalImageUrl(newUrl);
			}
		};

		window.addEventListener(
			"profileImageUpdated",
			handleProfileImageUpdate as unknown as EventListener
		);

		return () => {
			window.removeEventListener(
				"profileImageUpdated",
				handleProfileImageUpdate as unknown as EventListener
			);
		};
	}, [updateOriginalImageUrl]);

	// Sincroniza a imagem inicial do usuário após o fetch para evitar imagem antiga em reload
	useEffect(() => {
		if (userData?.image) {
			updateOriginalImageUrl(userData.image);
		}
	}, [userData?.image, updateOriginalImageUrl]);

	// Função para converter UserData do hook para o formato do store
	const convertUserDataForStore = (userDataInput: any) => {
		// Combinar links regulares e social links
		const allLinks = [
			...(userDataInput.Link || []),
			...(userDataInput.socialLinks || []),
		];

		return {
			id: userDataInput.id,
			name: userDataInput.name,
			bio: userDataInput.bio,
			username: userDataInput.username,
			image: userDataInput.image,
			links: allLinks,
			images: userDataInput.Image || [],
			texts:
				userDataInput.Text?.map((text: any) => ({
					id: text.id,
					content: text.title || text.content || "",
					description: text.description || "",
					order: text.order,
					title: text.title || "",
					position: text.position || "center",
					hasBackground: text.hasBackground,
					isCompact: text.isCompact,
				})) || [],
			videos:
				userDataInput.Video?.map((video: any) => ({
					id: video.id,
					title: video.title,
					description: video.description,
					url: video.url,
					order: video.order,
					type: video.type || "direct",
				})) || [],
		};
	};

	// Carregar dados iniciais no store
	useEffect(() => {
		if (userData && userCustomizations) {
			const convertedUserData = convertUserDataForStore(userData);
			loadInitialData(convertedUserData, userCustomizations);
		}
	}, [userData, userCustomizations, loadInitialData]);

	// Sincronizar mudanças do profile com o store apenas na inicialização
	useEffect(() => {
		if (profile && userData && !useDesignStore.getState().userData) {
			updateUserField("name", profile.name || userData.name || "");
			updateUserField("bio", profile.bio || userData.bio || "");
			updateUserField("username", profile.username || userData.username || "");
			updateUserField("image", profilePreview || userData.image || "");
		}
	}, [profile, userData]);

	// Escutar eventos de recarregamento para atualizar preview
	useEffect(() => {
		const handleReloadPreview = () => {
			fetchProfile();
		};

		window.addEventListener("reloadIframePreview", handleReloadPreview);

		return () => {
			window.removeEventListener("reloadIframePreview", handleReloadPreview);
		};
	}, [fetchProfile]);

	const handleProfileChange = (field: string, value: string) => {
		setProfile({ ...profile, [field]: value });
	};

	const handleProfileCancel = () => {
		setProfile({ ...originalProfile });
		handleCancelChanges();
	};

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="min-h-screen w-full bg-white text-black transition-colors dark:bg-neutral-800 dark:text-white">
			{/* Botão flutuante mobile substitui navbar */}
			<button
				aria-label={
					mobileView === "design" ? "Ver preview" : "Voltar ao design"
				}
				className="fixed right-6 bottom-30 z-50 rounded-full bg-lime-400 p-3 text-white shadow-lg transition-colors hover:bg-lime-500 active:scale-95 md:hidden"
				onClick={() =>
					handleMobileViewChange(mobileView === "design" ? "preview" : "design")
				}
				type="button"
			>
				{mobileView === "design" ? (
					<Eye className="h-6 w-6 text-black" />
				) : (
					<EyeOff className="h-6 w-6 text-black" />
				)}
			</button>

			{/* Conteúdo Principal */}
			<div className="md:flex">
				{/* Painel de Edição */}
				<div
					className={`h-screen w-full overflow-y-auto bg-white md:h-auto md:flex-1 md:overflow-visible dark:bg-neutral-800 ${
						mobileView === "preview" ? "hidden xl:block" : "block"
					}`}
					ref={designContainerRef}
				>
					<section className="flex min-h-screen flex-col gap-6 px-6 pt-10 pb-24 md:pt-8 md:pr-8 xl:pr-100">
						<ProfileSection
							bioValidationError={bioValidationError}
							isCheckingUsername={isCheckingUsername}
							isUploadingImage={isUploadingImage}
							loading={loading}
							onBioChange={validateBio}
							onCancelChanges={handleProfileCancel}
							onImageEditClick={() => setIsImageCropModalOpen(true)}
							onProfileChange={handleProfileChange}
							onSaveProfile={handleSaveProfile}
							onUsernameChange={debouncedValidateUsername}
							originalProfile={originalProfile}
							profile={profile}
							profilePreview={profilePreview}
							showButtons={showButtons}
							validationError={validationError}
						/>

						<section className="border-t pt-6 dark:border-gray-700">
							<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
								Templates
							</h2>
							<CategoriasTemplates onTemplateChange={handleTemplateChange} />
						</section>

						<section className="border-t pt-6 dark:border-gray-700">
							<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
								Personalização
							</h2>
							<DesignPanel />
						</section>
					</section>
				</div>

				{/* Preview Mobile - Visível apenas quando selecionado no mobile */}
				<div
					className={`fixed inset-0 z-40 bg-gray-100 md:hidden dark:bg-neutral-900 ${
						mobileView === "design" ? "hidden" : "block"
					}`}
					ref={previewContainerRef}
				>
					<div className="flex h-full justify-center overflow-y-auto px-6 pt-10 pb-24">
						<div
							className="mx-auto h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-neutral-800"
							style={{
								height: "calc(100vh - 8rem)",
								maxWidth: "365px",
							}}
						>
							<UserPagePreview />
						</div>
					</div>
				</div>
			</div>

			{/* Preview Desktop - Visível apenas em md+ */}
			<div className="fixed top-4 right-4 z-50 hidden h-[calc(100vh-2rem)] w-90 rounded-[2.5rem] border-4 border-gray-800 bg-gray-900 shadow-2xl xl:block">
				<div className="flex h-full flex-col">
					<div className="flex-1 overflow-y-auto rounded-4xl bg-white dark:bg-neutral-900">
						<UserPagePreview />
					</div>
				</div>
			</div>

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

// src/app/(private)/studio/design/design.client.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useDesignStore } from "@/stores/designStore";
import CategoriasTemplates from "./components/design.CategoriasTemplates";
import { DesignPanel } from "./components/design.Panel";
import ProfileSection from "./components/ProfileSection";
import UserPagePreview from "./components/UserPagePreview";
import { useCustomizations } from "./hooks/useCustomizations";
import { useProfileData } from "./hooks/useProfileData";
import { useProfileImage } from "./hooks/useProfileImage";

const DesignPreviewSkeleton = () => (
	<div className="p-4">
		<Skeleton className="mx-auto mt-4 h-28 w-28 rounded-full" />
		<Skeleton className="mx-auto mt-4 h-6 w-44 rounded-full" />
		<Skeleton className="mx-auto mt-4 h-6 w-60 rounded-full" />
		<div className="mt-4 space-y-3">
			{new Array(5).fill(null).map((_, i) => (
				<div className="rounded-xl p-4 dark:border-zinc-700" key={i}>
					<Skeleton className="h-4 w-56" />
					<Skeleton className="mt-3 h-3 w-full" />
				</div>
			))}
		</div>
	</div>
);

const ProfileSectionSkeleton = () => (
	<div className="rounded-2xl border bg-white p-6 dark:border-gray-700 dark:bg-zinc-800">
		<div className="flex items-center gap-4">
			<Skeleton className="h-20 w-20 rounded-full" />
			<Skeleton className="h-10 w-28 rounded-full" />
		</div>
	</div>
);

const TemplatesSkeleton = () => (
	<div className="space-y-4">
		<Skeleton className="h-6 w-40" />
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{new Array(6).fill(null).map((_, i) => (
				<div className="rounded-xl border p-4 dark:border-gray-700" key={i}>
					<Skeleton className="h-24 w-full" />
					<Skeleton className="mt-4 h-5 w-24" />
				</div>
			))}
		</div>
	</div>
);

const DesignPanelSkeleton = () => (
	<div className="space-y-4">
		<Skeleton className="h-6 w-40" />
		<div className="space-y-3">
			{new Array(8).fill(null).map((_, i) => (
				<Skeleton className="h-10 w-full" key={i} />
			))}
		</div>
	</div>
);

const PersonalizarClient = () => {
	const { data: session, update } = useSession();
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

	const { profile, userData, isProfileLoading, fetchProfile } = useProfileData(
		session?.user?.id || undefined,
		session?.user?.image || undefined
	);

	const {
		profilePreview,
		isUploadingImage,
		isImageCropModalOpen,
		setIsImageCropModalOpen,
		uploadImage,
		handleProfileImageRemove,
		resetImageState,
		updateOriginalImageUrl,
	} = useProfileImage(
		session?.user?.image ||
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);

	const { userCustomizations, handleTemplateChange } = useCustomizations();

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
			musics: userDataInput.Music || [],
			events: userDataInput.Event || [],
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

	return (
		<div className="min-h-screen w-full bg-white text-black transition-colors dark:bg-zinc-800 dark:text-white">
			{/* Botão flutuante mobile substitui navbar */}
			<button
				aria-label={
					mobileView === "design" ? "Ver preview" : "Voltar ao design"
				}
				className="fixed right-6 bottom-30 z-50 rounded-full bg-black p-3 text-white shadow-lg transition-colors hover:bg-black/90 active:scale-95 md:hidden dark:bg-white"
				onClick={() =>
					handleMobileViewChange(mobileView === "design" ? "preview" : "design")
				}
				type="button"
			>
				{mobileView === "design" ? (
					<Eye className="h-6 w-6 text-white dark:text-black" strokeWidth={1.5} />
				) : (
					<EyeOff className="h-6 w-6 text-white dark:text-black" strokeWidth={1.5} />
				)}
			</button>

			{/* Conteúdo Principal */}
			<div className="md:flex">
				{/* Painel de Edição */}
				<div
					className={`h-screen w-full overflow-y-auto bg-zinc-100 md:h-auto md:flex-1 md:overflow-visible dark:bg-zinc-800 ${
						mobileView === "preview" ? "hidden xl:block" : "block"
					}`}
					ref={designContainerRef}
				>
					<section className="flex min-h-screen flex-col gap-6 px-6 pt-10 pb-24 md:pt-8 md:pr-8 xl:pr-100">
						{isProfileLoading ? (
							<>
								<ProfileSectionSkeleton />
								<section className="border-t pt-6 dark:border-gray-700">
									<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
										Templates
									</h2>
									<TemplatesSkeleton />
								</section>
								<section className="border-t pt-6 dark:border-gray-700">
									<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
										Personalização
									</h2>
									<DesignPanelSkeleton />
								</section>
							</>
						) : (
							<>
								<ProfileSection
									isUploadingImage={isUploadingImage}
									onImageEditClick={() => setIsImageCropModalOpen(true)}
									profilePreview={profilePreview}
								/>

								<section className="border-t pt-6 dark:border-gray-700">
									<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
										Templates
									</h2>
									<CategoriasTemplates
										onTemplateChange={handleTemplateChange}
									/>
								</section>

								<section className="border-t pt-6 dark:border-gray-700">
									<h2 className="mb-4 font-bold text-lg md:text-2xl lg:block dark:text-white">
										Personalização
									</h2>
									<DesignPanel />
								</section>
							</>
						)}
					</section>
				</div>

				{/* Preview Mobile - Visível apenas quando selecionado no mobile */}
				<div
					className={`fixed inset-0 z-40 bg-gray-100 md:hidden dark:bg-zinc-900 ${
						mobileView === "design" ? "hidden" : "block"
					}`}
					ref={previewContainerRef}
				>
					<div className="flex h-full justify-center overflow-y-auto px-6 pt-10 pb-24">
						<div
							className="mx-auto h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-zinc-800"
							style={{
								height: "calc(100vh - 8rem)",
								maxWidth: "365px",
							}}
						>
							{isProfileLoading ? (
								<DesignPreviewSkeleton />
							) : (
								<UserPagePreview />
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Preview Desktop - Visível apenas em md+ */}
			<div className="fixed top-4 right-4 z-50 hidden h-[calc(100vh-2rem)] w-90 rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-900 shadow-2xl xl:block">
				<div className="flex h-full flex-col">
					<div className="flex-1 overflow-y-auto rounded-[2.3rem] bg-white dark:bg-zinc-900">
						{isProfileLoading ? <DesignPreviewSkeleton /> : <UserPagePreview />}
					</div>
				</div>
			</div>

			<ProfileImageCropModal
				currentImageUrl={profilePreview}
				isOpen={isImageCropModalOpen}
				onClose={() => setIsImageCropModalOpen(false)}
				onImageRemove={handleProfileImageRemove}
				onImageSave={async (file) => {
					if (!session?.user?.id) {
						return;
					}
					setIsImageCropModalOpen(false);
					const url = await uploadImage(file, session.user.id);
					if (!url) {
						return;
					}
					updateOriginalImageUrl(url);
					resetImageState();
					if (session?.user) {
						await update({ user: { ...session.user, image: url } });
					}
					window.dispatchEvent(
						new CustomEvent("profileImageUpdated", {
							detail: { imageUrl: url },
						})
					);
					window.dispatchEvent(new CustomEvent("reloadIframePreview"));
				}}
			/>
		</div>
	);
};

export default PersonalizarClient;

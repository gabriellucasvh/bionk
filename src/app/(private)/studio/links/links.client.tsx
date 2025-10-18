// src/app/(private)/studio/links/links.client.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { useDesignStore } from "@/stores/designStore";
import UserPagePreview from "../design/components/UserPagePreview";
import { useCustomizations } from "../design/hooks/useCustomizations";
import { useProfileData } from "../design/hooks/useProfileData";
import UnifiedLinksManager from "./components/links.UnifiedLinksManager";

const LinksStudioClient = () => {
	const { data: session } = useSession();
	const { loadInitialData, updateUserField } = useDesignStore();
	const [mobileView, setMobileView] = useState<"content" | "preview">(
		"content"
	);
	const previewContainerRef = useRef<HTMLDivElement>(null);

	const handleToggleView = () => {
		const next = mobileView === "content" ? "preview" : "content";
		setMobileView(next);
		if (next === "preview" && previewContainerRef.current) {
			setTimeout(() => {
				previewContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
			}, 100);
		}
	};

	const { profile, userData, isProfileLoading, fetchProfile } = useProfileData(
		session?.user?.id || undefined,
		session?.user?.image || undefined
	);

	const { userCustomizations } = useCustomizations();

	// Converte dados do hook para formato do store (como no design)
	const convertUserDataForStore = (userDataInput: any) => {
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

	// Carrega dados iniciais no store
	useEffect(() => {
		if (userData && userCustomizations) {
			const convertedUserData = convertUserDataForStore(userData);
			loadInitialData(convertedUserData, userCustomizations as any);
		}
	}, [userData, userCustomizations, loadInitialData]);

	// Sincroniza campos básicos do perfil no store na inicialização
	useEffect(() => {
		if (profile && userData && !useDesignStore.getState().userData) {
			updateUserField("name", profile.name || userData.name || "");
			updateUserField("bio", profile.bio || userData.bio || "");
			updateUserField("username", profile.username || userData.username || "");
			updateUserField("image", userData.image || "");
		}
	}, [profile, userData]);

	// Recarrega preview quando algum fluxo disparar evento
	useEffect(() => {
		const handleReloadPreview = () => {
			fetchProfile();
		};

		window.addEventListener("reloadIframePreview", handleReloadPreview);
		return () => {
			window.removeEventListener("reloadIframePreview", handleReloadPreview);
		};
	}, [fetchProfile]);

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="min-h-[100dvh] w-full bg-white text-black transition-colors md:min-h-screen dark:bg-neutral-800 dark:text-white">
			{/* Conteúdo */}
			<div
				className={`w-full ${mobileView === "preview" ? "hidden md:block" : "block"}`}
			>
				<div className="md:pr-8 xl:pr-100">
					<UnifiedLinksManager />
				</div>
			</div>

			{/* Botão flutuante de alternância (mobile) */}
			<button
				aria-label={
					mobileView === "content" ? "Ver preview" : "Voltar ao conteúdo"
				}
				className="fixed right-6 bottom-30 z-50 rounded-full bg-lime-400 p-3 text-white shadow-lg transition-colors hover:bg-lime-500 active:scale-95 md:hidden"
				onClick={handleToggleView}
				type="button"
			>
				{mobileView === "content" ? (
					<Eye className="h-6 w-6 text-black" />
				) : (
					<EyeOff className="h-6 w-6 text-black" />
				)}
			</button>

			{/* Preview Mobile - substitui conteúdo quando ativo */}
			<div
				className={`fixed inset-0 z-40 bg-gray-100 md:hidden dark:bg-neutral-900 ${
					mobileView === "content" ? "hidden" : "block"
				}`}
				ref={previewContainerRef}
			>
				<div className="flex h-full justify-center overflow-y-auto px-6 pt-10 pb-20">
					<div
						className="mx-auto h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-neutral-800"
						style={{ height: "calc(100vh - 8rem)", maxWidth: "365px" }}
					>
						<UserPagePreview />
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
		</div>
	);
};

export default LinksStudioClient;

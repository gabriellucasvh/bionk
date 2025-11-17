// src/app/(private)/studio/links/links.client.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDesignStore } from "@/stores/designStore";
import UserPagePreview from "../design/components/UserPagePreview";
import { useCustomizations } from "../design/hooks/useCustomizations";
import { useProfileData } from "../design/hooks/useProfileData";
import UnifiedLinksManager from "./components/UnifiedLinksManager";

const PreviewSkeleton = () => (
	<div className="p-4">
		<Skeleton className="mx-auto mt-4 h-28 w-28 rounded-full" />
		<Skeleton className="mx-auto mt-4 h-6 w-44 rounded-full" />
		<Skeleton className="mx-auto mt-4 h-6 w-44 rounded-full" />
		<div className="mt-4 space-y-3">
			{new Array(5).fill(null).map((_, i) => (
				<div className="rounded-xl p-4 dark:border-zinc-700" key={i}>
					<Skeleton className="h-4 w-48" />
					<Skeleton className="mt-3 h-3 w-full" />
				</div>
			))}
		</div>
	</div>
);

const LinksStudioClient = () => {
	const { data: session } = useSession();
	const { loadInitialData, setUserData } = useDesignStore();
	const [mobileView, setMobileView] = useState<"content" | "preview">(
		"content"
	);
	const previewContainerRef = useRef<HTMLDivElement>(null);
	const didInitialLoad = useRef(false);

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
		session?.user?.image || undefined,
		{ profileOnly: true }
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
			musics: userDataInput.Music || [],
		};
	};

	// Carrega dados iniciais no store (somente uma vez)
	useEffect(() => {
		if (userData && userCustomizations && !didInitialLoad.current) {
			const convertedUserData = convertUserDataForStore(userData);
			loadInitialData(convertedUserData, userCustomizations as any);
			didInitialLoad.current = true;
		}
	}, [userData, userCustomizations, loadInitialData]);

	// Atualiza campos de perfil no store sem limpar conteúdo
	useEffect(() => {
		const storeUser = useDesignStore.getState().userData;
		if (!storeUser) {
			return;
		}
		// Merge leve dos campos de perfil e imagem
		setUserData({
			...storeUser,
			name: profile?.name ?? storeUser.name,
			bio: profile?.bio ?? storeUser.bio,
			username: profile?.username ?? storeUser.username,
			image: userData?.image ?? storeUser.image ?? "",
		});
	}, [profile, userData?.image, setUserData]);

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

	return (
		<div className="min-h-[100dvh] w-full bg-zinc-100 text-black transition-colors md:min-h-screen dark:bg-zinc-800 dark:text-white">
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
				className="preview-toggle fixed right-6 bottom-30 z-50 rounded-full bg-black p-3 text-white shadow-lg transition-colors hover:bg-black/90 active:scale-95 md:hidden dark:bg-white"
				onClick={handleToggleView}
				type="button"
			>
				{mobileView === "content" ? (
					<Eye
						className="h-6 w-6 text-white dark:text-black"
						strokeWidth={1.5}
					/>
				) : (
					<EyeOff
						className="h-6 w-6 text-white dark:text-black"
						strokeWidth={1.5}
					/>
				)}
			</button>

			{/* Preview Mobile - substitui conteúdo quando ativo */}
			<div
				className={`fixed inset-0 z-40 bg-zinc-100 md:hidden dark:bg-zinc-900 ${
					mobileView === "preview" ? "block" : "hidden"
				}`}
			>
				<div className="flex h-full justify-center overflow-y-auto px-6 pt-10 pb-20">
					<div
						className="mx-auto h-full w-full overflow-hidden rounded-3xl bg-white shadow-lg dark:bg-zinc-800"
						ref={previewContainerRef}
						style={{ height: "calc(100vh - 8rem)", maxWidth: "390px" }}
					>
						{isProfileLoading ? <PreviewSkeleton /> : <UserPagePreview />}
					</div>
				</div>
			</div>

			{/* Preview Desktop - simulando frame de celular (xl+) */}
			<div className="fixed top-4 right-4 z-50 hidden h-[calc(100vh-2rem)] w-[380px] rounded-[2rem] border-4 border-zinc-800 bg-zinc-900 shadow-2xl xl:block">
				<div className="flex h-full flex-col">
					<div className="flex-1 overflow-y-auto rounded-[1.5rem] bg-white dark:bg-zinc-900">
						{isProfileLoading ? <PreviewSkeleton /> : <UserPagePreview />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default LinksStudioClient;

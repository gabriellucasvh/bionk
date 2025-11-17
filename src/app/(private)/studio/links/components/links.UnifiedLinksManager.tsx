// app/studio/links/components/UnifiedLinksManager.tsx

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesignStore } from "@/stores/designStore";
import type { SocialLinkItem } from "@/types/social";
import type {
	EventItem,
	ImageItem,
	LinkItem,
	MusicItem,
	SectionItem,
	TextItem,
	VideoItem,
} from "../types/links.types";
import { fetcher } from "../utils/links.helpers";

import LinksTabContent from "./links.LinksTabContent";
import SocialLinksTabContent from "./links.SocialLinksTabContent";

const LinksSkeleton = () => (
	<div className="space-y-3">
		<div className="flex items-center justify-between">
			<Skeleton className="h-12 w-full rounded-full" />
		</div>
		{new Array(4).fill(null).map((_, i) => (
			<div className="rounded-xl p-4 dark:border-zinc-700" key={i}>
				<div className="flex items-center gap-3">
					<Skeleton className="h-5 w-5" />
					<Skeleton className="h-4 w-48" />
					<div className="ml-auto flex gap-2">
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-16" />
					</div>
				</div>
				<Skeleton className="mt-3 h-3 w-full" />
			</div>
		))}
	</div>
);

const UnifiedLinksManager = () => {
	const { data: session, status } = useSession();
	const userId = session?.user?.id;
	const [activeTab, setActiveTab] = useState<"links" | "socials">("links");
	const hasLoadedSocials = useRef(false);
	const hasLoadedVideos = useRef(false);
	const hasLoadedImages = useRef(false);
	const hasLoadedMusics = useRef(false);
	const hasLoadedEvents = useRef(false);
	const hasLoadedLinks = useRef(false);
	const hasLoadedTexts = useRef(false);
	const hasLoadedSections = useRef(false);

	// Resumo de conteúdo para decidir carregamentos sob demanda
	const { data: summaryData, isLoading: isLoadingSummary } = useSWR<{
		linksCount: number;
		textsCount: number;
		videosCount: number;
		imagesCount: number;
		musicsCount: number;
		socialLinksCount: number;
		sectionsCount: number;
	}>(userId ? "/api/content-summary" : null, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		revalidateIfStale: false,
	});

	// Hook SWR para links padrão
	const {
		data: linksData,
		mutate: mutateLinks,
		isLoading: isLoadingLinks,
	} = useSWR<{ links: LinkItem[] }>(userId ? "/api/links" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	// Hook SWR para links sociais (mantido montado; busca apenas na primeira entrada da aba)
	const { data: socialLinksData, mutate: mutateSocialLinks } = useSWR<{
		socialLinks: SocialLinkItem[];
	}>(userId ? "/api/social-links" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	// Dispara a primeira busca de socials apenas quando há redes existentes e a aba é ativada
	useEffect(() => {
		if (
			activeTab === "socials" &&
			userId &&
			!hasLoadedSocials.current &&
			(summaryData?.socialLinksCount ?? 0) > 0
		) {
			hasLoadedSocials.current = true;
			mutateSocialLinks();
		}
	}, [activeTab, userId, summaryData?.socialLinksCount, mutateSocialLinks]);

	// Faz pelo menos uma busca inicial de socials quando existir conteúdo, independente da aba ativa
	useEffect(() => {
		if (
			userId &&
			!hasLoadedSocials.current &&
			(summaryData?.socialLinksCount ?? 0) > 0
		) {
			hasLoadedSocials.current = true;
			mutateSocialLinks();
		}
	}, [userId, summaryData?.socialLinksCount, mutateSocialLinks]);

	// Hook SWR para seções
	const {
		data: sectionsData,
		mutate: mutateSections,
		isLoading: isLoadingSections,
	} = useSWR<SectionItem[]>(userId ? "/api/sections" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	// Hook SWR para textos
	const {
		data: textsData,
		mutate: mutateTexts,
		isLoading: isLoadingTexts,
	} = useSWR<{ texts: TextItem[] }>(userId ? "/api/texts" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	// Hooks SWR para vídeos / imagens / músicas (montados sem revalidação automática)
	const {
		data: videosData,
		mutate: mutateVideos,
		isLoading: isLoadingVideos,
	} = useSWR<{ videos: VideoItem[] }>(userId ? "/api/videos" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	const {
		data: imagesData,
		mutate: mutateImages,
		isLoading: isLoadingImages,
	} = useSWR<{ images: ImageItem[] }>(userId ? "/api/images" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	const {
		data: musicsData,
		mutate: mutateMusics,
		isLoading: isLoadingMusics,
	} = useSWR<{ musics: MusicItem[] }>(userId ? "/api/musics" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	const { data: eventsData, mutate: mutateEvents } = useSWR<{
		events: EventItem[];
	}>(userId ? "/api/events" : null, fetcher, {
		revalidateOnMount: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		revalidateOnReconnect: false,
	});

	// Carregar mídias apenas se existir motivo (contagem > 0) ou ação do usuário
	useEffect(() => {
		if (
			activeTab === "links" &&
			!hasLoadedVideos.current &&
			(summaryData?.videosCount ?? 0) > 0
		) {
			hasLoadedVideos.current = true;
			mutateVideos();
		}
	}, [activeTab, summaryData?.videosCount, mutateVideos]);

	useEffect(() => {
		if (
			activeTab === "links" &&
			!hasLoadedImages.current &&
			(summaryData?.imagesCount ?? 0) > 0
		) {
			hasLoadedImages.current = true;
			mutateImages();
		}
	}, [activeTab, summaryData?.imagesCount, mutateImages]);

	useEffect(() => {
		if (
			activeTab === "links" &&
			!hasLoadedMusics.current &&
			(summaryData?.musicsCount ?? 0) > 0
		) {
			hasLoadedMusics.current = true;
			mutateMusics();
		}
	}, [activeTab, summaryData?.musicsCount, mutateMusics]);

	useEffect(() => {
		if (activeTab === "links" && userId && !hasLoadedEvents.current) {
			hasLoadedEvents.current = true;
			mutateEvents();
		}
	}, [activeTab, userId, mutateEvents]);

	// Carregar links/textos/seções apenas se houver itens e estiver na aba
	useEffect(() => {
		if (
			activeTab === "links" &&
			userId &&
			!hasLoadedLinks.current &&
			(summaryData?.linksCount ?? 0) > 0
		) {
			hasLoadedLinks.current = true;
			mutateLinks();
		}
	}, [activeTab, userId, summaryData?.linksCount, mutateLinks]);

	useEffect(() => {
		if (
			activeTab === "links" &&
			userId &&
			!hasLoadedSections.current &&
			(summaryData?.sectionsCount ?? 0) > 0
		) {
			hasLoadedSections.current = true;
			mutateSections();
		}
	}, [activeTab, userId, summaryData?.sectionsCount, mutateSections]);

	useEffect(() => {
		if (
			activeTab === "links" &&
			userId &&
			!hasLoadedTexts.current &&
			(summaryData?.textsCount ?? 0) > 0
		) {
			hasLoadedTexts.current = true;
			mutateTexts();
		}
	}, [activeTab, userId, summaryData?.textsCount, mutateTexts]);

	// Sincroniza o preview em tempo real com os dados do SWR
	useEffect(() => {
		const storeUser = useDesignStore.getState().userData;
		if (!storeUser) {
			return;
		}

		const mergedLinks = [
			...(linksData?.links || []),
			...(socialLinksData?.socialLinks || []),
		];

		useDesignStore.getState().setUserData({
			...storeUser,
			links: mergedLinks as any,
			texts: (textsData?.texts || []) as any,
			videos: (videosData?.videos || []) as any,
			images: (imagesData?.images || []) as any,
			musics: (musicsData?.musics || []) as any,
			events: (eventsData?.events || []) as any,
		});
	}, [
		linksData,
		socialLinksData,
		textsData,
		videosData,
		imagesData,
		musicsData,
		eventsData,
	]);

	const showLinksLoader =
		activeTab === "links" &&
		(summaryData?.linksCount ?? 0) > 0 &&
		isLoadingLinks;
	const showSectionsLoader =
		activeTab === "links" &&
		(summaryData?.sectionsCount ?? 0) > 0 &&
		isLoadingSections;
	const showTextsLoader =
		activeTab === "links" &&
		(summaryData?.textsCount ?? 0) > 0 &&
		isLoadingTexts;
	const showVideosLoader =
		activeTab === "links" &&
		(summaryData?.videosCount ?? 0) > 0 &&
		isLoadingVideos;
	const showImagesLoader =
		activeTab === "links" &&
		(summaryData?.imagesCount ?? 0) > 0 &&
		isLoadingImages;
	const showMusicsLoader =
		activeTab === "links" &&
		(summaryData?.musicsCount ?? 0) > 0 &&
		isLoadingMusics;

	const isLinksSkeletonLoading =
		status === "loading" ||
		isLoadingSummary ||
		showLinksLoader ||
		showSectionsLoader ||
		showTextsLoader ||
		showVideosLoader ||
		showImagesLoader ||
		showMusicsLoader;

	const renderLinksContent = () => {
		if (isLinksSkeletonLoading) {
			return <LinksSkeleton />;
		}
		return (
			<LinksTabContent
				currentEvents={eventsData?.events || []}
				currentImages={imagesData?.images || []}
				currentLinks={linksData?.links || []}
				currentMusics={musicsData?.musics || []}
				currentSections={sectionsData || []}
				currentTexts={textsData?.texts || []}
				currentVideos={videosData?.videos || []}
				mutateEvents={mutateEvents}
				mutateImages={mutateImages}
				mutateLinks={mutateLinks}
				mutateMusics={mutateMusics}
				mutateSections={mutateSections}
				mutateTexts={mutateTexts}
				mutateVideos={mutateVideos}
				session={session}
			/>
		);
	};

	return (
		<section className="mx-auto min-h-dvh w-full max-w-4xl touch-manipulation pb-4">
			<Tabs
				className="w-full"
				onValueChange={(v) => setActiveTab(v as "links" | "socials")}
				value={activeTab}
			>
				<Card className="rounded-t-none border-none bg-zinc-100 px-4 shadow-none dark:bg-zinc-800">
					<CardHeader className="flex flex-col items-start justify-between px-2 sm:flex-row sm:px-6 lg:items-center">
						<div className="mb-4 sm:mb-0">
							<CardTitle className="text-xl sm:text-2xl">
								Gerenciador de Links
							</CardTitle>
							<CardDescription className="mt-1.5 text-sm">
								Organize seus links e redes sociais em um só lugar.
							</CardDescription>
						</div>
						<TabsList className="rounded-full bg-zinc-200 dark:bg-zinc-700">
							<TabsTrigger className="rounded-full" value="links">
								Meus Links
							</TabsTrigger>
							<TabsTrigger className="rounded-full" value="socials">
								Redes Sociais
							</TabsTrigger>
						</TabsList>
					</CardHeader>
					<CardContent className="space-y-4 p-2 sm:p-6">
						<TabsContent className="mt-0" value="links">
							{renderLinksContent()}
						</TabsContent>

						<TabsContent className="mt-0" value="socials">
							<SocialLinksTabContent
								initialSocialLinks={socialLinksData?.socialLinks || []}
								mutateSocialLinks={mutateSocialLinks}
								session={session}
							/>
						</TabsContent>
					</CardContent>
				</Card>
			</Tabs>
		</section>
	);
};

export default UnifiedLinksManager;

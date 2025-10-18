// app/studio/links/components/UnifiedLinksManager.tsx

"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import LoadingPage from "@/components/layout/LoadingPage";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SocialLinkItem } from "@/types/social";
import type {
	LinkItem,
	SectionItem,
	TextItem,
	VideoItem,
	ImageItem,
} from "../types/links.types";
import { fetcher } from "../utils/links.helpers";

import LinksTabContent from "./links.LinksTabContent";
import SocialLinksTabContent from "./links.SocialLinksTabContent";

const UnifiedLinksManager = () => {
	const { data: session, status } = useSession();
	const userId = session?.user?.id;

	// Hook SWR para links padrão
	const {
		data: linksData,
		mutate: mutateLinks,
		isLoading: isLoadingLinks,
	} = useSWR<{ links: LinkItem[] }>(
		userId ? `/api/links?userId=${userId}` : null,
		fetcher
	);

	// Hook SWR para links sociais
	const {
		data: socialLinksData,
		mutate: mutateSocialLinks,
		isLoading: isLoadingSocialLinks,
	} = useSWR<{ socialLinks: SocialLinkItem[] }>(
		userId ? `/api/social-links?userId=${userId}` : null,
		fetcher
	);

	// Hook SWR para seções
	const {
		data: sectionsData,
		mutate: mutateSections,
		isLoading: isLoadingSections,
	} = useSWR<SectionItem[]>(userId ? "/api/sections" : null, fetcher);

	// Hook SWR para textos
	const {
		data: textsData,
		mutate: mutateTexts,
		isLoading: isLoadingTexts,
	} = useSWR<{ texts: TextItem[] }>(
		userId ? `/api/texts?userId=${userId}` : null,
		fetcher
	);

	// Hook SWR para vídeos
	const {
		data: videosData,
		mutate: mutateVideos,
		isLoading: isLoadingVideos,
	} = useSWR<{ videos: VideoItem[] }>(
		userId ? `/api/videos?userId=${userId}` : null,
		fetcher
	);

	// Hook SWR para imagens (unificado com os demais)
	const {
		data: imagesData,
		mutate: mutateImages,
		isLoading: isLoadingImages,
	} = useSWR<{ images: ImageItem[] }>(userId ? "/api/images" : null, fetcher);

	if (
		status === "loading" ||
		isLoadingLinks ||
		isLoadingSocialLinks ||
		isLoadingSections ||
		isLoadingTexts ||
		isLoadingVideos ||
		isLoadingImages
	) {
		return <LoadingPage />;
	}

	return (
		<section className="mx-auto min-h-dvh w-full max-w-4xl touch-manipulation pb-4">
			<Tabs className="w-full" defaultValue="links">
				<Card className="border-none px-4 shadow-none dark:bg-neutral-800">
					<CardHeader className="flex flex-col items-start justify-between px-2 sm:px-6 lg:flex-row lg:items-center">
						<div className="mb-4 sm:mb-0">
							<CardTitle className="text-xl sm:text-2xl">
								Gerenciador de Links
							</CardTitle>
							<CardDescription className="mt-1.5 text-sm">
								Organize seus links e redes sociais em um só lugar.
							</CardDescription>
						</div>
						<TabsList>
							<TabsTrigger value="links">Meus Links</TabsTrigger>
							<TabsTrigger value="socials">Redes Sociais</TabsTrigger>
						</TabsList>
					</CardHeader>
					<CardContent className="space-y-4 p-2 sm:p-6">
						<TabsContent className="mt-0" value="links">
							<LinksTabContent
								currentLinks={linksData?.links || []}
								currentSections={sectionsData || []}
								currentTexts={textsData?.texts || []}
								currentVideos={videosData?.videos || []}
								currentImages={imagesData?.images || []}
								mutateLinks={mutateLinks}
								mutateSections={mutateSections}
								mutateTexts={mutateTexts}
								mutateVideos={mutateVideos}
								mutateImages={mutateImages}
								session={session}
							/>
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

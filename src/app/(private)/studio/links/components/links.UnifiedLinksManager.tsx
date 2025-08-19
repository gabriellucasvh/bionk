// app/studio/links/components/UnifiedLinksManager.tsx

"use client";

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
import { useSession } from "next-auth/react";
import useSWR from "swr";
import type { LinkItem } from "../types/links.types";
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

	if (status === "loading" || isLoadingLinks || isLoadingSocialLinks) {
		return <LoadingPage />;
	}

	return (
		<section className="w-full max-w-4xl touch-manipulation">
			<Tabs className="w-full" defaultValue="links">
				<Card className="border-none shadow-none">
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
								initialLinks={linksData?.links || []}
								mutateLinks={async () => {
									await mutateLinks();
								}}
								session={session}
							/>
						</TabsContent>

						<TabsContent className="mt-0" value="socials">
							<SocialLinksTabContent
								initialSocialLinks={socialLinksData?.socialLinks || []}
								mutateSocialLinks={async () => {
									await mutateSocialLinks();
								}}
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

// src/app/[username]/page.tsx

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { allProfileTags, profilePageCacheKey } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import type { UserProfile as UserProfileData } from "@/types/user-profile";
import { UserProfileWrapper } from "./UserProfileWrapper";

interface PageProps {
	params: Promise<{ username: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { username } = await params;
	return {
		title: `${username} | Bionk`,
	};
}

export const revalidate = 1800;
export const dynamic = "force-static";

export default async function UserPage({ params }: PageProps) {
	const { username } = await params;
	const now = new Date();

	// uso de getRedis centralizado

	const getUserCached = unstable_cache(
		async () => {
			const base = await prisma.user.findUnique({
				where: { username },
				select: {
					id: true,
					username: true,
					name: true,
					bio: true,
					image: true,
					template: true,
					templateCategory: true,
					sensitiveProfile: true,
					isBanned: true,
					banReason: true,
					bannedAt: true,
				},
			});

			if (!base) {
				return null;
			}

			const u: any = { ...base };

			try {
				u.Link = await prisma.link.findMany({
					where: {
						userId: base.id,
						active: true,
						archived: false,
						OR: [{ launchesAt: null }, { launchesAt: { lte: now } }],
						AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
					},
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						url: true,
						order: true,
						type: true,
						sectionId: true,
						clicks: true,
						customImageUrl: true,
						badge: true,
						password: true,
						animated: true,
						expiresAt: true,
						deleteOnClicks: true,
						shareAllowed: true,
						section: { select: { id: true, title: true } },
					},
				});
			} catch {
				u.Link = [];
			}

			try {
				u.SocialLink = await prisma.socialLink.findMany({
					where: { userId: base.id, active: true },
					orderBy: { order: "asc" },
					select: {
						id: true,
						platform: true,
						url: true,
						order: true,
						active: true,
					},
				});
			} catch {
				u.SocialLink = [];
			}

			try {
				u.Text = await prisma.text.findMany({
					where: { userId: base.id, active: true, archived: false },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						description: true,
						position: true,
						hasBackground: true,
						active: true,
						order: true,
						userId: true,
						isCompact: true,
						sectionId: true,
						section: { select: { id: true, title: true } },
					},
				});
			} catch {
				u.Text = [];
			}

			try {
				u.Video = await prisma.video.findMany({
					where: { userId: base.id, active: true, archived: false },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						description: true,
						type: true,
						url: true,
						thumbnailUrl: true,
						order: true,
						active: true,
						userId: true,
						sectionId: true,
						section: { select: { id: true, title: true } },
					},
				});
			} catch {
				u.Video = [];
			}

			try {
				u.Image = await prisma.image.findMany({
					where: { userId: base.id, active: true, archived: false },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						description: true,
						layout: true,
						ratio: true,
						sizePercent: true,
						items: true,
						order: true,
						active: true,
						userId: true,
						sectionId: true,
						section: { select: { id: true, title: true } },
					},
				});
			} catch {
				u.Image = [];
			}

			try {
				u.Music = await prisma.music.findMany({
					where: { userId: base.id, active: true, archived: false },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						url: true,
						authorName: true,
						thumbnailUrl: true,
						usePreview: true,
						order: true,
						active: true,
						userId: true,
						sectionId: true,
						section: { select: { id: true, title: true } },
					},
				});
			} catch {
				u.Music = [];
			}

			try {
				u.Event = await prisma.event.findMany({
					where: { userId: base.id, active: true },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						location: true,
						eventDate: true,
						eventTime: true,
						externalLink: true,
						type: true,
						coverImageUrl: true,
						order: true,
						userId: true,
					},
				});
			} catch {
				u.Event = [];
			}

			try {
				u.Section = await prisma.section.findMany({
					where: { userId: base.id, active: true },
					orderBy: { order: "asc" },
					select: {
						id: true,
						title: true,
						order: true,
						active: true,
						links: {
							where: {
								active: true,
								archived: false,
								OR: [{ launchesAt: null }, { launchesAt: { lte: now } }],
								AND: [
									{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
								],
							},
							orderBy: { order: "asc" },
							select: {
								id: true,
								title: true,
								url: true,
								order: true,
								type: true,
							},
						},
					},
				});
			} catch {
				u.Section = [];
			}

			try {
				u.CustomPresets = await prisma.customPresets.findUnique({
					where: { userId: base.id },
					select: {
						id: true,
						customBackgroundColor: true,
						customBackgroundGradient: true,
						customBackgroundMediaType: true,
						customBackgroundImageUrl: true,
						customBackgroundVideoUrl: true,
						customTextColor: true,
						customFont: true,
						customButtonColor: true,
						customButtonTextColor: true,
						customButtonStyle: true,
						customButtonFill: true,
						customButtonCorners: true,
						headerStyle: true,
						customBlurredBackground: true,
					},
				});
			} catch {
				u.CustomPresets = null;
			}

			return u as UserProfileData;
		},
		["user-profile", username],
		{ revalidate: 1800, tags: allProfileTags(username) }
	);

	let user: UserProfileData | null = null;

	try {
		const r = getRedis();
		const key = profilePageCacheKey(username);
		const cached = await r.get<string | null>(key);
		if (cached) {
			user = JSON.parse(cached) as UserProfileData | null;
		}
	} catch {}

	if (!user) {
		user = await getUserCached();
		try {
			const r = getRedis();
			const key = profilePageCacheKey(username);
			await r.set(key, JSON.stringify(user), { ex: 60 });
		} catch {}
	}

	if (!user) {
		notFound();
	}

	const category = user.templateCategory ?? "classicos";
	const name = user.template ?? "default";

	// Otimização: Import mais eficiente com fallback
	let TemplateComponent: ComponentType<{ user: UserProfileData }>;

	try {
		// Tenta carregar o template específico
		TemplateComponent = (
			await import(`@/app/[username]/templates/${category}/${name}.tsx`)
		).default;
	} catch {
		// Fallback para template padrão
		TemplateComponent = (
			await import("@/app/[username]/templates/classicos/default")
		).default;
	}

	return (
		<main>
			<UserProfileWrapper user={user}>
				<TemplateComponent user={user} />
			</UserProfileWrapper>
		</main>
	);
}

// src/app/[username]/page.tsx

import prisma from "@/lib/prisma";
import type { UserProfile as UserProfileData } from "@/types/user-profile";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

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

export const revalidate = false; // ISR estático - páginas servidas da CDN até revalidação manual

export default async function UserPage({ params }: PageProps) {
	const { username } = await params;
	const now = new Date();

	// Otimização: Query mais eficiente com select específico
	const user = (await prisma.user.findUnique({
		where: { username },
		select: {
			id: true,
			username: true,
			name: true,
			bio: true,
			image: true,
			template: true,
			templateCategory: true,
			Section: {
				where: { active: true },
				orderBy: { order: "asc" },
				select: {
					id: true,
					title: true,
					order: true,
					links: {
						where: {
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
							clicks: true,
						},
					},
				},
			},
			Link: {
				where: {
					active: true,
					archived: false,
					sectionId: null,
					OR: [{ launchesAt: null }, { launchesAt: { lte: now } }],
					AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
				},
				orderBy: { order: "asc" },
				select: {
					id: true,
					title: true,
					url: true,
					order: true,
					clicks: true,
				},
			},
			SocialLink: {
				where: { active: true },
				orderBy: { order: "asc" },
				select: {
					id: true,
					platform: true,
					url: true,
					order: true,
				},
			},
			CustomPresets: {
				select: {
					id: true,
					customBackgroundColor: true,
					customBackgroundGradient: true,
					customTextColor: true,
					customButton: true,
					customButtonFill: true,
					customButtonCorners: true,
					customFont: true,
				},
			},
		},
	})) as UserProfileData | null;

	if (!user) {
		notFound();
	}

	const category = user.templateCategory ?? "minimalista";
	const name = user.template ?? "default";

	// Otimização: Import mais eficiente com fallback
	let TemplateComponent: ComponentType<{ user: UserProfileData }>;

	try {
		// Tenta carregar o template específico
		TemplateComponent = (await import(
			`@/app/[username]/templates/${category}/${name}.tsx`
		)).default;
	} catch {
		// Fallback para template padrão
		TemplateComponent = (await import(
			"@/app/[username]/templates/minimalista/default"
		)).default;
	}

	return (
		<main>
			<TemplateComponent user={user} />
		</main>
	);
}

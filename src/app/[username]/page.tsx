// src/app/[username]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import prisma from "@/lib/prisma";
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

export const revalidate = false; // ISR estático - páginas servidas da CDN até revalidação manual

export default async function UserPage({ params }: PageProps) {
	const { username } = await params;
	const now = new Date();

	// Query unificada para buscar todos os itens (links e seções) ordenados
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
			sensitiveProfile: true,
			isBanned: true,
			banReason: true,
			bannedAt: true,
			// Busca todos os links (incluindo seções) de forma unificada
			Link: {
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
					type: true,
					sectionId: true,
					clicks: true,
					customImageUrl: true,
					badge: true,
					password: true,
					animated: true,
					section: {
						select: {
							id: true,
							title: true,
						},
					},
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
					active: true,
				},
			},
			Text: {
				where: { active: true },
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
					section: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			},
			Video: {
				where: { active: true, archived: false },
				orderBy: { order: "asc" },
				select: {
					id: true,
					title: true,
					description: true,
					type: true,
					url: true,
					order: true,
					active: true,
					userId: true,
					sectionId: true,
					section: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			},
			Section: {
				where: { active: true },
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
							AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
						},
						orderBy: { order: "asc" },
						select: {
							id: true,
							title: true,
							url: true,
							order: true,
							type: true,
							clicks: true,
							customImageUrl: true,
							badge: true,
							password: true,
							animated: true,
						},
					},
				},
			},
			CustomPresets: {
				select: {
					id: true,
					customBackgroundColor: true,
					customBackgroundGradient: true,
					customTextColor: true,
					customButtonTextColor: true,
					customButtonStyle: true,
					customButtonFill: true,
					customButtonCorners: true,
					customFont: true,
					headerStyle: true,
					customButtonColor: true,
				},
			},
		},
	})) as UserProfileData | null;

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

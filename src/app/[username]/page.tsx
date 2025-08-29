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

export const revalidate = 0;

export default async function UserPage({ params }: PageProps) {
	const { username } = await params;
	const now = new Date();

	const user = (await prisma.user.findUnique({
		where: { username },
		include: {
			Section: {
				where: {
					active: true, // Adicionado: Filtra para buscar apenas seções ativas
				},
				orderBy: {
					order: "asc",
				},
				include: {
					links: {
						where: {
							active: true,
							archived: false,
							AND: [
								{ OR: [{ launchesAt: null }, { launchesAt: { lte: now } }] },
								{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
							],
						},
						orderBy: {
							order: "asc",
						},
					},
				},
			},
			Link: {
				where: {
					active: true,
					archived: false,
					sectionId: null,
					AND: [
						{ OR: [{ launchesAt: null }, { launchesAt: { lte: now } }] },
						{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
					],
				},
				orderBy: {
					order: "asc",
				},
			},
			SocialLink: {
				where: {
					active: true,
				},
				orderBy: {
					order: "asc",
				},
			},
			CustomPresets: true,
		},
	})) as UserProfileData | null;

	if (!user) {
		notFound();
	}

	const category = user.templateCategory ?? "minimalista";
	const name = user.template ?? "default";

	let TemplateComponent: ComponentType<{ user: UserProfileData }>;

	try {
		const mod = await import(
			`@/app/[username]/templates/${category}/${name}.tsx`
		);
		TemplateComponent = mod.default as ComponentType<{
			user: UserProfileData;
		}>;
	} catch {
		const mod = await import("@/app/[username]/templates/minimalista/default");
		TemplateComponent = mod.default as ComponentType<{
			user: UserProfileData;
		}>;
	}

	return (
		<main>
			<TemplateComponent user={user} />
		</main>
	);
}

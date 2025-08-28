// src/app/[username]/page.tsx

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

type UserProfileData = Prisma.UserGetPayload<{
	include: {
		Link: { where: { active: true }; orderBy: { order: "asc" } };
		SocialLink: { orderBy: { platform: "asc" } };
		CustomPresets: true;
	};
}>;

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

// Para evitar que a página use um cache antigo, forçamos a revalidação.
export const revalidate = 0;

export default async function UserPage({ params }: PageProps) {
	// CORREÇÃO: Adicionado 'await' para resolver a Promise.
	const { username } = await params;
	const now = new Date();

	const user = (await prisma.user.findUnique({
		where: { username },
		include: {
			Link: {
				where: {
					active: true,
					AND: [
						{
							// Condição de Lançamento:
							OR: [
								{ launchesAt: null }, // Ou não tem data de lançamento
								{ launchesAt: { lte: now } }, // Ou a data de lançamento já passou
							],
						},
						{
							// Condição de Expiração:
							OR: [
								{ expiresAt: null }, // Ou não tem data de expiração
								{ expiresAt: { gte: now } }, // Ou a data de expiração ainda não chegou
							],
						},
					],
				},
				orderBy: { order: "asc" },
			},
			SocialLink: {
				where: {
					active: true,
				},
				orderBy: {
					order: "asc", // Adicionado para ordenar os ícones sociais
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

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
	params: { username: string };
}

// Otimização 1: generateStaticParams para pré-renderizar páginas na build
export async function generateStaticParams() {
	const users = await prisma.user.findMany({
		select: { username: true },
	});

	return users.map((user) => ({
		username: user.username,
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const user = await prisma.user.findUnique({
		where: { username: params.username },
		select: { name: true, username: true },
	});

	if (!user) {
		return { title: "Usuário não encontrado | Bionk" };
	}

	return {
		title: `${user.name ?? user.username} | Bionk`,
	};
}

// Otimização 2: Revalidação Incremental (ISR) a cada 60 segundos
export const revalidate = 60;

export default async function UserPage({ params }: PageProps) {
	const { username } = params;
	const now = new Date();

	const user = (await prisma.user.findUnique({
		where: { username },
		include: {
			Link: {
				where: {
					active: true,
					AND: [
						{
							OR: [{ launchesAt: null }, { launchesAt: { lte: now } }],
						},
						{
							OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
						},
					],
				},
				orderBy: { order: "asc" },
			},
			SocialLink: {
				orderBy: { platform: "asc" },
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

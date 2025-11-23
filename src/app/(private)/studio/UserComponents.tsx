// src/app/(private)/studio/UserComponents.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { FC } from "react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type UserWithLinks = any;

export default async function UserComponent() {
	const session = await getServerSession(authOptions);
	const username = session?.user?.username;

	if (!username) {
		return notFound();
	}

	const user = await prisma.user.findUnique({
		where: { username },
		include: {
			Link: {
				where: { active: true },
				orderBy: { order: "asc" },
			},
		},
	});

	if (!user?.username) {
		return notFound();
	}

	const safeUser = user as UserWithLinks;

	const templateCategory = user.templateCategory || "classicos";
	const templateName = user.template || "default";

	let TemplateComponent: FC<{ user: UserWithLinks }>;

	try {
		TemplateComponent = (
			await import(
				`@/app/[username]/templates/${templateCategory}/${templateName}`
			)
		).default as FC<{ user: UserWithLinks }>;
	} catch {
		TemplateComponent = (
			await import("@/app/[username]/templates/classicos/default")
		).default as FC<{ user: UserWithLinks }>;
	}

	return <TemplateComponent user={safeUser} />;
}

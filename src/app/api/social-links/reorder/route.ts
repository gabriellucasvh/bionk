// src/app/api/social-links/reorder/route.ts

import { revalidatePath, revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import { profileSocialLinksTag, evictProfilePageCache } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse | Response> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const { orderedLinks } = await req.json();

		const updatePromises = orderedLinks.map(
			(link: { id: string; order: number }) =>
				prisma.socialLink.update({
					where: {
						id: link.id,
						userId: session.user.id,
					},
					data: {
						order: link.order,
					},
				})
		);

		await prisma.$transaction(updatePromises);

		revalidatePath("/studio/links");
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileSocialLinksTag(user.username));
			await evictProfilePageCache(user.username);
		}

		return NextResponse.json({ message: "Order updated successfully" });
	} catch {
		return new Response("Internal Server Error", { status: 500 });
	}
}

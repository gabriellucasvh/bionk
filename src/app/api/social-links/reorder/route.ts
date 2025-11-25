// src/app/api/social-links/reorder/route.ts

import { authOptions } from "@/lib/auth";
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

		return NextResponse.json({ message: "Order updated successfully" });
	} catch {
		return new Response("Internal Server Error", { status: 500 });
	}
}

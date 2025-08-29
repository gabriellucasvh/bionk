import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const sections = await prisma.section.findMany({
		where: { userId: session.user.id },
		orderBy: { order: "asc" },
		include: { links: true },
	});

	return NextResponse.json(sections);
}

export async function POST(req: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { title } = await req.json();
	const lastSection = await prisma.section.findFirst({
		where: { userId: session.user.id },
		orderBy: { order: "desc" },
	});

	const newSection = await prisma.section.create({
		data: {
			title,
			order: lastSection ? lastSection.order + 1 : 0,
			userId: session.user.id,
		},
	});

	return NextResponse.json(newSection);
}

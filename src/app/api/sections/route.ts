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

	// Transformar para incluir dbId
	const transformedSections = sections.map(section => ({
		...section,
		id: `section-${section.id}`,
		dbId: section.id,
	}));

	return NextResponse.json(transformedSections);
}

export async function POST(req: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { title } = await req.json();
	
	// Buscar o menor order entre links e seções para colocar a nova seção no topo
	const [minLink, minSection] = await Promise.all([
		prisma.link.findFirst({
			where: { userId: session.user.id },
			orderBy: { order: "asc" },
		}),
		prisma.section.findFirst({
			where: { userId: session.user.id },
			orderBy: { order: "asc" },
		})
	]);
	
	const minOrder = Math.min(
		minLink?.order ?? 0,
		minSection?.order ?? 0
	);
	
	const newSection = await prisma.section.create({
		data: {
			title,
			order: minOrder - 1,
			userId: session.user.id,
		},
	});

	return NextResponse.json(newSection);
}

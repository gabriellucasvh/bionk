import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.user.banido) {
		return NextResponse.json(
			{ 
				error: "Conta suspensa", 
				message: "Sua conta foi suspensa e não pode realizar esta ação." 
			},
			{ status: 403 }
		);
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

	if (session.user.banido) {
		return NextResponse.json(
			{ 
				error: "Conta suspensa", 
				message: "Sua conta foi suspensa e não pode realizar esta ação." 
			},
			{ status: 403 }
		);
	}

	const { title } = await req.json();
	
	// Incrementar order de todos os links, textos e seções existentes do usuário
	await prisma.$transaction([
		prisma.link.updateMany({
			where: { userId: session.user.id },
			data: { order: { increment: 1 } },
		}),
		prisma.text.updateMany({
			where: { userId: session.user.id },
			data: { order: { increment: 1 } },
		}),
		prisma.section.updateMany({
			where: { userId: session.user.id },
			data: { order: { increment: 1 } },
		}),
	]);
	
	const newSection = await prisma.section.create({
		data: {
			title,
			order: 0,
			userId: session.user.id,
		},
	});

	return NextResponse.json(newSection);
}

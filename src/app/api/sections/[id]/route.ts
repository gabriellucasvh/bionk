import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { title, active } = await req.json();
	const section = await prisma.section.update({
		where: { id: Number(params.id), userId: session.user.id },
		data: { title, active },
	});

	if (active === false) {
		await prisma.link.updateMany({
			where: { sectionId: Number(params.id) },
			data: { active: false },
		});
	}

	return NextResponse.json(section);
}

export async function DELETE(
	_req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await prisma.link.updateMany({
		where: { sectionId: Number(params.id) },
		data: { archived: true },
	});

	await prisma.section.delete({
		where: { id: Number(params.id), userId: session.user.id },
	});

	return NextResponse.json({ message: "Section deleted" });
}

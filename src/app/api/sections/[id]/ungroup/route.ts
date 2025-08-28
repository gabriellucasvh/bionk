import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
	_req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	await prisma.link.updateMany({
		where: { sectionId: Number(params.id) },
		data: { sectionId: null },
	});

	await prisma.section.delete({
		where: { id: Number(params.id), userId: session.user.id },
	});

	return NextResponse.json({ message: "Section ungrouped" });
}

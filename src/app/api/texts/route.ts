import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const { title, description, position, hasBackground, sectionId } =
			await request.json();

		if (!(title && description)) {
			return NextResponse.json(
				{ error: "Título e descrição são obrigatórios" },
				{ status: 400 }
			);
		}

		const maxOrder = await prisma.text.findFirst({
			where: { userId: session.user.id },
			orderBy: { order: "desc" },
			select: { order: true },
		});

		const newOrder = (maxOrder?.order || 0) + 1;

		const text = await prisma.text.create({
			data: {
				title: title.trim(),
				description: description.trim(),
				position,
				hasBackground,
				active: true,
				order: newOrder,
				userId: session.user.id,
				sectionId: sectionId || null,
			},
		});

		return NextResponse.json(text, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		const texts = await prisma.text.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ texts });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

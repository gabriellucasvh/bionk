import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evictProfilePageCache, profileTextsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const {
			title,
			description,
			position,
			hasBackground,
			isCompact,
			sectionId,
		} = await request.json();

		if (!title) {
			return NextResponse.json(
				{ error: "Título é obrigatório" },
				{ status: 400 }
			);
		}

		if (description && description.length > 1500) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 1500 caracteres" },
				{ status: 400 }
			);
		}

		// Incrementar order de todos os itens existentes do usuário
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
			prisma.video.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.image.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.music.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
		]);

		const text = await prisma.text.create({
			data: {
				title: title.trim(),
				description: (description || "").trim(),
				position,
				hasBackground,
				isCompact,
				active: true,
				order: 0,
				userId: session.user.id,
				sectionId: sectionId || null,
			},
		});

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileTextsTag(user.username));
				await evictProfilePageCache(user.username);
			}
		} catch {}

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

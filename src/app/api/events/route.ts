import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const data = await req.json();
		const {
			title,
			location,
			eventDate,
			eventTime,
			descriptionShort,
			externalLink,
			coverImageUrl,
		} = data || {};

		if (
			!(
				title &&
				location &&
				eventDate &&
				eventTime &&
				externalLink &&
				String(externalLink).trim()
			)
		) {
			return NextResponse.json(
				{ error: "Campos obrigatórios ausentes" },
				{ status: 400 }
			);
		}

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
			prisma.event.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
		]);

		const created = await prisma.event.create({
			data: {
				userId: session.user.id,
				title: String(title),
				location: String(location),
				eventDate: new Date(eventDate),
				eventTime: String(eventTime),
				descriptionShort: descriptionShort ? String(descriptionShort) : null,
				externalLink: String(externalLink).trim(),
				coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
				order: 0,
				active: true,
			},
			select: { id: true },
		});

		return NextResponse.json({ id: created.id }, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar evento" },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status");

		const events = await prisma.event.findMany({
			where: {
				userId: session.user.id,
				active: status === "active" ? true : undefined,
			},
			orderBy: { order: "asc" },
			select: {
				id: true,
				title: true,
				location: true,
				eventDate: true,
				eventTime: true,
				descriptionShort: true,
				externalLink: true,
				coverImageUrl: true,
				active: true,
				order: true,
				type: true,
				targetMonth: true,
				targetDay: true,
				countdownLinkUrl: true,
				countdownLinkVisibility: true,
			},
		});

		return NextResponse.json({ events });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao listar eventos" },
			{ status: 500 }
		);
	}
}

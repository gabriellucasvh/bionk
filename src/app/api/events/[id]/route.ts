import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const eventId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(eventId)) {
		return NextResponse.json(
			{ error: "ID do evento inválido" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
        const {
            title,
            location,
            eventDate,
            eventTime,
            descriptionShort,
            externalLink,
            coverImageUrl,
            active,
            order,
            type,
            targetMonth,
            targetDay,
        } = body || {};

		const event = await prisma.event.findFirst({
			where: { id: eventId, userId: session.user.id },
		});

		if (!event) {
			return NextResponse.json(
				{ error: "Evento não encontrado" },
				{ status: 404 }
			);
		}

        const updateData: any = {
            ...(title !== undefined && { title: String(title) }),
            ...(location !== undefined && { location: String(location) }),
            ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
            ...(eventTime !== undefined && { eventTime: String(eventTime) }),
            ...(descriptionShort !== undefined && {
                descriptionShort: descriptionShort ? String(descriptionShort) : null,
            }),
            ...(externalLink !== undefined && {
                externalLink: String(externalLink),
            }),
            ...(coverImageUrl !== undefined && {
                coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
            }),
            ...(active !== undefined && { active }),
            ...(order !== undefined && { order }),
            ...(type !== undefined && { type: String(type) }),
            ...(targetMonth !== undefined && { targetMonth: Number(targetMonth) }),
            ...(targetDay !== undefined && { targetDay: Number(targetDay) }),
        };

		const updated = await prisma.event.update({
			where: { id: eventId },
			data: updateData,
			select: { id: true },
		});

		return NextResponse.json({ id: updated.id });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao atualizar evento" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const eventId = Number.parseInt(id, 10);

	if (!id || Number.isNaN(eventId)) {
		return NextResponse.json(
			{ error: "ID do evento inválido" },
			{ status: 400 }
		);
	}

	try {
		const event = await prisma.event.findFirst({
			where: { id: eventId, userId: session.user.id },
			select: { id: true },
		});
		if (!event) {
			return NextResponse.json(
				{ error: "Evento não encontrado" },
				{ status: 404 }
			);
		}

		await prisma.event.delete({ where: { id: eventId } });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao excluir evento" },
			{ status: 500 }
		);
	}
}

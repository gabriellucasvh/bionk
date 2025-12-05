import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileEventsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const REJECT_URL = /^https:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;
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
			countdownLinkUrl,
			countdownLinkVisibility,
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

		if (externalLink !== undefined) {
			const v = String(externalLink).trim();
			if (!REJECT_URL.test(v)) {
				return NextResponse.json(
					{ error: "Link externo inválido" },
					{ status: 400 }
				);
			}
		}

		const updateData: any = {
			...(title !== undefined && { title: String(title).trim().slice(0, 40) }),
			...(location !== undefined && { location: String(location) }),
			...(eventTime !== undefined && { eventTime: String(eventTime) }),
			...(descriptionShort !== undefined && {
				descriptionShort: descriptionShort ? String(descriptionShort) : null,
			}),
			...(externalLink !== undefined && {
				externalLink: String(externalLink).trim(),
			}),
			...(coverImageUrl !== undefined && {
				coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
			}),
			...(active !== undefined && { active }),
			...(order !== undefined && { order }),
			...(type !== undefined && { type: String(type) }),
			...(targetMonth !== undefined && { targetMonth: Number(targetMonth) }),
			...(targetDay !== undefined && { targetDay: Number(targetDay) }),
			...(countdownLinkUrl !== undefined && {
				countdownLinkUrl: REJECT_URL.test(String(countdownLinkUrl))
					? String(countdownLinkUrl)
					: null,
			}),
			...(countdownLinkVisibility !== undefined && {
				countdownLinkVisibility: ["after", "during"].includes(
					String(countdownLinkVisibility)
				)
					? String(countdownLinkVisibility)
					: null,
			}),
		};

		if (String(type || event.type) === "countdown" && eventDate !== undefined) {
			const parseLocalDate = (s: string) => {
				const parts = String(s)
					.split("-")
					.map((p) => Number(p));
				return new Date(parts[0], parts[1] - 1, parts[2]);
			};
			const tomorrowLocalStart = () => {
				const t = new Date();
				t.setDate(t.getDate() + 1);
				t.setHours(0, 0, 0, 0);
				return t;
			};
			const oneYearFromTodayStart = () => {
				const t = new Date();
				t.setDate(t.getDate() + 365);
				t.setHours(0, 0, 0, 0);
				return t;
			};
			const d = parseLocalDate(String(eventDate));
			const lower = tomorrowLocalStart().getTime();
			const upper = oneYearFromTodayStart().getTime();
			if (!(d.getTime() >= lower && d.getTime() <= upper)) {
				return NextResponse.json({ error: "Data inválida" }, { status: 400 });
			}
			updateData.eventDate = d;
		}

		if (String(type || event.type) !== "countdown" && eventDate !== undefined) {
			updateData.eventDate = new Date(eventDate);
		}

		const updated = await prisma.event.update({
			where: { id: eventId },
			data: updateData,
			select: { id: true },
		});

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileEventsTag(user.username));
			}
		} catch {}

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

		try {
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
				revalidateTag(profileEventsTag(user.username));
			}
		} catch {}

		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao excluir evento" },
			{ status: 500 }
		);
	}
}

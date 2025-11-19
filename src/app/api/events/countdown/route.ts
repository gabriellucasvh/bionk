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
			eventDate: eventDateStr,
			eventTime: eventTimeStr,
			targetMonth,
			targetDay,
		} = data || {};

		if (!(title && eventDateStr && eventTimeStr)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios ausentes" },
				{ status: 400 }
			);
		}

		const parseLocalDate = (s: string) => {
			const parts = s.split("-").map((p) => Number(p));
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

		const eventDate = parseLocalDate(String(eventDateStr));
		const lower = tomorrowLocalStart().getTime();
		const upper = oneYearFromTodayStart().getTime();
		if (!(eventDate.getTime() >= lower && eventDate.getTime() <= upper)) {
			return NextResponse.json({ error: "Data inválida" }, { status: 400 });
		}
		const eventTime = String(eventTimeStr);
		const month =
			typeof targetMonth === "number" ? targetMonth : eventDate.getMonth() + 1;
		const day = typeof targetDay === "number" ? targetDay : eventDate.getDate();

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
				location: "",
				eventDate,
				eventTime,
				descriptionShort: null,
				externalLink: "",
				coverImageUrl: null,
				order: 0,
				active: true,
				type: "countdown",
				targetMonth: month,
				targetDay: day,
			},
			select: { id: true },
		});

		return NextResponse.json({ id: created.id }, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar contagem" },
			{ status: 500 }
		);
	}
}

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

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

		const r = getRedis();
		const payload = {
			userId: session.user.id,
			title: String(title).trim().slice(0, 40),
			location: String(location),
			eventDate: new Date(eventDate).toISOString(),
			eventTime: String(eventTime),
			descriptionShort: descriptionShort ? String(descriptionShort) : null,
			externalLink: String(externalLink).trim(),
			coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
			type: null,
		};
		await r.lpush(`ingest:events:${session.user.id}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
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

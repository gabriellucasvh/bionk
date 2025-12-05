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

		const uid = session.user.id;
		const ingestMode = (process.env.INGEST_MODE || "").toLowerCase();
		const useQueue = ingestMode
			? ingestMode !== "sync"
			: process.env.NODE_ENV === "production";
		if (!useQueue) {
			const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
				prisma.link.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.text.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.video.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.image.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.music.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.section.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.event.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
			]);
			const candidates = [
				minL._min.order,
				minT._min.order,
				minV._min.order,
				minI._min.order,
				minM._min.order,
				minS._min.order,
				minE._min.order,
			].filter((n) => typeof n === "number") as number[];
			const base = candidates.length > 0 ? Math.min(...candidates) : 0;
			const created = await prisma.event.create({
				data: {
					userId: uid,
					title: String(title).trim().slice(0, 40),
					location: String(location),
					eventDate: new Date(eventDate),
					eventTime: String(eventTime),
					descriptionShort: descriptionShort ? String(descriptionShort) : null,
					externalLink: String(externalLink).trim(),
					coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
					active: true,
					order: base - 1,
				},
			});
			return NextResponse.json(created, { status: 201 });
		}
		const r = getRedis();
		const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
		const shard =
			Math.abs(Array.from(uid).reduce((a, c) => a + c.charCodeAt(0), 0)) %
			shardCount;
		const payload = {
			userId: uid,
			title: String(title).trim().slice(0, 40),
			location: String(location),
			eventDate: new Date(eventDate).toISOString(),
			eventTime: String(eventTime),
			descriptionShort: descriptionShort ? String(descriptionShort) : null,
			externalLink: String(externalLink).trim(),
			coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
			type: null,
		};
		await r.lpush(`ingest:events:${uid}:${shard}`, JSON.stringify(payload));
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
				active: status === "archived" ? false : true,
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

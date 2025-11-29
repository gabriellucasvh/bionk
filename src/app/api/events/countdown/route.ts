import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

const REJECT_URL = /^https:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;
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
			countdownLinkUrl,
			countdownLinkVisibility,
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
		const isSafeUrl = (u?: string | null) => {
			if (!u) {
				return false;
			}
			return REJECT_URL.test(String(u));
		};
		const linkUrl = isSafeUrl(countdownLinkUrl)
			? String(countdownLinkUrl)
			: null;
		const visibility =
			typeof countdownLinkVisibility === "string" &&
			["after", "during"].includes(countdownLinkVisibility)
				? countdownLinkVisibility
				: null;
		const month =
			typeof targetMonth === "number" ? targetMonth : eventDate.getMonth() + 1;
		const day = typeof targetDay === "number" ? targetDay : eventDate.getDate();

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
					location: "",
					eventDate,
					eventTime,
					descriptionShort: null,
					externalLink: "",
					coverImageUrl: null,
					active: true,
					order: base - 1,
					type: "countdown",
					targetMonth: month,
					targetDay: day,
					countdownLinkUrl: linkUrl,
					countdownLinkVisibility: visibility as any,
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
			location: "",
			eventDate: eventDate.toISOString(),
			eventTime,
			descriptionShort: null,
			externalLink: "",
			coverImageUrl: null,
			type: "countdown",
			targetMonth: month,
			targetDay: day,
			countdownLinkUrl: linkUrl,
			countdownLinkVisibility: visibility,
		};
		await r.lpush(`ingest:events:${uid}:${shard}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar contagem" },
			{ status: 500 }
		);
	}
}

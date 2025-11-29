import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import {
	enqueueClickEvent,
	ensureLinkClickCounter,
	incrementLinkClickCounter,
} from "@/lib/event-queue";
import { ensureMonthlyPartitions } from "@/lib/partition-manager";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	try {
		const raw = await req.text();
		let parsed: any = {};
		try {
			parsed = JSON.parse(raw || "{}");
		} catch {
			return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
		}
		let { linkId, trafficSource, url, userId, title, type } = parsed as {
			linkId?: number | string;
			trafficSource?: string;
			url?: string;
			userId?: string;
			title?: string;
			type?: string;
		};

		if (!linkId || Number.isNaN(Number(linkId))) {
			if (!(url && userId)) {
				return NextResponse.json(
					{
						error:
							"ID do link inválido; informe url e userId ou um linkId válido",
					},
					{ status: 400 }
				);
			}

			const linkType =
				typeof type === "string" && type ? type : "countdown_link";
			const existing = await prisma.link.findFirst({
				where: { userId, url, type: linkType },
				select: { id: true },
			});
			if (existing) {
				linkId = existing.id;
			} else {
				const created = await prisma.link.create({
					data: {
						userId,
						title:
							linkType === "countdown_link"
								? title
									? `Countdown: ${title}`
									: "Countdown"
								: title || "Vídeo",
						url,
						active: false,
						archived: true,
						type: linkType,
					},
					select: { id: true },
				});
				linkId = created.id;
			}
		}

		const cookiePreferences = getCookiePreferencesFromRequest(
			req as unknown as Request
		);

		const base = await prisma.link.findUnique({
			where: { id: Number(linkId) },
			select: {
				id: true,
				clicks: true,
				deleteOnClicks: true,
				active: true,
				title: true,
			},
		});
		if (!base) {
			return NextResponse.json(
				{ error: "Link não encontrado" },
				{ status: 404 }
			);
		}

		await ensureLinkClickCounter(Number(linkId), Number(base.clicks || 0));
		const currentCount = await incrementLinkClickCounter(Number(linkId));

		if (
			base.deleteOnClicks &&
			base.active &&
			currentCount >= Number(base.deleteOnClicks)
		) {
			await prisma.link.update({
				where: { id: Number(linkId) },
				data: { active: false },
			});
		}

		if (!cookiePreferences.analytics) {
			try {
				await enqueueClickEvent({
					linkId: Number(linkId),
					device: "unknown",
					userAgent: null,
					country: null,
					referrer: null,
					createdAt: new Date().toISOString(),
				});
			} catch {}
			try {
				await prisma.linkClick.create({
					data: {
						linkId: Number(linkId),
						device: "unknown",
						userAgent: null,
						country: null,
						referrer: null,
						createdAt: new Date(),
					},
				});
			} catch {}
			return NextResponse.json({
				id: Number(linkId),
				clicksCounter: currentCount,
			});
		}

		try {
			await ensureMonthlyPartitions();
		} catch {}

		const userAgent = getUserAgent(req);
		const deviceType = detectDeviceType(userAgent);

		let country: string | null = null;
		try {
			const clientIP = getClientIP(req);
			country = await getCountryFromIP(clientIP || "127.0.0.1");
		} catch {}

		const normalizedReferrer = trafficSource || "direct";

		try {
			await enqueueClickEvent({
				linkId: Number(linkId),
				device: deviceType,
				userAgent,
				country,
				referrer: normalizedReferrer,
				createdAt: new Date().toISOString(),
			});
		} catch {}
		try {
			await prisma.linkClick.create({
				data: {
					linkId: Number(linkId),
					device: deviceType || null,
					userAgent: userAgent || null,
					country: country || null,
					referrer: normalizedReferrer || null,
					createdAt: new Date(),
				},
			});
		} catch {}

		return NextResponse.json({
			id: Number(linkId),
			clicksCounter: currentCount,
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

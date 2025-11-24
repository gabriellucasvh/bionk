import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromHeaders } from "@/lib/cookie-server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

export async function POST(req: NextRequest) {
	try {
		// Handle JSON or plain text from sendBeacon
		const body = await req.text();
		const { imageId, itemIndex, trafficSource } = JSON.parse(body || "{}");

		if (!imageId || Number.isNaN(Number(imageId))) {
			return NextResponse.json(
				{ error: "imageId is required and must be a number" },
				{ status: 400 }
			);
		}

		if (typeof itemIndex !== "number" || itemIndex < 0) {
			return NextResponse.json(
				{ error: "itemIndex is required and must be a non-negative number" },
				{ status: 400 }
			);
		}

		const { analytics } = await getCookiePreferencesFromHeaders();
		const normalizedReferrer = trafficSource || "direct";

		// Always increment per-item clicks (essential functionality), regardless of analytics preference
		const image = await prisma.image.findUnique({
			where: { id: Number(imageId) },
			select: { id: true, items: true, userId: true },
		});

		if (!image) {
			return NextResponse.json({ error: "Image not found" }, { status: 404 });
		}

		const itemsArray: any[] = Array.isArray(image.items)
			? (image.items as any[])
			: [];

		if (itemIndex >= itemsArray.length) {
			return NextResponse.json(
				{ error: "itemIndex out of range" },
				{ status: 400 }
			);
		}

		const currentItem = itemsArray[itemIndex] || {};
		const currentClicks =
			typeof currentItem.clicks === "number" ? currentItem.clicks : 0;

		itemsArray[itemIndex] = {
			...currentItem,
			clicks: currentClicks + 1,
			...(analytics ? { referrer: normalizedReferrer } : {}),
		};

		const updated = await prisma.image.update({
			where: { id: Number(imageId) },
			data: { items: itemsArray },
			select: { id: true, items: true },
		});

		const updatedClicks = (updated.items as any[])[itemIndex]?.clicks ?? 0;

		const targetItem = itemsArray[itemIndex] || {};
		const rawUrl =
			typeof targetItem.linkUrl === "string" ? targetItem.linkUrl.trim() : "";
		const hasUrl = rawUrl.length > 0;

		if (hasUrl && image.userId) {
			const ensureHttps = (u: string) => {
				if (!u) {
					return "";
				}
				if (u.startsWith("http://")) {
					return `https://${u.slice(7)}`;
				}
				if (!u.startsWith("http")) {
					return `https://${u}`;
				}
				return u;
			};

			const normalizedUrl = ensureHttps(rawUrl);

			let linkRecord = await prisma.link.findFirst({
				where: {
					userId: image.userId,
					url: normalizedUrl,
					type: "countdown_link",
				},
				select: { id: true },
			});

			if (!linkRecord) {
				linkRecord = await prisma.link.create({
					data: {
						userId: image.userId,
						title: targetItem.title || "Imagem",
						url: normalizedUrl,
						active: false,
						archived: true,
						type: "countdown_link",
					},
					select: { id: true },
				});
			}

			if (analytics) {
				const userAgent = getUserAgent(req);
				const deviceType = detectDeviceType(userAgent);
				const clientIP = getClientIP(req);
				const country = await getCountryFromIP(clientIP || "127.0.0.1");

				await prisma.linkClick.create({
					data: {
						linkId: Number(linkRecord.id),
						device: deviceType,
						userAgent,
						country,
						referrer: normalizedReferrer,
					},
				});
			} else {
				await prisma.linkClick.create({
					data: {
						linkId: Number(linkRecord.id),
						device: "unknown",
						userAgent: null,
						country: null,
						referrer: normalizedReferrer,
					},
				});
			}
		}

		return NextResponse.json({
			id: updated.id,
			itemIndex,
			clicks: updatedClicks,
		});
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import prisma from "@/lib/prisma";

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

		const cookiePreferences = getCookiePreferencesFromRequest(req);
		const normalizedReferrer = trafficSource || "direct";

		// Always increment per-item clicks (essential functionality), regardless of analytics preference
		const image = await prisma.image.findUnique({
			where: { id: Number(imageId) },
			select: { id: true, items: true },
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
			...(cookiePreferences.analytics ? { referrer: normalizedReferrer } : {}),
		};

		const updated = await prisma.image.update({
			where: { id: Number(imageId) },
			data: { items: itemsArray },
			select: { id: true, items: true },
		});

		const updatedClicks = (updated.items as any[])[itemIndex]?.clicks ?? 0;

		// If analytics are allowed, we could extend tracking here (no ImageClick table exists yet)
		// For now, just return updated counters.
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

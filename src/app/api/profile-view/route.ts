// app/api/profile-view/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import { enqueueProfileViewEvent } from "@/lib/event-queue";
import { ensureMonthlyPartitions } from "@/lib/partition-manager";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";
export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const raw = await request.text();
		const parsed = JSON.parse(raw || "{}");
		const userId = parsed?.userId;
		const trafficSource = parsed?.trafficSource;
		if (!userId) {
			return NextResponse.json(
				{ error: "UserId is required" },
				{ status: 400 }
			);
		}

		const cookiePreferences = getCookiePreferencesFromRequest(
			request as unknown as Request
		);
		if (!cookiePreferences.analytics) {
			return NextResponse.json({ message: "Analytics disabled" });
		}

		try {
			await ensureMonthlyPartitions();
		} catch {}

		const userAgent = getUserAgent(request);
		const deviceType = detectDeviceType(userAgent);

		let country = "Unknown";
		try {
			const clientIP = getClientIP(request);
			country = await getCountryFromIP(clientIP || "127.0.0.1");
		} catch {}

		const referrer = trafficSource || "direct";

		try {
			await enqueueProfileViewEvent({
				userId: String(userId),
				device: deviceType,
				userAgent,
				country,
				referrer,
				createdAt: new Date().toISOString(),
			});
		} catch {}

		return NextResponse.json({ message: "Profile view recorded" });
	} catch {
		return NextResponse.json({ error: "Bad request" }, { status: 400 });
	}
}

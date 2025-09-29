// app/api/profile-view/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const { userId, trafficSource } = await request.json();
		if (!userId) {
			return NextResponse.json(
				{ error: "UserId is required" },
				{ status: 400 }
			);
		}

		const cookiePreferences = getCookiePreferencesFromRequest(request);
		if (!cookiePreferences.analytics) {
			return NextResponse.json({ message: "Analytics disabled" });
		}

		const userAgent = getUserAgent(request);
		const deviceType = detectDeviceType(userAgent);

		let country = "Unknown";
		try {
			const clientIP = getClientIP(request);
			country = await getCountryFromIP(clientIP || "127.0.0.1");
		} catch (error) {
			console.error("Error getting country:", error);
		}

		const referrer = trafficSource || "direct";

		await prisma.profileView.create({
			data: {
				userId: String(userId),
				device: deviceType,
				userAgent,
				country,
				referrer,
			},
		});

		return NextResponse.json({ message: "Profile view recorded" });
	} catch (error) {
		console.error("Profile view error:", error);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

// src/app/api/user-customizations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const customPresets = await prisma.customPresets.findUnique({
			where: { userId: session.user.id },
		});

		return NextResponse.json(
			customPresets || {
				customBackgroundColor: "",
				customBackgroundGradient: "",
				customTextColor: "",
				customFont: "",
				customButton: "",
				customButtonFill: "",
				customButtonCorners: "",
				headerStyle: "default",
			}
		);
	} catch {
		return NextResponse.json(
			{ error: "Failed to fetch customizations" },
			{ status: 500 }
		);
	}
}

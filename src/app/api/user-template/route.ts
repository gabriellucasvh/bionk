import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAppSession } from "@/lib/auth-session";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
	try {
		const session = await getAppSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { template: true, templateCategory: true },
		});

		return NextResponse.json(user);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

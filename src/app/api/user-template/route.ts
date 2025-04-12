import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { template: true, templateCategory: true }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user template:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
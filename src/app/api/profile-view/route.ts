// app/api/profile-view/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }
    await prisma.profileView.create({
      data: { userId },
    });
    return NextResponse.json({ message: "Profile view recorded" });
  } catch (error) {
    console.error("Error recording profile view", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

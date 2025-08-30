// app/api/profile-view/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 });
    }
    
    // Detectar tipo de dispositivo de forma anônima (LGPD compliant)
    const userAgent = getUserAgent(request);
    const deviceType = detectDeviceType(userAgent);
    
    await prisma.profileView.create({
      data: { 
        userId,
        device: deviceType
      },
    });
    return NextResponse.json({ message: "Profile view recorded" });
  } catch (error) {
    console.error("Error recording profile view", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

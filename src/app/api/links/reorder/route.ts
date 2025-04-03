import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, order } = body;

    if (!userId || !Array.isArray(order)) {
      return NextResponse.json(
        { error: "Requisição inválida." },
        { status: 400 }
      );
    }

    const updates = order.map((linkId, index) => 
      prisma.link.update({
        where: { id: linkId, userId },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Links reordenados com sucesso." });
  } catch (error) {
    console.error("Failed to reorder links:", error);
    return NextResponse.json(
      { error: "Falha ao reordenar links." },
      { status: 500 }
    );
  }
}
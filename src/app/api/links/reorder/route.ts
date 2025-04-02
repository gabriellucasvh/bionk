//src/app/api/links/reorder/route.ts 
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

    // Atualiza a ordem de cada link conforme o índice no array recebido
    const updatePromises = order.map((linkId: number, index: number) =>
      prisma.link.update({
        where: { id: linkId },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);
    return NextResponse.json({ message: "Links reordenados com sucesso." });
  } catch (error: unknown) {
    console.error("Failed to reorder links:", error);
    return NextResponse.json(
      { error: "Falha ao reordenar links." },
      { status: 500 }
    );
  }
}
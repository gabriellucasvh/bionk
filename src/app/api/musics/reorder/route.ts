import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items deve ser um array" },
        { status: 400 }
      );
    }

    const updatePromises = items.map((item: { id: number; order: number }) =>
      prisma.music.update({
        where: {
          id: item.id,
          userId: session.user.id,
        },
        data: {
          order: item.order,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Ordem das músicas atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao reordenar músicas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
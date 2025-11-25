import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const items = body.items as { id: number; order: number }[];

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }

    const updateTransactions = items.map((item) =>
      prisma.image.update({
        where: { id: item.id, userId: session.user.id },
        data: { order: item.order },
      })
    );

    await prisma.$transaction(updateTransactions);

    return NextResponse.json({ message: "Reordenação de imagens concluída" });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { linkId } = await req.json();
    if (!linkId || isNaN(Number(linkId))) {
      return NextResponse.json({ error: "ID do link é obrigatório e deve ser um número" }, { status: 400 });
    }

    // Executa as duas operações em uma transação para garantir consistência
    const [linkClick, updatedLink] = await prisma.$transaction([
      // 1. Cria o registro de clique em LinkClick
      prisma.linkClick.create({
        data: { linkId: Number(linkId) },
      }),
      // 2. Incrementa o campo clicks no Link
      prisma.link.update({
        where: { id: Number(linkId) },
        data: { clicks: { increment: 1 } },
      }),
    ]);

    // Retorna o link atualizado com o novo valor de clicks
    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
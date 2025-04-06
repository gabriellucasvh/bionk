import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { linkId } = await req.json();
    if (!linkId || isNaN(Number(linkId))) {
      return NextResponse.json({ error: "ID do link é obrigatório e deve ser um número" }, { status: 400 });
    }

    // Executa as operações em transação (agora capturando apenas o updatedLink)
    const [, updatedLink] = await prisma.$transaction([
      prisma.linkClick.create({
        data: { linkId: Number(linkId) },
      }),
      prisma.link.update({
        where: { id: Number(linkId) },
        data: { clicks: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
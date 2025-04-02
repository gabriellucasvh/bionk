import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { linkId } = await req.json();
    if (!linkId) {
      return NextResponse.json({ error: "ID do link é obrigatório" }, { status: 400 });
    }

    await prisma.linkClick.create({
      data: { linkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

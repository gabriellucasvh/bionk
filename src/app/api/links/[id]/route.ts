import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params; // Aguarda a resolução dos parâmetros
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const updatedLink = await prisma.link.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json(updatedLink);
  } catch (error: unknown) {
    console.error("Erro ao atualizar link:", error);
    return NextResponse.json({ error: "Falha ao atualizar link." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params; // Aguarda a resolução dos parâmetros
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.link.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Link excluído com sucesso." });
  } catch (error: unknown) {
    console.error("Erro ao excluir link:", error);
    return NextResponse.json({ error: "Falha ao excluir link." }, { status: 500 });
  }
}

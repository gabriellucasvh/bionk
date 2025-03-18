import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedLink = await prisma.link.update({
      where: { id: Number(id) }, // converte para number se necessário
      data: body,
    });
    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao atualizar link." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.link.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Link excluído com sucesso." });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao excluir link." },
      { status: 500 }
    );
  }
}

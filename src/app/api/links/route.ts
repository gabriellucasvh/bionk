import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Parâmetro 'userId' ausente." }, { status: 400 });
  }

  try {
    const links = await prisma.link.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar links." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, url, active, clicks, sensitive } = body;

    if (!userId || !title || !url) {
      return NextResponse.json({ error: "Campos obrigatórios não informados." }, { status: 400 });
    }

    const newLink = await prisma.link.create({
      data: {
        userId,
        title,
        url,
        active: active ?? true,
        clicks: clicks ?? 0,
        sensitive: sensitive ?? false,
        order: 0, // Define um valor padrão para a ordem; ajuste conforme sua lógica
      },
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao criar link." }, { status: 500 });
  }
}

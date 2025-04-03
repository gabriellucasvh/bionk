import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const activeParam = searchParams.get("active");

  if (!userId) {
    return NextResponse.json(
      { error: "Parâmetro 'userId' ausente." },
      { status: 400 }
    );
  }

  // Define o filtro com base nos parâmetros recebidos
  const filter: any = { userId };
  if (activeParam !== null) {
    filter.active = activeParam === "true";
  }

  try {
    const links = await prisma.link.findMany({
      where: filter,
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ links });
  } catch (error: unknown) {
    console.error("Failed to fetch links:", error);
    return NextResponse.json(
      { error: "Falha ao buscar links." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, url, active, clicks, sensitive } = body;

    if (!userId || !title || !url) {
      return NextResponse.json(
        { error: "Campos obrigatórios não informados." },
        { status: 400 }
      );
    }

    const newLink = await prisma.link.create({
      data: {
        userId,
        title,
        url,
        active: active ?? true,
        clicks: clicks ?? 0,
        sensitive: sensitive ?? false,
        order: 0,
      },
    });

    return NextResponse.json(newLink, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create link:", error);
    return NextResponse.json(
      { error: "Falha ao criar link." },
      { status: 500 }
    );
  }
}

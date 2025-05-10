import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const VALID_TEMPLATES = [
  "default", "simple", "vibrant", "gradient", "business", "corporate",
  "modern", "clean", "dark", "midnight", "artistic", "unique",
  "elegant", "lux", "neon", "cyber", "retro", "vintage", "photo", "gallery"
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body: { template: string; templateCategory: string } = await req.json();
    const { template, templateCategory } = body;

    if (!template) {
      return NextResponse.json({ error: "Template inválido" }, { status: 400 });
    }

    if (!VALID_TEMPLATES.includes(template)) {
      return NextResponse.json({ error: "Template não permitido" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        template,
        templateCategory,
      },
    });

    return NextResponse.json({ message: "Template atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar template:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}
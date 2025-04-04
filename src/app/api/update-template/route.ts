import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Certifique-se de que este caminho está correto

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

    const validTemplates = [
      "default", "simple", "vibrant", "gradient", "business", "corporate",
      "modern", "clean", "dark", "midnight", "artistic", "unique",
      "elegant", "lux", "neon", "cyber", "retro", "vintage", "photo", "gallery"
    ];


    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        template: template,
        templateCategory: templateCategory,
      },

    });

    return NextResponse.json({ message: "Template atualizado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

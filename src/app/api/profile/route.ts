// src/app/api/profile/route.ts

import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-session";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        email: true,
        sensitiveProfile: true,
        lastUsernameChange: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

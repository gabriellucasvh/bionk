import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "node:crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, username, bio, userType, profileImage } = data;

    if (!username) {
      return NextResponse.json({ error: "Username é obrigatório" }, { status: 400 });
    }

    const ownerId = session.user.id;

    // Verificar limite de contas (Plano Free = max 10)
    const subProfilesCount = await prisma.user.count({
      where: { ownerId }
    });

    // TODO: Adicionar verificação real de plano se necessário
    if (subProfilesCount >= 10) {
      return NextResponse.json({ error: "Limite de páginas atingido (10/10)" }, { status: 403 });
    }

    // Verificar se username já existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username já em uso" }, { status: 400 });
    }

    // Gerar um email fake temporário só para satisfazer o campo unique
    const fakeEmail = `sub_${crypto.randomUUID().slice(0, 8)}@linked.bionk.me`;

    // Criar o perfil vinculado
    const newProfile = await prisma.user.create({
      data: {
        email: fakeEmail,
        name: name || username,
        username,
        bio: bio || null,
        userType: userType || "personal",
        ownerId,
        status: "active",
        onboardingCompleted: true,
        image: profileImage || "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png",
        provider: "linked",
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile: {
        id: newProfile.id,
        username: newProfile.username
      } 
    });
  } catch (error) {
    console.error("Erro ao criar perfil vinculado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

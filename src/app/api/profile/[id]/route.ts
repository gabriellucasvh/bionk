// app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const profile = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        username: true,
        bio: true,
        bannerUrl: true,   // Banner do usuário
        profileUrl: true,  // Foto de perfil do usuário
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.user.id !== id) {
    return NextResponse.json({ error: "Você só pode editar seu próprio perfil" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, username, bio } = body;

    if (username) {
      const existingUsers = await prisma.user.findMany({
        where: { username: username, NOT: { id } },
      });

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "Nome de usuário já está em uso" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, username, bio },
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        bannerUrl: updatedUser.bannerUrl,
        profileUrl: updatedUser.profileUrl,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (session.user.id !== id) {
    return NextResponse.json({ error: "Você só pode excluir sua própria conta" }, { status: 403 });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Conta excluída com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir a conta:", error);
    return NextResponse.json({ error: "Erro ao excluir a conta" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

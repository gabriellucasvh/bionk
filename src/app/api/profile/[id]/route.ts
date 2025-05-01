// app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary"; // Importar Cloudinary

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

// Função auxiliar para extrair public_id de uma URL Cloudinary
// Considere mover esta função para um arquivo de utilidades compartilhado (ex: /lib/utils.ts)
// e importá-la aqui e na rota de upload.
const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Erro ao extrair public_id:", error);
    return null;
  }
};

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
    // 1. Buscar as URLs das imagens do usuário ANTES de deletá-lo
    const user = await prisma.user.findUnique({
      where: { id },
      select: { bannerUrl: true, profileUrl: true },
    });

    if (!user) {
      // Usuário já não existe, pode retornar sucesso ou erro 404
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    // 2. Deletar imagens do Cloudinary se existirem
    const urlsToDelete = [user.bannerUrl, user.profileUrl].filter(Boolean) as string[]; // Filtra URLs nulas/vazias

    for (const url of urlsToDelete) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          console.log(`Tentando deletar imagem do Cloudinary: ${publicId}`);
          // Especificar resource_type como 'image' é importante
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          console.log(`Imagem deletada do Cloudinary: ${publicId}`);
        } catch (deleteError) {
          console.error(`Erro ao deletar imagem ${publicId} do Cloudinary:`, deleteError);
          // Não interromper a exclusão da conta se a exclusão da imagem falhar.
          // Registre o erro para investigação posterior.
        }
      }
    }

    // 3. Deletar o usuário do banco de dados
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Conta e imagens associadas excluídas com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir a conta:", error);
    return NextResponse.json({ error: "Erro ao excluir a conta" }, { status: 500 });
  } finally {
    // O finally com $disconnect pode não ser estritamente necessário aqui,
    // dependendo da gestão de conexão do Prisma no seu ambiente Next.js.
    // Mas se mantiver, tudo bem.
    await prisma.$disconnect();
  }
}

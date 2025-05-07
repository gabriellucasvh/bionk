import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/social-links/[id]
export async function PUT(request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const params = await context.params;
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'ID do link é obrigatório' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { username, url, active, order } = body;

    const existingLink = await prisma.socialLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Link social não encontrado' }, { status: 404 });
    }

    if (existingLink.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado a modificar este link' }, { status: 403 });
    }

    // Validar se já existe outro link com a mesma plataforma para o usuário, exceto o próprio link sendo editado
    if (body.platform && body.platform !== existingLink.platform) {
        const conflictingLink = await prisma.socialLink.findFirst({
            where: {
                userId: session.user.id,
                platform: body.platform,
                id: { not: id }
            }
        });
        if (conflictingLink) {
            return NextResponse.json({ error: 'Já existe um link para esta plataforma.' }, { status: 409 });
        }
    }

    const updatedSocialLink = await prisma.socialLink.update({
      where: { id },
      data: {
        username: username !== undefined ? username : existingLink.username,
        url: url !== undefined ? url : existingLink.url,
        active: active !== undefined ? active : existingLink.active,
        order: order !== undefined ? order : existingLink.order,
        // A plataforma não deve ser alterada aqui, apenas o nome de usuário/url
        // Se a plataforma precisar ser alterada, seria melhor excluir e recriar
        // ou adicionar lógica mais complexa para garantir a unicidade.
      },
    });
    return NextResponse.json(updatedSocialLink);
  } catch (error) {
    console.error('Erro ao atualizar link social:', error);
    return NextResponse.json({ error: 'Erro ao atualizar link social' }, { status: 500 });
  }
}

// DELETE /api/social-links/[id]
export async function DELETE(request: NextRequest, context: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const params = await context.params;
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'ID do link é obrigatório' }, { status: 400 });
  }

  try {
    const existingLink = await prisma.socialLink.findUnique({
      where: { id },
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Link social não encontrado' }, { status: 404 });
    }

    if (existingLink.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado a excluir este link' }, { status: 403 });
    }

    await prisma.socialLink.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Link social excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir link social:', error);
    return NextResponse.json({ error: 'Erro ao excluir link social' }, { status: 500 });
  }
}
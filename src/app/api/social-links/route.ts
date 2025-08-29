import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; 

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Não autorizado a acessar links deste usuário' }, { status: 403 });
  }

  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ socialLinks });
  } catch (error) {
    console.error('Erro ao buscar links sociais:', error);
    return NextResponse.json({ error: 'Erro ao buscar links sociais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { platform, username, url, active, userId: bodyUserId } = body;

    if (session.user.id !== bodyUserId) {
      return NextResponse.json({ error: 'Não autorizado a criar link para este usuário' }, { status: 403 });
    }

    if (!platform || !username || !url) {
      return NextResponse.json({ error: 'Campos platform, username e url são obrigatórios' }, { status: 400 });
    }

    const lastLink = await prisma.socialLink.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: 'desc' },
    });
    const newOrder = lastLink ? lastLink.order + 1 : 0;

    const newSocialLink = await prisma.socialLink.create({
      data: {
        userId: session.user.id,
        platform,
        username,
        url,
        active: active !== undefined ? active : true,
        order: newOrder,
      },
    });
    return NextResponse.json(newSocialLink, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar link social:', error);
    // @ts-ignore
    if (error.code === 'P2002' && error.meta?.target?.includes('platform')) {
        return NextResponse.json({ error: 'Já existe um link para esta plataforma.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao criar link social' }, { status: 500 });
  }
}
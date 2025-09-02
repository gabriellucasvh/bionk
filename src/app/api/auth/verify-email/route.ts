import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo link de verificação.' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Este e-mail já foi verificado.' }, { status: 200 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'E-mail verificado com sucesso!' }, { status: 200 });

  } catch {
    return NextResponse.json({ error: 'Erro interno ao verificar o e-mail.' }, { status: 500 });
  }
}

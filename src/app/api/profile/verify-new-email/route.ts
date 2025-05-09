// src/app/api/profile/verify-new-email/route.ts
import { NextResponse } from 'next/server';
import prisma  from '@/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token de verificação é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token as string,
        emailVerificationTokenExpires: { gt: new Date() }, // Verifica se o token não expirou
      },
    });

    if (!user || !user.newEmailPending) {
      return NextResponse.json({ error: 'Token inválido, expirado ou solicitação não encontrada.' }, { status: 400 });
    }

    // Atualiza o e-mail do usuário e limpa os campos de verificação
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.newEmailPending,
        emailVerified: new Date(), // Marca o novo e-mail como verificado
        newEmailPending: null,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });
    
    // Idealmente, você invalidaria a sessão NextAuth aqui para forçar o relogin
    // ou atualizaria a sessão com o novo e-mail se o NextAuth permitir tal atualização dinâmica.
    // Por simplicidade, vamos apenas retornar sucesso.
    // O cliente pode ser instruído a pedir ao usuário para fazer login novamente ou a sessão pode ser atualizada no lado do cliente se possível.

    return NextResponse.json({ message: 'Seu novo e-mail foi verificado e atualizado com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao verificar novo e-mail:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao verificar seu e-mail.' }, { status: 500 });
  }
}
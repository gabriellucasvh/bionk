// src/app/api/profile/change-password/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
import prisma from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verifica se o usuário está autenticado via credenciais
    // A propriedade isCredentialsUser deve ser adicionada ao tipo da sessão se ainda não estiver
    if (!(session.user as any).isCredentialsUser) {
      return NextResponse.json({ error: 'Operação não permitida para este tipo de conta.' }, { status: 403 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.hashedPassword) { // Alterado de user.password para user.hashedPassword com base no schema.prisma
      return NextResponse.json({ error: 'Usuário não encontrado ou senha não configurada' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword); // Alterado de user.password para user.hashedPassword
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashedNewPassword, // Alterado de password para hashedPassword
      },
    });

    // Opcional: invalidar outras sessões do usuário aqui, se necessário.

    return NextResponse.json({ message: 'Senha alterada com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Erro na alteração de senha:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao alterar a senha.' }, { status: 500 });
  }
}
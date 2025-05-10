// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Token ou senha inválidos.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

   
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() }, 
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    console.log(`Password reset successfully for user: ${user.email}`);
    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno ao redefinir a senha.' }, { status: 500 });
  }
}
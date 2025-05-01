// src/app/api/auth/request-password-reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('RESEND_API_KEY não está definido no ambiente.');
  throw new Error('RESEND_API_KEY não está definido no ambiente.');
}
const resend = new Resend(resendApiKey);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log('[RequestPasswordReset] Requisição recebida para:', email);

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Password reset request for non-existent email: ${email}`);
      return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    try {
      console.log('[RequestPasswordReset] Enviando e-mail via Resend...');
      const emailResponse = await resend.emails.send({
        from: 'Bionk <contato@bionk.me>',
        to: [email],
        subject: 'Redefinição de Senha - Bionk',
        html: `<p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este link expira em 1 hora.</p><p>Se você não solicitou isso, ignore este e-mail.</p>`,
      });
      console.log('[RequestPasswordReset] Resposta da API Resend:', emailResponse);
      if (emailResponse.error) {
        throw new Error(typeof emailResponse.error === "string" ? emailResponse.error : String(emailResponse.error));
      }
      console.log(`Password reset email sent to: ${email}`);
      return NextResponse.json({ message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' }, { status: 200 });
    } catch (emailError) {
      console.error('[RequestPasswordReset] Erro ao enviar e-mail de redefinição:', emailError);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      return NextResponse.json({ error: 'Erro ao enviar e-mail de redefinição.', detalhes: String(emailError) }, { status: 500 });
    }

  } catch (error) {
    console.error('[RequestPasswordReset] Erro geral:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno.', detalhes: String(error) }, { status: 500 });
  }
}
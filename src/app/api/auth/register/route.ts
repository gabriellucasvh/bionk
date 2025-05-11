import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/utils/generateUsername";
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_EXPIRY_MINUTES = 20;

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: Request) {
  try {
    const { email, stage, otp, password } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
    }

    if (stage === 'request-otp') {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser && existingUser.emailVerified) {
        return NextResponse.json({ error: "Este e-mail já está registrado e verificado." }, { status: 409 });
      }

      const registrationOtp = generateOtp();
      const registrationOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      if (existingUser) {
        await prisma.user.update({
          where: { email },
          data: {
            registrationOtp,
            registrationOtpExpiry,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            email,
            username: `user_${Date.now()}`, 
            registrationOtp,
            registrationOtpExpiry,
            emailVerified: null, 
          },
        });
      }

      try {
        await resend.emails.send({
          from: 'Bionk <contato@bionk.me>',
          to: [email],
          subject: 'Seu código de verificação Bionk',
          html: `<p>Seu código de verificação para o Bionk é: <strong>${registrationOtp}</strong></p><p>Este código expira em ${OTP_EXPIRY_MINUTES} minutos.</p>`,
        });
        return NextResponse.json({ message: "Código de verificação enviado para o seu e-mail." }, { status: 200 });
      } catch (emailError) {
        console.error("Error sending OTP email:", emailError);
        return NextResponse.json({ error: "Falha ao enviar e-mail de verificação. Tente novamente." }, { status: 500 });
      }
    } else if (stage === 'verify-otp') {
      if (!otp) {
        return NextResponse.json({ error: "Código OTP é obrigatório" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado. Por favor, inicie o processo novamente." }, { status: 404 });
      }

      if (user.emailVerified) {
        return NextResponse.json({ error: "Este e-mail já foi verificado." }, { status: 400 });
      }

      if (user.registrationOtp !== otp) {
        return NextResponse.json({ error: "Código OTP inválido." }, { status: 400 });
      }

      if (!user.registrationOtpExpiry || user.registrationOtpExpiry < new Date()) {
        await prisma.user.update({
            where: { email },
            data: { registrationOtp: null, registrationOtpExpiry: null },
        });
        return NextResponse.json({ error: "Código OTP expirado. Por favor, solicite um novo código." }, { status: 400 });
      }

      await prisma.user.update({
        where: { email },
        data: { 
        },
      });

      return NextResponse.json({ message: "Código OTP verificado com sucesso." }, { status: 200 });

    } else if (stage === 'create-user') {
      if (!password) {
        return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado. Por favor, inicie o processo novamente." }, { status: 404 });
      }

      if (user.emailVerified) {
        return NextResponse.json({ error: "Conta já registrada e verificada." }, { status: 400 });
      }
      
      if (!user.registrationOtp || !user.registrationOtpExpiry || user.registrationOtpExpiry < new Date()) {
         await prisma.user.update({
            where: { email },
            data: { registrationOtp: null, registrationOtpExpiry: null },
        });
        return NextResponse.json({ error: "Verificação OTP inválida ou expirada. Por favor, reinicie o processo de registro." }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const username = await generateUniqueUsername(email.split('@')[0]); 

      await prisma.user.update({
        where: { email },
        data: {
          hashedPassword,
          username,
          emailVerified: new Date(),
          registrationOtp: null,
          registrationOtpExpiry: null,
          name: email.split('@')[0], 
        },
      });

      return NextResponse.json({ message: "Usuário registrado com sucesso!" }, { status: 201 });

    } else {
      return NextResponse.json({ error: "Estágio de registro inválido" }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Registration process error:", error);
    let errorMessage = "Erro interno no servidor.";
    if (error instanceof Error) {
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
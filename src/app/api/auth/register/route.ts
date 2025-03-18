// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Função para gerar um username único
async function generateUniqueUsername(name: string): Promise<string> {
  let baseUsername = name.toLowerCase().replace(/\s+/g, ""); // Remove espaços e deixa tudo minúsculo
  let username = baseUsername;
  let count = 1;

  // Verifica se o username já existe, se sim, tenta com número
  while (await prisma.user.findFirst({ where: { username } })) {
    username = `${baseUsername}${count}`;
    count++;
  }

  return username;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name); // Gera o username automático

    await prisma.user.create({
      data: { name, email, hashedPassword, username },
    });

    return NextResponse.json({ message: "Usuário cadastrado com sucesso!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
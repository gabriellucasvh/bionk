import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Função para gerar um username único
async function generateUniqueUsername(name: string): Promise<string> {
  const baseUsername = name.toLowerCase().replace(/\s+/g, ""); // Changed to const
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
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já cadastrado, tente outro ou faça login!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name);

    await prisma.user.create({
      data: { name, email, hashedPassword, username },
    });

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso!" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error); // Now using the error variable
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
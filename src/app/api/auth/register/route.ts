import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateUniqueUsername } from "@/utils/generateUsername";

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
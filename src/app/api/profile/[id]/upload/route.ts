// app/api/profile/[id]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  const { id } = await Promise.resolve(params);

  // Recupera o tipo (banner ou profile) via query string
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type || (type !== "banner" && type !== "profile")) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Define os limites de tamanho: 5MB para banner e 2MB para foto de perfil
    const maxSize = type === "banner" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const limite = type === "banner" ? "5MB" : "2MB";
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${limite}.` },
        { status: 400 }
      );
    }

    // Converte o arquivo para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Define a pasta de uploads dentro da pasta public
    const uploadsFolder = path.join(process.cwd(), "public/uploads");
    try {
      await fs.access(uploadsFolder);
    } catch {
      await fs.mkdir(uploadsFolder, { recursive: true });
    }

    // Remove o arquivo antigo, se existir, ignorando erro se o arquivo não for encontrado
    const user = await prisma.user.findUnique({
      where: { id },
      select: { bannerUrl: true, profileUrl: true },
    });
    if (user) {
      const oldFileUrl = type === "banner" ? user.bannerUrl : user.profileUrl;
      if (oldFileUrl) {
        const oldFilePath = path.join(process.cwd(), "public", oldFileUrl);
        try {
          await fs.unlink(oldFilePath);
        } catch (err: any) {
          // Ignora o erro se o arquivo não existir (ENOENT)
          if (err.code !== "ENOENT") {
            console.error("Erro ao remover arquivo antigo:", err);
          }
        }
      }
    }

    // Gera o nome do novo arquivo e salva-o
    const filename = `${id}-${type}-${Date.now()}.png`;
    const filePath = path.join(uploadsFolder, filename);
    await fs.writeFile(filePath, buffer);

    // URL que será salva no banco e utilizada pelo frontend
    const generatedUrl = `/uploads/${filename}`;

    // Atualiza o registro do usuário no banco de dados para manter somente 1 imagem por tipo
    if (type === "banner") {
      await prisma.user.update({
        where: { id },
        data: { bannerUrl: generatedUrl },
      });
    } else {
      await prisma.user.update({
        where: { id },
        data: { profileUrl: generatedUrl },
      });
    }

    return NextResponse.json({ url: generatedUrl }, { status: 200 });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro ao processar o upload." }, { status: 500 });
  }
}

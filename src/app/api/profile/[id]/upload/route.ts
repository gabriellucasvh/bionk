//api/profile/[id]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary"; // Importar Cloudinary
// Remover imports de 'fs' e 'path'
// import { promises as fs } from "fs";
// import path from "path";

// Função auxiliar para extrair public_id de uma URL Cloudinary
const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Erro ao extrair public_id:", error);
    return null;
  }
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Aguarda a resolução de params

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
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
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
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    // --- Lógica de Cloudinary ---

    // 1. Remove o arquivo antigo do Cloudinary, se existir
    const user = await prisma.user.findUnique({
      where: { id },
      select: { bannerUrl: true, profileUrl: true },
    });

    if (user) {
      const oldFileUrl = type === "banner" ? user.bannerUrl : user.profileUrl;
      if (oldFileUrl) {
        const publicId = getPublicIdFromUrl(oldFileUrl);
        if (publicId) {
          try {
            console.log(`Tentando deletar imagem antiga: ${publicId}`);
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            console.log(`Imagem antiga deletada: ${publicId}`);
          } catch (deleteError) {
            console.error("Erro ao deletar imagem antiga do Cloudinary:", deleteError);
            // Continuar mesmo se a exclusão falhar (pode ser que o arquivo não exista mais)
          }
        }
      }
    }

    // 2. Faz upload do novo arquivo para o Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: `bionk/${type}s`, // Ex: bionk/banners ou bionk/profiles
      public_id: `${id}-${type}-${Date.now()}`, // Garante um ID único, mas pode ser simplificado se preferir sobrescrever sempre
      overwrite: true,
      resource_type: "image",
    });

    const generatedUrl = uploadResult.secure_url; // URL segura fornecida pelo Cloudinary

    // --- Fim da Lógica de Cloudinary ---

    // Atualiza o registro do usuário no banco de dados com a URL do Cloudinary
    await prisma.user.update({
      where: { id },
      data:
        type === "banner"
          ? { bannerUrl: generatedUrl }
          : { profileUrl: generatedUrl },
    });

    return NextResponse.json({ url: generatedUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro no upload:", error);
    // Verifica se é um erro específico do Cloudinary para dar mais detalhes
    if (error && typeof error === 'object' && 'http_code' in error) {
       return NextResponse.json(
         { error: `Cloudinary Error: ${(error as any).message || 'Unknown error'}` },
         { status: (error as any).http_code || 500 }
       );
    }
    return NextResponse.json(
      { error: "Erro ao processar o upload." },
      { status: 500 }
    );
  }
}

//api/profile/[id]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary"; 

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
  const { id } = await params; 

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

    const maxSize = type === "banner" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const limite = type === "banner" ? "5MB" : "2MB";
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${limite}.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { bannerUrl: true, image: true },
    });

    if (user) {
      const oldFileUrl = type === "banner" ? user.bannerUrl : user.image;
      if (oldFileUrl) {
        const publicId = getPublicIdFromUrl(oldFileUrl);
        if (publicId) {
          try {
            console.log(`Tentando deletar imagem antiga: ${publicId}`);
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            console.log(`Imagem antiga deletada: ${publicId}`);
          } catch (deleteError) {
            console.error("Erro ao deletar imagem antiga do Cloudinary:", deleteError);
          }
        }
      }
    }

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: `bionk/${type}s`,
      public_id: `${id}-${type}-${Date.now()}`,
      overwrite: true,
      resource_type: "image",
    });

    const generatedUrl = uploadResult.secure_url; 
    await prisma.user.update({
      where: { id },
      data:
        type === "banner"
          ? { bannerUrl: generatedUrl }
          : { image: generatedUrl},
    });

    return NextResponse.json({ url: generatedUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erro no upload:", error);
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

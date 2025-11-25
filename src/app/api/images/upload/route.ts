import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/svg+xml",
      "image/bmp",
      "image/heic",
      "image/heif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Formato de arquivo não suportado. Use JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC ou HEIF.",
        },
        { status: 400 }
      );
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Arquivo muito grande. O tamanho máximo permitido é 10MB.",
        },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      folder: "studio-images",
      overwrite: false,
      resource_type: "image",
      // Sem transformação fixa: manter tamanho original
      // quality automático para otimização
      transformation: [{ quality: "auto" }],
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

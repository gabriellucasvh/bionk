import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const REGEX_FILE_EXTENSION = /\.[^/.]+$/;
const ALLOWED_IMAGE_TYPES = [
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
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number.parseInt(idString, 10);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID inválido" },
      { status: 400 }
    );
  }

  const data = await req.formData();
  const file = data.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { success: false, error: "Nenhum arquivo enviado" },
      { status: 400 }
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Formato não suportado. Use JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC ou HEIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: "Arquivo muito grande. Máximo 10MB." },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, coverImageUrl: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = `data:${mimeType};base64,${base64Data}`;

    if (event.coverImageUrl) {
      try {
        const oldPublicId = event.coverImageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .replace(REGEX_FILE_EXTENSION, "");
        await cloudinary.uploader.destroy(oldPublicId);
      } catch {}
    }

    const result = await cloudinary.uploader.upload(fileUri, {
      folder: "event-covers",
      public_id: `event_${id}_${Date.now()}`,
      overwrite: false,
      resource_type: "image",
      transformation: [{ quality: "auto" }],
    });

    await prisma.event.update({
      where: { id },
      data: { coverImageUrl: result.secure_url },
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = Number.parseInt(idString, 10);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { coverImageUrl: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    if (event.coverImageUrl) {
      try {
        const publicId = event.coverImageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .replace(REGEX_FILE_EXTENSION, "");
        await cloudinary.uploader.destroy(publicId);
      } catch {}
    }

    await prisma.event.update({
      where: { id },
      data: { coverImageUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro ao remover imagem" },
      { status: 500 }
    );
  }
}

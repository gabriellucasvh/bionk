import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const REGEX_FILE_EXTENSION = /\.[^/.]+$/;
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
	const file = data.get("file") as File;

	if (!file) {
		return NextResponse.json(
			{ success: false, error: "Nenhum arquivo enviado" },
			{ status: 400 }
		);
	}

	// Validar tamanho do arquivo (máximo 5MB)
	const maxFileSize = 5 * 1024 * 1024; // 5MB em bytes
	if (file.size > maxFileSize) {
		return NextResponse.json(
			{
				success: false,
				error: "Arquivo muito grande. O tamanho máximo permitido é 5MB.",
			},
			{ status: 400 }
		);
	}

	// Validar tipo de arquivo (imagens, GIFs e outros formatos suportados)
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

	// Verificar se o link existe e buscar imagem antiga
	try {
		const link = await prisma.link.findUnique({
			where: { id },
			select: { id: true, userId: true, customImageUrl: true },
		});

		if (!link) {
			return NextResponse.json(
				{ success: false, error: "Link não encontrado" },
				{ status: 404 }
			);
		}

		const fileBuffer = await file.arrayBuffer();
		const mimeType = file.type;
		const encoding = "base64";
		const base64Data = Buffer.from(fileBuffer).toString("base64");
		const fileUri = `data:${mimeType};${encoding},${base64Data}`;

		// Remover imagem antiga do Cloudinary se existir
		if (link.customImageUrl) {
			try {
				// Extrair public_id da URL do Cloudinary
				const oldPublicId = link.customImageUrl
					.split("/")
					.slice(-2)
					.join("/")
					.replace(REGEX_FILE_EXTENSION, "");

				await cloudinary.uploader.destroy(oldPublicId);
			} catch (cloudinaryError) {
				console.error(
					"Erro ao remover imagem antiga do Cloudinary:",
					cloudinaryError
				);
				// Continua mesmo se falhar ao remover a imagem antiga
			}
		}

		const result = await cloudinary.uploader.upload(fileUri, {
			folder: "link-custom-images",
			public_id: `link_${id}_${Date.now()}`,
			overwrite: false,
			transformation: [
				{ width: 400, height: 400, crop: "fill", quality: "auto" },
			],
		});

		await prisma.link.update({
			where: { id },
			data: { customImageUrl: result.secure_url },
		});

		return NextResponse.json({ success: true, url: result.secure_url });
	} catch (error) {
		console.error("Erro no upload da imagem do link:", error);
		return NextResponse.json(
			{ success: false, error: "Erro ao fazer upload da imagem" },
			{ status: 500 }
		);
	}
}

// DELETE endpoint para remover imagem personalizada
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
		const link = await prisma.link.findUnique({
			where: { id },
			select: { id: true, customImageUrl: true },
		});

		if (!link) {
			return NextResponse.json(
				{ success: false, error: "Link não encontrado" },
				{ status: 404 }
			);
		}

		// Remover imagem do Cloudinary se existir
		if (link.customImageUrl) {
			try {
				// Extrair public_id da URL do Cloudinary
				const publicId = link.customImageUrl
					.split("/")
					.slice(-2)
					.join("/")
					.replace(REGEX_FILE_EXTENSION, "");

				await cloudinary.uploader.destroy(publicId);
			} catch (cloudinaryError) {
				console.error("Erro ao remover imagem do Cloudinary:", cloudinaryError);
				// Continua mesmo se falhar ao remover do Cloudinary
			}
		}

		// Remover URL do banco de dados
		await prisma.link.update({
			where: { id },
			data: { customImageUrl: null },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro ao remover imagem personalizada:", error);
		return NextResponse.json(
			{ success: false, error: "Erro ao remover imagem" },
			{ status: 500 }
		);
	}
}

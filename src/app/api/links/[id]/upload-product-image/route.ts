// src/app/api/links/[id]/upload-product-image/route.ts

import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

const regex = /\/v\d+\/(.+)\.\w+$/;
const getPublicIdFromUrl = (url: string): string | null => {
	try {
		const match = url.match(regex);
		return match ? match[1] : null;
	} catch {
		return null;
	}
};

export async function POST(
	req: NextRequest,
	context: { params: Promise<{ id: string }> } 
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	// ⬅️ precisa dar await
	const { id } = await context.params;
	const linkId = Number(id);

	if (Number.isNaN(linkId)) {
		return NextResponse.json({ error: "ID do link inválido" }, { status: 400 });
	}

	try {
		const link = await prisma.link.findFirst({
			where: { id: linkId, userId: session.user.id },
		});

		if (!link) {
			return NextResponse.json(
				{ error: "Link não encontrado ou não pertence a este usuário" },
				{ status: 404 }
			);
		}

		const formData = await req.formData();
		const file = formData.get("file");

		if (!(file instanceof File)) {
			return NextResponse.json(
				{ error: "Nenhum arquivo enviado." },
				{ status: 400 }
			);
		}

		if (file.size > 2 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "Arquivo excede o limite de 2MB." },
				{ status: 400 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

		// Deletar imagem antiga se existir
		if (link.productImageUrl) {
			const publicId = getPublicIdFromUrl(link.productImageUrl);
			if (publicId) {
				await cloudinary.uploader.destroy(publicId, {
					resource_type: "image",
				});
			}
		}

		const uploadResult = await cloudinary.uploader.upload(base64String, {
			folder: "bionk/product_images",
			public_id: `${session.user.id}-link${linkId}-${Date.now()}`,
			overwrite: true,
			resource_type: "image",
			transformation: [{ width: 1280, height: 720, crop: "limit" }],
		});

		const generatedUrl = uploadResult.secure_url;
		await prisma.link.update({
			where: { id: linkId },
			data: { productImageUrl: generatedUrl },
		});

		return NextResponse.json({ url: generatedUrl }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Erro ao processar o upload." },
			{ status: 500 }
		);
	}
}

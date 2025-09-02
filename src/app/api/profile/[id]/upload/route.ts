import { type NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const data = await req.formData();
	const file = data.get("file") as File;

	if (!file) {
		return NextResponse.json(
			{ success: false, error: "Nenhum arquivo enviado" },
			{ status: 400 }
		);
	}

	try {
		const fileBuffer = await file.arrayBuffer();
		const mimeType = file.type;
		const encoding = "base64";
		const base64Data = Buffer.from(fileBuffer).toString("base64");
		const fileUri = `data:${mimeType};${encoding},${base64Data}`;

		const result = await cloudinary.uploader.upload(fileUri, {
			folder: "profile-pictures",
			public_id: id,
			overwrite: true,
		});

		await prisma.user.update({
			where: { id },
			data: { image: result.secure_url },
		});

		return NextResponse.json({ success: true, url: result.secure_url });
	} catch {
		return NextResponse.json(
			{ success: false, error: "Erro ao fazer upload da imagem" },
			{ status: 500 }
		);
	}
}

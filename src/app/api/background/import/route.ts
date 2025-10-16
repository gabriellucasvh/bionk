import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

type CropArea = { x: number; y: number; width: number; height: number };
type Body = {
	url: string;
	type: "image" | "video";
	crop?: CropArea | null;
	credit?: {
		provider?: "pexels" | "coverr";
		authorName?: string;
		authorLink?: string;
		sourceLink?: string;
		coverrDownloadUrl?: string; // Coverr tracking endpoint
	};
};

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = (await request.json()) as Body;
		const { url, type, crop, credit } = body;

		if (!(url && type)) {
			return NextResponse.json(
				{ error: "Parâmetros obrigatórios ausentes (url, type)" },
				{ status: 400 }
			);
		}

		// Optional provider download tracking
		try {
			if (credit?.provider === "coverr" && credit.coverrDownloadUrl) {
				await fetch(credit.coverrDownloadUrl).catch(() => {});
			}
		} catch {
			// ignore tracking errors
		}

		if (type === "image") {
			// Antes de importar imagem, remover vídeo existente para garantir exclusividade
			try {
				await cloudinary.uploader.destroy(
					`backgrounds/${session.user.id}/video/background`,
					{ resource_type: "video" } as any
				);
			} catch {}

			const transformations: any[] = [];
			if (crop) {
				const { x, y, width, height } = crop;
				if (
					[x, y, width, height].every(
						(n) => typeof n === "number" && !Number.isNaN(n)
					)
				) {
					transformations.push({ crop: "crop", x, y, width, height });
				}
			}

			// Enforce vertical 9:16 output
			transformations.push(
				{ crop: "fill", gravity: "auto", width: 1080, height: 1920 },
				{ quality: "auto" }
			);

			const uploadResponse = await cloudinary.uploader.upload(url, {
				folder: `backgrounds/${session.user.id}/image`,
				public_id: "background",
				overwrite: true,
				resource_type: "image",
				transformation: transformations,
			} as any);

			return NextResponse.json({ url: (uploadResponse as any).secure_url });
		}

		if (type === "video") {
			// Antes de importar vídeo, remover imagem existente para garantir exclusividade
			try {
				await cloudinary.uploader.destroy(
					`backgrounds/${session.user.id}/image/background`,
					{ resource_type: "image" } as any
				);
			} catch {}

			const uploadResponse = await cloudinary.uploader.upload(url, {
				folder: `backgrounds/${session.user.id}/video`,
				public_id: "background",
				overwrite: true,
				resource_type: "video",
				transformation: [
					{ crop: "fill", width: 1080, height: 1920 },
					{ quality: "auto" },
				],
			} as any);

			return NextResponse.json({ url: (uploadResponse as any).secure_url });
		}

		return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
	} catch (error) {
		console.error("Erro ao importar mídia de background:", error);
		return NextResponse.json(
			{ error: "Erro interno ao importar mídia" },
			{ status: 500 }
		);
	}
}

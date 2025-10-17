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

		// Importação de IMAGEM via Cloudinary fetch (sem exclusões imediatas)
		if (type === "image") {
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

			// 9:16 vertical
			transformations.push(
				{ crop: "fill", gravity: "auto", width: 1080, height: 1920 },
				{ quality: "auto" }
			);

			const imageUrl = cloudinary.url(url, {
				resource_type: "image",
				type: "fetch",
				transformation: transformations,
				secure: true,
			} as any);

			return NextResponse.json({ url: imageUrl });
		}

		// Importação de VÍDEO via Cloudinary fetch (sem exclusões imediatas)
		if (type === "video") {
			const videoUrl = cloudinary.url(url, {
				resource_type: "video",
				type: "fetch",
				// Remover gravity:auto em vídeo para evitar erro de incoming transformation
				transformation: [
					{ crop: "fill", width: 1080, height: 1920 },
					{ quality: "auto" },
				],
				secure: true,
			} as any);

			return NextResponse.json({ url: videoUrl });
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

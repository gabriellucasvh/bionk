import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Area (crop) enviado pelo cliente
type CropArea = { x: number; y: number; width: number; height: number };

type Body = {
	type: "image" | "video";
	crop?: CropArea | null;
};

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = (await request.json()) as Body;
		const { type, crop } = body;

		if (!(type === "image" || type === "video")) {
			return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
		}

		const timestamp = Math.floor(Date.now() / 1000);

		// Monta transformações (como string) para enviar ao upload direto
		const transformations: string[] = [];
		if (type === "image" && crop) {
			const { x, y, width, height } = crop;
			if (
				[x, y, width, height].every(
					(n) => typeof n === "number" && !Number.isNaN(n)
				)
			) {
				transformations.push(
					`c_crop,x_${Math.round(x)},y_${Math.round(y)},w_${Math.round(
						width
					)},h_${Math.round(height)}`
				);
			}
		}

		// Enforce vertical 9:16 output
		if (type === "image") {
			transformations.push("c_fill,g_auto,w_1080,h_1920", "q_auto");
		} else {
			// vídeo não suporta gravity:auto com fill (evitar incoming transformation error)
			transformations.push("c_fill,w_1080,h_1920", "q_auto");
		}

		const transformation = transformations.join("/");

		const folder = `backgrounds/${session.user.id}/${type}`;
		const public_id = "background";

		// Parâmetros a serem assinados
		const paramsToSign: Record<string, any> = {
			timestamp,
			folder,
			public_id,
			overwrite: true,
			transformation,
		};

		const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
		const signature = cloudinary.utils.api_sign_request(
			paramsToSign,
			apiSecret
		);

		const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
		const apiKey = process.env.CLOUDINARY_API_KEY as string;
		const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

		return NextResponse.json({
			uploadUrl,
			cloudName,
			apiKey,
			timestamp,
			signature,
			params: { folder, public_id, overwrite: true, transformation },
		});
	} catch (error) {
		console.error("Erro ao assinar upload de background:", error);
		return NextResponse.json(
			{ error: "Erro interno ao assinar upload" },
			{ status: 500 }
		);
	}
}

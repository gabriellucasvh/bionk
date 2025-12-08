import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
export const runtime = "nodejs";

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
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                subscriptionPlan: true,
                subscriptionStatus: true,
                subscriptionEndDate: true,
            },
        });
        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
        }
        const plan = user.subscriptionPlan || "free";
        const isActive = user.subscriptionStatus === "active" && (!user.subscriptionEndDate || user.subscriptionEndDate >= new Date());
        const canUseBackgroundMedia = isActive && (plan === "pro" || plan === "ultra");
        if (!canUseBackgroundMedia) {
            return NextResponse.json(
                { error: "Disponível apenas nos planos Pro ou Ultra" },
                { status: 403 }
            );
        }

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

		const userId = session.user.id;

		if (type === "image") {
			// Exclusividade: remover vídeo anterior (se existir)
			try {
				await cloudinary.uploader.destroy(
					`backgrounds/${userId}/video/background`,
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

			// 9:16 vertical com gravity:auto e otimização
			transformations.push(
				{ crop: "fill", gravity: "auto", width: 1080, height: 1920 },
				{ quality: "auto" }
			);

			// Upload persistente do URL remoto como imagem
			const uploadResult = await cloudinary.uploader.upload(url, {
				resource_type: "image",
				folder: `backgrounds/${userId}/image`,
				public_id: "background",
				overwrite: true,
				transformation: transformations,
			} as any);

			return NextResponse.json({ url: uploadResult.secure_url });
		}

		if (type === "video") {
			// Exclusividade: remover imagem anterior (se existir)
			try {
				await cloudinary.uploader.destroy(
					`backgrounds/${userId}/image/background`,
					{ resource_type: "image" } as any
				);
			} catch {}

			// Upload persistente do URL remoto como vídeo
			const uploadResult = await cloudinary.uploader.upload(url, {
				resource_type: "video",
				folder: `backgrounds/${userId}/video`,
				public_id: "background",
				overwrite: true,
				transformation: [
					{ crop: "fill", width: 1080, height: 1920 },
					{ quality: "auto" },
				],
			} as any);

			return NextResponse.json({ url: uploadResult.secure_url });
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

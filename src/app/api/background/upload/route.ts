import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Accepted formats per requirements
const ACCEPTED_IMAGE_TYPES = [
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

const ACCEPTED_VIDEO_TYPES = [
	"video/mp4",
	"video/webm",
	// HEVC/H.265 commonly uses MP4 container; MIME often still `video/mp4`
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const type = String(formData.get("type") || "").toLowerCase(); // 'image' | 'video'
		const cropJson = formData.get("crop") as string | null; // optional for image

		if (!(file && type)) {
			return NextResponse.json(
				{ error: "Arquivo e tipo são obrigatórios" },
				{ status: 400 }
			);
		}

		// Validate by type
		if (type === "image") {
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				return NextResponse.json(
					{
						error:
							"Formato não suportado. Utilize JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC ou HEIF.",
					},
					{ status: 400 }
				);
			}

			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				return NextResponse.json(
					{ error: "Imagem muito grande (máx. 10MB)." },
					{ status: 400 }
				);
			}

			const buffer = Buffer.from(await file.arrayBuffer());

			// Parse crop if provided
			const transformations: any[] = [];
			if (cropJson) {
				try {
					const crop = JSON.parse(cropJson);
					const { x, y, width, height } = crop || {};
					if (
						typeof x === "number" &&
						typeof y === "number" &&
						typeof width === "number" &&
						typeof height === "number"
					) {
						transformations.push({ crop: "crop", x, y, width, height });
					}
				} catch {
					// ignore invalid crop json; still enforce fill 9:16
				}
			}

			// Enforce vertical 9:16 output
			transformations.push(
				{ crop: "fill", gravity: "auto", width: 1080, height: 1920 },
				{ quality: "auto" }
			);

			const uploadResponse: any = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: `backgrounds/${session.user.id}/image`,
							resource_type: "image",
							transformation: transformations,
						},
						(error, result) => {
							if (error) {
								reject(error);
							} else {
								resolve(result);
							}
						}
					)
					.end(buffer);
			});

			return NextResponse.json({ url: uploadResponse.secure_url });
		}

		if (type === "video") {
			if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
				return NextResponse.json(
					{ error: "Formato não suportado. Utilize WebM ou MP4 (HEVC)." },
					{ status: 400 }
				);
			}

			if (file.size > MAX_VIDEO_SIZE_BYTES) {
				return NextResponse.json(
					{ error: "Vídeo muito grande (máx. 50MB)." },
					{ status: 400 }
				);
			}

			const buffer = Buffer.from(await file.arrayBuffer());

			const uploadResponse: any = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: `backgrounds/${session.user.id}/video`,
							resource_type: "video",
							// Remover gravity:auto em transformação de vídeo para evitar erro de incoming transformation
							transformation: [
								{ crop: "fill", width: 1080, height: 1920 },
								{ quality: "auto" },
							],
						},
						(error, result) => {
							if (error) {
								reject(error);
							} else {
								resolve(result);
							}
						}
					)
					.end(buffer);
			});

			return NextResponse.json({ url: uploadResponse.secure_url });
		}
	} catch (error) {
		console.error("Erro no upload de background:", error);
		return NextResponse.json(
			{ error: "Erro interno no upload" },
			{ status: 500 }
		);
	}
}

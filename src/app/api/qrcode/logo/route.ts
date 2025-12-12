import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

const URL_REGEX = /^https?:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;

export async function GET() {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const r = getRedis();
		const url = await r.get<string | null>(`qrcode:logo:${uid}`);
		const res = NextResponse.json({ url: url || null });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const ct = req.headers.get("content-type") || "";
		if (ct.includes("multipart/form-data")) {
			const data = await req.formData();
			const file = data.get("file") as File | null;
			if (!file) {
				return NextResponse.json(
					{ error: "Nenhum arquivo enviado" },
					{ status: 400 }
				);
			}
			const allowed = [
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
			if (!allowed.includes(file.type)) {
				return NextResponse.json(
					{ error: "Formato não suportado" },
					{ status: 400 }
				);
			}
			if (file.size > 10 * 1024 * 1024) {
				return NextResponse.json(
					{ error: "Arquivo muito grande (máx. 10MB)" },
					{ status: 400 }
				);
			}
			const buffer = Buffer.from(await file.arrayBuffer());
			try {
				await cloudinary.uploader.destroy(`qrcode-logos/${uid}/logo`, {
					resource_type: "image",
				} as any);
			} catch {}
			const uploadResponse: any = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: `qrcode-logos/${uid}`,
							public_id: "logo",
							overwrite: true,
							resource_type: "image",
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
			const url = uploadResponse.secure_url as string;
			const r = getRedis();
			await r.set(`qrcode:logo:${uid}`, url);
			const res = NextResponse.json({ saved: true, url });
			res.headers.set("Cache-Control", "no-store");
			return res;
		}
		const body = await req.json();
		const url = typeof body?.url === "string" ? body.url.trim() : "";
		if (!(url && URL_REGEX.test(url))) {
			return NextResponse.json({ error: "URL inválida" }, { status: 400 });
		}
		const r = getRedis();
		await r.set(`qrcode:logo:${uid}`, url);
		const res = NextResponse.json({ saved: true, url });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

export async function DELETE() {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const r = getRedis();
		await r.del(`qrcode:logo:${uid}`);
		const res = NextResponse.json({ deleted: true });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

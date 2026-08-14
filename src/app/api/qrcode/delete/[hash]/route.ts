import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth-session";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

export async function DELETE(
	_: Request,
	ctx: { params: Promise<{ hash: string }> }
) {
	const session = (await getAppSession()) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { hash: hashParam } = await ctx.params;
	const hash = String(hashParam || "").trim();
	if (!hash) {
		return NextResponse.json({ error: "Hash inválido" }, { status: 400 });
	}
	try {
		const r = getRedis();
		const metaStr = await r.get<string | null>(`qrcode:meta:${hash}`);
		let meta: any = null;
		if (metaStr) {
			try {
				meta = JSON.parse(metaStr);
			} catch {
				meta = null;
			}
		}
		let inSet = false;
		try {
			const v = await r.sismember(`qrcode:user:${uid}`, hash);
			inSet = Boolean(v);
		} catch {
			inSet = false;
		}
		const isOwner =
			inSet || (meta && String(meta.userId || "") === String(uid));
		if (!isOwner) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
		try {
			await cloudinary.uploader.destroy(`qrcodes/${uid}/${hash}`, {
				resource_type: "image",
			} as any);
		} catch {}
		try {
			await cloudinary.uploader.destroy(`qrcodes/${uid}/${hash}-logo`, {
				resource_type: "image",
			} as any);
		} catch {}
		await Promise.all([
			r.del(`qrcode:map:${hash}`),
			r.del(`qrcode:meta:${hash}`),
			r.srem(`qrcode:user:${uid}`, hash),
		]);
		const res = NextResponse.json({ deleted: true });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

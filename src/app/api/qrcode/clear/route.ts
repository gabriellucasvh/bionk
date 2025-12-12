import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

export async function POST() {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const r = getRedis();
		const hashes = (await r.smembers<string[]>(`qrcode:user:${uid}`)) || [];
		await Promise.all(
			hashes.map(async (h) => {
				try {
					await cloudinary.uploader.destroy(`qrcodes/${uid}/${h}`, {
						resource_type: "image",
					} as any);
				} catch {}
				try {
					await cloudinary.uploader.destroy(`qrcodes/${uid}/${h}-logo`, {
						resource_type: "image",
					} as any);
				} catch {}
			})
		);
		await Promise.all([
			r.del(...hashes.map((h) => `qrcode:map:${h}`)),
			r.del(...hashes.map((h) => `qrcode:meta:${h}`)),
			r.del(`qrcode:user:${uid}`),
		]);
		const res = NextResponse.json({ cleared: hashes.length });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

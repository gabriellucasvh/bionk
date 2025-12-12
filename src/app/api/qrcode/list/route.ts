import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

export async function GET() {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const r = getRedis();
		let hashes: string[] = [];
		try {
			hashes = (await r.smembers(`qrcode:user:${uid}`)) || [];
		} catch {
			hashes = [];
		}
		hashes = hashes.filter((h) => typeof h === "string" && h.length > 0);
		const items = await Promise.all(
			hashes.map(async (h) => {
				try {
					const [metaStr, url] = await Promise.all([
						r.get<string | null>(`qrcode:meta:${h}`),
						r.get<string | null>(`qrcode:map:${h}`),
					]);
					if (!url) {
						return null;
					}
					let meta: any = {};
					if (metaStr) {
						try {
							meta = JSON.parse(metaStr);
						} catch {
							meta = {};
						}
					}
					return {
						hash: h,
						url,
						createdAt: meta.createdAt || null,
						format: meta.format || null,
						size: Number(meta.size || 0),
						bytes: Number(meta.bytes || 0),
						originalUrl: meta.originalUrl || null,
					};
				} catch {
					return null;
				}
			})
		);
		const out = items.filter((x) => !!x) as any[];
		out.sort((a, b) =>
			String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
		);
		const res = NextResponse.json({ items: out, count: out.length });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

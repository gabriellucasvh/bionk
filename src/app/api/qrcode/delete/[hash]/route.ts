import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

export async function DELETE(
	_: Request,
	{ params }: { params: { hash: string } }
) {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	if (!uid) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const hash = String(params.hash || "").trim();
	if (!hash) {
		return NextResponse.json({ error: "Hash inválido" }, { status: 400 });
	}
	try {
		const r = getRedis();
		const metaStr = await r.get<string | null>(`qrcode:meta:${hash}`);
		const meta = metaStr ? JSON.parse(metaStr) : null;
		if (!meta || String(meta.userId || "") !== String(uid)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}
		const dir = path.join(process.cwd(), "public", "qr");
		const files = [
			path.join(dir, `${hash}.png`),
			path.join(dir, `${hash}.svg`),
		];
		await Promise.all(
			files.map(async (f) => {
				try {
					await fs.unlink(f);
				} catch {}
			})
		);
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

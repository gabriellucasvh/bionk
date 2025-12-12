import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
		const dir = path.join(process.cwd(), "public", "qr");
		const files = hashes.flatMap((h) => [
			path.join(dir, `${h}.png`),
			path.join(dir, `${h}.svg`),
		]);
		await Promise.all(
			files.map(async (f) => {
				try {
					await fs.unlink(f);
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

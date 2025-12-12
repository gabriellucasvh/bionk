import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
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
		const hashes = (await r.smembers<string[]>(`qrcode:user:${uid}`)) || [];
		if (hashes.length === 0) {
			return NextResponse.json({ error: "Vazio" }, { status: 404 });
		}
		const dir = path.join(process.cwd(), "public", "qr");
		const zip = new JSZip();
		const entries = await Promise.all(
			hashes.map(async (h) => {
				const png = path.join(dir, `${h}.png`);
				const svg = path.join(dir, `${h}.svg`);
				let pngBuf: Buffer | null = null;
				let svgStr: string | null = null;
				try {
					pngBuf = await fs.readFile(png);
				} catch {}
				try {
					svgStr = await fs.readFile(svg, { encoding: "utf-8" });
				} catch {}
				return { h, pngBuf, svgStr };
			})
		);
		let addedCount = 0;
		for (const e of entries) {
			if (e.pngBuf) {
				zip.file(`${e.h}.png`, e.pngBuf);
				addedCount++;
			}
			if (e.svgStr) {
				zip.file(`${e.h}.svg`, e.svgStr);
				addedCount++;
			}
		}
		if (addedCount === 0) {
			return NextResponse.json({ error: "Vazio" }, { status: 404 });
		}
		const arrayBuffer = await zip.generateAsync({
			type: "arraybuffer",
			compression: "DEFLATE",
		});
		const res = new NextResponse(arrayBuffer, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": "attachment; filename=qr-codes.zip",
				"Cache-Control": "no-store",
			},
		});
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	buildAndCacheQr,
	canonicalizeUrl,
	enqueueQrJob,
	shortHash,
} from "@/lib/qrcode";
export const runtime = "nodejs";

const URL_REGEX = /^https?:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;

export async function POST(req: NextRequest) {
	const session = (await getServerSession(authOptions as any)) as any;
	const uid = session?.user?.id || null;
	try {
		const body = await req.json();
		const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
		const format = body?.format === "svg" ? "svg" : "png";
		const size = Math.max(128, Math.min(2048, Number(body?.size || 512)));
		const mode = String(body?.mode || "inline");
		if (!(rawUrl && URL_REGEX.test(rawUrl))) {
			return NextResponse.json({ error: "URL inválida" }, { status: 400 });
		}
		const canon = canonicalizeUrl(rawUrl);
		const key = shortHash(`${canon}|${format}|${size}`);
		if (mode === "queue") {
			if (uid) {
				await enqueueQrJob({
					userId: String(uid),
					rawUrl: canon,
					format,
					size,
				});
			}
			const res = NextResponse.json({ accepted: true, hash: key });
			res.headers.set("Cache-Control", "no-store");
			return res;
		}
		const qr = await buildAndCacheQr(canon, { format, size, userId: uid });
		const res = NextResponse.json({
			url: qr.url,
			hash: qr.hash,
			format: qr.format,
			size: qr.size,
		});
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Erro interno" }, { status: 500 });
	}
}

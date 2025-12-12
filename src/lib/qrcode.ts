import crypto from "node:crypto";
import QRCode, {
	type QRCodeToBufferOptions,
	type QRCodeToStringOptions,
} from "qrcode";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

const HTTP_SCHEME_RE = /^https?:\/\//i;
const HOSTNAME_RE = /^[\w.-]+$/;
const TRAILING_SLASHES_RE = /\/+$/;
const UTM_PARAM_RE = /^(utm_|gclid|fbclid|msclkid)$/i;
const SVG_CLOSE_RE = /<\/svg>\s*$/i;
const SVG_OPEN_RE = /^<svg\b[^>]*>/i;
const XMLNS_XLINK_RE = /\sxmlns:xlink=/i;
const SVG_WIDTH_RE = /\bwidth="(\d+)(?:px)?"/i;
const SVG_VIEWBOX_RE = /\bviewBox="\s*0\s+0\s+(\d+)\s+(\d+)\s*"/i;
const END_TAG_RE = />$/;
const BASE64_PLUS_RE = /\+/g;
const BASE64_SLASH_RE = /\//g;
const BASE64_EQUALS_END_RE = /=+$/g;

function ensureHttps(u: string): string {
	const s = String(u || "").trim();
	if (s.length === 0) {
		return "";
	}
	if (s.startsWith("http://")) {
		return `https://${s.slice(7)}`;
	}
	if (!HTTP_SCHEME_RE.test(s)) {
		return `https://${s}`;
	}
	return s;
}

export function isValidUrl(u: string): boolean {
	try {
		const s = ensureHttps(u);
		const parsed = new URL(s);
		const host = parsed.hostname.toLowerCase();
		if (!HOSTNAME_RE.test(host)) {
			return false;
		}
		if (!(parsed.protocol === "https:" || parsed.protocol === "http:")) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

export function canonicalizeUrl(u: string): string {
	try {
		const s = ensureHttps(u);
		const parsed = new URL(s);
		parsed.protocol = "https:";
		parsed.hostname = parsed.hostname.toLowerCase();
		const keys = Array.from(parsed.searchParams.keys());
		for (const k of keys) {
			if (UTM_PARAM_RE.test(k)) {
				parsed.searchParams.delete(k);
			}
		}
		const cleanPath = parsed.pathname.replace(TRAILING_SLASHES_RE, "");
		parsed.pathname = cleanPath.length > 0 ? cleanPath : "/";
		return parsed.toString();
	} catch {
		return ensureHttps(u);
	}
}

export function shortHash(input: string): string {
	const h = crypto.createHash("sha256").update(input).digest();
	const b64 = h
		.toString("base64")
		.replace(BASE64_PLUS_RE, "-")
		.replace(BASE64_SLASH_RE, "_")
		.replace(BASE64_EQUALS_END_RE, "");
	return b64.slice(0, 12);
}

export async function generateQr(
	url: string,
	opts: {
		format?: "png" | "svg";
		size?: number;
		ecLevel?: "L" | "M" | "Q" | "H";
	}
): Promise<{ format: "png" | "svg"; data: Buffer | string; bytes: number }> {
	const format = opts.format === "svg" ? "svg" : "png";
	const size = Math.max(128, Math.min(2048, Number(opts.size || 512)));
	const scale = Math.max(2, Math.min(16, Math.round(size / 32)));
	if (format === "png") {
		const buf: Buffer = await QRCode.toBuffer(url, {
			errorCorrectionLevel: opts.ecLevel || "M",
			scale,
			margin: 2,
			color: { dark: "#000000", light: "#ffffff" },
		} as QRCodeToBufferOptions);
		return { format, data: buf, bytes: buf.byteLength };
	}
	const svg: string = await QRCode.toString(url, {
		errorCorrectionLevel: opts.ecLevel || "M",
		type: "svg",
		scale,
		margin: 2,
		color: { dark: "#000000", light: "#ffffff" },
	} as QRCodeToStringOptions);
	const bytes = Buffer.byteLength(svg, "utf-8");
	return { format, data: svg, bytes };
}

export async function saveQr(
	hash: string,
	payload: { format: "png" | "svg"; data: Buffer | string; variant?: string },
	userId?: string | null
): Promise<{ filePath: string; publicUrl: string }> {
	const suffix = payload.variant ? `-${payload.variant}` : "";
	const publicId = `${hash}${suffix}`;
	let fileUri = "";
	if (payload.format === "png") {
		const buf = payload.data as Buffer;
		const b64 = buf.toString("base64");
		fileUri = `data:image/png;base64,${b64}`;
	} else {
		const svgText = String(payload.data);
		const b64 = Buffer.from(svgText, "utf-8").toString("base64");
		fileUri = `data:image/svg+xml;base64,${b64}`;
	}
	const folder = userId ? `qrcodes/${userId}` : "qrcodes";
	const result = await cloudinary.uploader.upload(fileUri, {
		folder,
		public_id: publicId,
		overwrite: true,
		resource_type: "image",
	} as any);
	const publicUrl = (result as any).secure_url as string;
	return { filePath: "", publicUrl };
}

export async function getCachedUrl(hash: string): Promise<string | null> {
	const r = getRedis();
	const v = await r.get<string | null>(`qrcode:map:${hash}`);
	return v || null;
}

export async function setCache(
	hash: string,
	url: string,
	meta: {
		userId?: string | null;
		size: number;
		format: string;
		bytes: number;
		originalUrl?: string;
	}
): Promise<void> {
	const r = getRedis();
	await r.set(`qrcode:map:${hash}`, url);
	const createdAt = new Date().toISOString();
	const m = {
		userId: meta.userId || "",
		size: String(meta.size),
		format: meta.format,
		bytes: String(meta.bytes),
		createdAt,
		originalUrl: meta.originalUrl || "",
		url,
		hash,
	};
	await r.set(`qrcode:meta:${hash}`, JSON.stringify(m));
	if (meta.userId) {
		await r.sadd(`qrcode:user:${meta.userId}`, hash);
	}
	try {
		await r.xadd("logs:qrcode", "*", m);
	} catch {}
}

export async function buildAndCacheQr(
	rawUrl: string,
	opts: {
		format?: "png" | "svg";
		size?: number;
		userId?: string | null;
		logoUrl?: string | null;
	}
): Promise<{
	hash: string;
	url: string;
	bytes: number;
	size: number;
	format: "png" | "svg";
}> {
	const valid = isValidUrl(rawUrl);
	if (!valid) {
		throw new Error("URL inválida");
	}
	const canon = canonicalizeUrl(rawUrl);
	const fmt = opts.logoUrl ? "svg" : opts.format === "svg" ? "svg" : "png";
	const size = Math.max(128, Math.min(2048, Number(opts.size || 512)));
	const key = shortHash(`${canon}|${fmt}|${size}|${opts.logoUrl || ""}`);
	const cached = await getCachedUrl(key);
	const uid = opts.userId ? String(opts.userId) : null;
	if (cached) {
		if (uid) {
			try {
				await prisma.qrCode.upsert({
					where: { hash: key },
					update: {
						requestCount: { increment: 1 },
						storageUrl: cached,
						status: "ativo",
					},
					create: {
						hash: key,
						userId: uid,
						originalUrl: canon,
						storageUrl: cached,
						status: "ativo",
					},
				});
			} catch {}
		}
		return { hash: key, url: cached, bytes: 0, size, format: fmt };
	}
	const existing = uid
		? await prisma.qrCode.findUnique({ where: { hash: key } }).catch(() => null)
		: null;
	const qr = await generateQr(canon, {
		format: fmt,
		size,
		ecLevel: opts.logoUrl ? "H" : "M",
	});
	let dataOut = qr.data;
	if (fmt === "svg" && typeof dataOut === "string" && opts.logoUrl) {
		const text = String(dataOut);
		const vb = text.match(SVG_VIEWBOX_RE);
		const ww = text.match(SVG_WIDTH_RE);
		const dim = vb
			? Math.max(Number(vb[1] || 0), Number(vb[2] || 0))
			: ww
				? Number(ww[1])
				: size;
		const overlaySize = Math.round(dim * 0.3);
		const xy = Math.round((dim - overlaySize) / 2);
		let href = String(opts.logoUrl);
		try {
			const resp = await fetch(href);
			const ct = resp.headers.get("content-type") || "image/png";
			const ab = await resp.arrayBuffer();
			const b64 = Buffer.from(ab).toString("base64");
			href = `data:${ct};base64,${b64}`;
		} catch {}
		const injection = `\n<rect x="${xy - Math.round(overlaySize * 0.08)}" y="${xy - Math.round(overlaySize * 0.08)}" width="${overlaySize + Math.round(overlaySize * 0.16)}" height="${overlaySize + Math.round(overlaySize * 0.16)}" rx="${Math.round(overlaySize * 0.12)}" fill="#ffffff" />\n<image href="${href}" xlink:href="${href}" x="${xy}" y="${xy}" width="${overlaySize}" height="${overlaySize}" preserveAspectRatio="xMidYMid meet" />\n`;
		let svgText = text;
		if (SVG_OPEN_RE.test(svgText) && !XMLNS_XLINK_RE.test(svgText)) {
			svgText = svgText.replace(SVG_OPEN_RE, (m) =>
				m.replace(END_TAG_RE, ' xmlns:xlink="http://www.w3.org/1999/xlink">')
			);
		}
		dataOut = svgText.replace(SVG_CLOSE_RE, `${injection}</svg>`);
	}
	const bytesOut =
		fmt === "svg" && typeof dataOut === "string"
			? Buffer.byteLength(String(dataOut), "utf-8")
			: fmt === "png"
				? (dataOut as Buffer).byteLength
				: 0;
	const saved = await saveQr(
		key,
		{
			format: fmt,
			data: dataOut,
			variant: opts.logoUrl ? "logo" : undefined,
		},
		uid
	);
	await setCache(key, saved.publicUrl, {
		userId: opts.userId || null,
		size,
		format: fmt,
		bytes: bytesOut,
		originalUrl: canon,
	});
	if (uid) {
		try {
			if (existing) {
				await prisma.qrCode.update({
					where: { hash: key },
					data: {
						requestCount: { increment: 1 },
						storageUrl: saved.publicUrl,
						status: "regenerado",
					},
				});
			} else {
				await prisma.qrCode.create({
					data: {
						hash: key,
						userId: uid,
						originalUrl: canon,
						storageUrl: saved.publicUrl,
						status: "ativo",
					},
				});
			}
		} catch {}
	}
	return {
		hash: key,
		url: saved.publicUrl,
		bytes: bytesOut,
		size,
		format: fmt,
	};
}

export async function enqueueQrJob(payload: {
	userId: string;
	rawUrl: string;
	format?: "png" | "svg";
	size?: number;
}): Promise<void> {
	const r = getRedis();
	const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
	const shard =
		Math.abs(
			Array.from(payload.userId).reduce((a, c) => a + c.charCodeAt(0), 0)
		) % shardCount;
	await r.lpush(
		`ingest:qrcodes:${payload.userId}:${shard}`,
		JSON.stringify(payload)
	);
}

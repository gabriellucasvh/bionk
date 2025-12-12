import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import QRCode, {
	type QRCodeToBufferOptions,
	type QRCodeToStringOptions,
} from "qrcode";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

const HTTP_SCHEME_RE = /^https?:\/\//i;
const HOSTNAME_RE = /^[\w.-]+$/;
const TRAILING_SLASHES_RE = /\/+$/;
const UTM_PARAM_RE = /^(utm_|gclid|fbclid|msclkid)$/i;

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
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/g, "");
	return b64.slice(0, 12);
}

async function ensureDir(dir: string): Promise<void> {
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch {}
}

export async function generateQr(
	url: string,
	opts: { format?: "png" | "svg"; size?: number }
): Promise<{ format: "png" | "svg"; data: Buffer | string; bytes: number }> {
	const format = opts.format === "svg" ? "svg" : "png";
	const size = Math.max(128, Math.min(2048, Number(opts.size || 512)));
	const scale = Math.max(2, Math.min(16, Math.round(size / 32)));
	if (format === "png") {
		const buf: Buffer = await QRCode.toBuffer(url, {
			errorCorrectionLevel: "M",
			scale,
			margin: 2,
			color: { dark: "#000000", light: "#ffffff" },
		} as QRCodeToBufferOptions);
		return { format, data: buf, bytes: buf.byteLength };
	}
	const svg: string = await QRCode.toString(url, {
		errorCorrectionLevel: "M",
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
	payload: { format: "png" | "svg"; data: Buffer | string }
): Promise<{ filePath: string; publicUrl: string }> {
	const dir = path.join(process.cwd(), "public", "qr");
	await ensureDir(dir);
	const file = `${hash}.${payload.format}`;
	const filePath = path.join(dir, file);
	if (payload.format === "png") {
		await fs.writeFile(filePath, payload.data as Buffer);
	} else {
		await fs.writeFile(filePath, payload.data as string, { encoding: "utf-8" });
	}
	const publicUrl = `/qr/${file}`;
	return { filePath, publicUrl };
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
	opts: { format?: "png" | "svg"; size?: number; userId?: string | null }
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
	const fmt = opts.format === "svg" ? "svg" : "png";
	const size = Math.max(128, Math.min(2048, Number(opts.size || 512)));
	const key = shortHash(`${canon}`);
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
	const qr = await generateQr(canon, { format: fmt, size });
	const saved = await saveQr(key, { format: qr.format, data: qr.data });
	await setCache(key, saved.publicUrl, {
		userId: opts.userId || null,
		size,
		format: fmt,
		bytes: qr.bytes,
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
		bytes: qr.bytes,
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

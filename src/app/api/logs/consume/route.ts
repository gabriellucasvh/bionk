import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

function authorized(req: Request) {
	const isProd = process.env.NODE_ENV === "production";
	const vercelHeader = (req.headers.get("x-vercel-cron") || "").trim();
	const token = (new URL(req.url).searchParams.get("token") || "").trim();
	const secret = process.env.CRON_SECRET || "";
	if (isProd) {
		if (vercelHeader.length > 0) {
			return true;
		}
		if (secret && token && token === secret) {
			return true;
		}
		return false;
	}
	if (secret && token && token === secret) {
		return true;
	}
	return false;
}

function monthKey(dt: Date): string {
	const y = dt.getUTCFullYear();
	const m = `${dt.getUTCMonth() + 1}`.padStart(2, "0");
	return `${y}${m}`;
}

export async function POST(req: Request) {
	if (!authorized(req)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const r = getRedis();
		const lastIdKey = "logs:events:last_id";
		const lastId = (await r.get<string | null>(lastIdKey)) || "0-0";
		const batchSize = 1000;

		const raw = (await r.xrange(
			"logs:events",
			lastId,
			"+",
			batchSize
		)) as unknown;
		let entries: [string, Record<string, unknown>][] = [];
		if (Array.isArray(raw)) {
			const arr = raw as any[];
			if (arr.length > 0 && Array.isArray(arr[0])) {
				entries = arr as [string, Record<string, unknown>][];
			} else {
				entries = arr.map((item: any) => [
					item.id as string,
					item.message as Record<string, unknown>,
				]);
			}
		} else {
			entries = Object.entries(raw as Record<string, Record<string, unknown>>);
		}
		if (entries.length === 0) {
			const res = NextResponse.json({ processed: 0, empty: true });
			res.headers.set("Cache-Control", "no-store");
			return res;
		}

		const referrerCounts = new Map<string, number>();
		const deviceCounts = new Map<string, number>();

		let maxId = lastId;
		for (const [id, fields] of entries) {
			maxId = id;
			const ref = (fields.referrer as string) || "unknown";
			const dev = (fields.device as string) || "unknown";
			const at =
				typeof fields.at === "string" ? new Date(fields.at) : new Date();
			const mk = monthKey(at);
			const refKey = `agg:referrer:${mk}:${ref}`;
			const devKey = `agg:device:${mk}:${dev}`;
			referrerCounts.set(refKey, (referrerCounts.get(refKey) || 0) + 1);
			deviceCounts.set(devKey, (deviceCounts.get(devKey) || 0) + 1);
		}

		const ops: Promise<any>[] = [];
		for (const [key, count] of referrerCounts.entries()) {
			ops.push(r.incrby(key, count));
		}
		for (const [key, count] of deviceCounts.entries()) {
			ops.push(r.incrby(key, count));
		}
		ops.push(r.set(lastIdKey, maxId));
		await Promise.all(ops);

		const res = NextResponse.json({ processed: entries.length, lastId: maxId });
		res.headers.set("Cache-Control", "no-store");
		return res;
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

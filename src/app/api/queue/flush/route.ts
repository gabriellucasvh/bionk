import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

function getRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!(url && token)) {
		throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
	}
	return new Redis({ url, token });
}

export async function POST(req: Request) {
	if (!authorized(req)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const r = getRedis();
		const maxBatch = 1000;
		const clicksLenRaw = await r.llen("events:clicks");
		const viewsLenRaw = await r.llen("events:views");
		const clicksLen = Number(clicksLenRaw || 0);
		const viewsLen = Number(viewsLenRaw || 0);
		const batchClicks = Math.min(maxBatch, Math.max(0, clicksLen));
		const batchViews = Math.min(maxBatch, Math.max(0, viewsLen));
		const clicksPops = Array.from({ length: batchClicks }, () =>
			r.rpop<string | null>("events:clicks")
		);
		const viewsPops = Array.from({ length: batchViews }, () =>
			r.rpop<string | null>("events:views")
		);
		const rawClicks = await Promise.all(clicksPops);
		const rawViews = await Promise.all(viewsPops);
		const clicks: any[] = [];
		const views: any[] = [];
		for (const raw of rawClicks) {
			if (!raw) {
				continue;
			}
			try {
				clicks.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawViews) {
			if (!raw) {
				continue;
			}
			try {
				views.push(JSON.parse(raw));
			} catch {}
		}

		let insertedClicks = 0;
		let insertedViews = 0;

		if (clicks.length > 0) {
			const data = clicks.map((c) => ({
				linkId: Number(c.linkId),
				device: typeof c.device === "string" ? c.device : null,
				userAgent: typeof c.userAgent === "string" ? c.userAgent : null,
				country: typeof c.country === "string" ? c.country : null,
				referrer: typeof c.referrer === "string" ? c.referrer : null,
				createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
			}));
			const res = await prisma.linkClick.createMany({ data });
			insertedClicks = res.count;
		}

		if (views.length > 0) {
			const data = views.map((v) => ({
				userId: String(v.userId),
				device: typeof v.device === "string" ? v.device : null,
				userAgent: typeof v.userAgent === "string" ? v.userAgent : null,
				country: typeof v.country === "string" ? v.country : null,
				referrer: typeof v.referrer === "string" ? v.referrer : null,
				createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
			}));
			const res = await prisma.profileView.createMany({ data });
			insertedViews = res.count;
		}

		const response = NextResponse.json({
			clicks: insertedClicks,
			views: insertedViews,
			empty: insertedClicks === 0 && insertedViews === 0,
		});
		if (insertedClicks === 0 && insertedViews === 0) {
			response.headers.set("Retry-After", "30");
		}
		response.headers.set("Cache-Control", "no-store");
		return response;
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

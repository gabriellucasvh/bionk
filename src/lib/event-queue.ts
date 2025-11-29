import { getRedis } from "@/lib/redis";

export async function enqueueClickEvent(payload: {
	linkId: number;
	device: string | null;
	userAgent: string | null;
	country: string | null;
	referrer: string | null;
	createdAt: string;
}) {
	const r = getRedis();
	await r.lpush("events:clicks", JSON.stringify(payload));
	try {
		const fields: Record<string, string> = {
			type: "click",
			linkId: String(payload.linkId),
			userId: "",
			device: payload.device ?? "unknown",
			referrer: payload.referrer ?? "unknown",
			at: payload.createdAt,
		};
		await r.xadd("logs:events", "*", fields);
	} catch {}
}

export async function enqueueProfileViewEvent(payload: {
	userId: string;
	device: string | null;
	userAgent: string | null;
	country: string | null;
	referrer: string | null;
	createdAt: string;
}) {
	const r = getRedis();
	await r.lpush("events:views", JSON.stringify(payload));
	try {
		const fields: Record<string, string> = {
			type: "view",
			linkId: "",
			userId: String(payload.userId),
			device: payload.device ?? "unknown",
			referrer: payload.referrer ?? "unknown",
			at: payload.createdAt,
		};
		await r.xadd("logs:events", "*", fields);
	} catch {}
}

export async function incrementLinkClickCounter(
	linkId: number
): Promise<number> {
	const r = getRedis();
	const key = `link:click_counter:${linkId}`;
	const count = await r.incr(key);
	return Number(count || 0);
}

export async function ensureLinkClickCounter(
	linkId: number,
	base: number
): Promise<void> {
	const r = getRedis();
	const key = `link:click_counter:${linkId}`;
	await r.set(key, Number(base || 0), { nx: true });
}

export async function getLinkClickCounter(linkId: number): Promise<number> {
	const r = getRedis();
	const key = `link:click_counter:${linkId}`;
	const v = await r.get<number | null>(key);
	return Number(v || 0);
}

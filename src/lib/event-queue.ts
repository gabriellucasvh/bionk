import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis() {
	if (!_redis) {
		const url = process.env.UPSTASH_REDIS_REST_URL;
		const token = process.env.UPSTASH_REDIS_REST_TOKEN;
		if (!(url && token)) {
			throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
		}
		_redis = new Redis({ url, token });
	}
	return _redis;
}

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

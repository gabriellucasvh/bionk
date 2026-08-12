/**
 * Redis client — usa ioredis (TCP nativo) em vez de @upstash/redis (REST HTTP).
 * Mantém a mesma interface usada no projeto para zero impacto nos consumidores.
 */
import IORedis from "ioredis";

let _client: IORedis | null = null;

function getClient(): IORedis {
	if (!_client) {
		const url = process.env.REDIS_URL;
		if (!url) {
			throw new Error("REDIS_URL não configurada");
		}
		_client = new IORedis(url, {
			maxRetriesPerRequest: 3,
			enableOfflineQueue: true,
			lazyConnect: false,
			retryStrategy(times) {
				if (times > 10) return null;
				return Math.min(times * 100, 3000);
			},
		});
		_client.on("error", (err) => {
			console.error("[Redis] Erro de conexão:", err.message);
		});
	}
	return _client;
}

/**
 * Wrapper com interface compatível com @upstash/redis:
 * - get<T>() auto-deserializa JSON
 * - set() aceita objetos e opções { ex, nx }
 * - lpush, sadd, srem, smembers, sismember
 * - xadd, xrange, incrby, incr, expire, del
 */
class BionkRedis {
	async get<T = string>(key: string): Promise<T | null> {
		const raw = await getClient().get(key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return raw as unknown as T;
		}
	}

	async set(
		key: string,
		value: unknown,
		opts?: { ex?: number; nx?: boolean },
	): Promise<void> {
		const serialized =
			typeof value === "string" ? value : JSON.stringify(value);
		const client = getClient();

		if (opts?.nx && opts?.ex) {
			await client.set(key, serialized, "EX", opts.ex, "NX");
		} else if (opts?.nx) {
			await client.set(key, serialized, "NX");
		} else if (opts?.ex) {
			await client.set(key, serialized, "EX", opts.ex);
		} else {
			await client.set(key, serialized);
		}
	}

	/** Aceita uma ou múltiplas chaves */
	async del(...keys: string[]): Promise<number> {
		if (keys.length === 0) return 0;
		return getClient().del(...keys);
	}

	async incr(key: string): Promise<number> {
		return getClient().incr(key);
	}

	async incrby(key: string, increment: number): Promise<number> {
		return getClient().incrby(key, increment);
	}

	async expire(key: string, seconds: number): Promise<number> {
		return getClient().expire(key, seconds);
	}

	async lpush(key: string, ...values: string[]): Promise<number> {
		return getClient().lpush(key, ...values);
	}

	// ---- Set operations ----

	async sadd(key: string, ...members: string[]): Promise<number> {
		return getClient().sadd(key, ...members);
	}

	async srem(key: string, ...members: string[]): Promise<number> {
		return getClient().srem(key, ...members);
	}

	async smembers<T extends string[] = string[]>(key: string): Promise<T> {
		const result = await getClient().smembers(key);
		return result as unknown as T;
	}

	async sismember(key: string, member: string): Promise<0 | 1> {
		return getClient().sismember(key, member) as Promise<0 | 1>;
	}

	// ---- Stream operations ----

	/**
	 * xadd: adiciona entry a um stream Redis.
	 * Interface: xadd(key, "*", Record<string,string>)
	 */
	async xadd(
		key: string,
		id: string,
		fields: Record<string, string>,
	): Promise<string | null> {
		const flat: string[] = [];
		for (const [k, v] of Object.entries(fields)) {
			flat.push(k, String(v));
		}
		// biome-ignore lint/suspicious/noExplicitAny: ioredis overload
		return (getClient() as any).xadd(key, id, ...flat);
	}

	/**
	 * xrange: lê entries de um stream.
	 * Retorna array de [id, Record<string,string>] (ioredis format).
	 */
	async xrange(
		key: string,
		start: string,
		end: string,
		count?: number,
	): Promise<[string, Record<string, string>][]> {
		const client = getClient();
		let raw: string[][];
		if (count !== undefined) {
			// biome-ignore lint/suspicious/noExplicitAny: ioredis overload
			raw = await (client as any).xrange(key, start, end, "COUNT", count);
		} else {
			// biome-ignore lint/suspicious/noExplicitAny: ioredis overload
			raw = await (client as any).xrange(key, start, end);
		}
		// ioredis retorna: [[id, [field1, val1, field2, val2, ...]], ...]
		return raw.map((entry: any) => {
			const id = entry[0] as string;
			const fieldArr = entry[1] as string[];
			const obj: Record<string, string> = {};
			for (let i = 0; i < fieldArr.length; i += 2) {
				obj[fieldArr[i]] = fieldArr[i + 1];
			}
			return [id, obj] as [string, Record<string, string>];
		});
	}
}

let _redis: BionkRedis | null = null;

export function getRedis(): BionkRedis {
	if (!_redis) {
		_redis = new BionkRedis();
	}
	return _redis;
}

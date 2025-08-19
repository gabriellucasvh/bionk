// src/lib/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _authRateLimiter: Ratelimit | null = null;

export function getAuthRateLimiter() {
	if (!_authRateLimiter) {
		const url = process.env.UPSTASH_REDIS_REST_URL;
		const token = process.env.UPSTASH_REDIS_REST_TOKEN;

		if (!(url && token)) {
			throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
		}

		const redis = new Redis({ url, token });

		_authRateLimiter = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests por 10 segundos
			analytics: true,
			prefix: "ratelimit_auth",
		});
	}

	return _authRateLimiter;
}

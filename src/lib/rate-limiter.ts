// src/lib/rate-limiter.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

if (
	!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
) {
	throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
}

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cria um novo rate limiter que permite 5 requisições a cada 10 segundos.
// Você pode criar diferentes instâncias com limites diferentes para cada caso de uso.
export const authRateLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests por 10 segundos
	analytics: true, // Habilita logs para análise no painel da Upstash
	prefix: "ratelimit_auth",
});

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let _authRateLimiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;

async function redisCmd(cmd: (string | number)[]) {
    if (!(REDIS_URL && REDIS_TOKEN)) {
        throw new Error("Variáveis de ambiente do Upstash Redis não definidas");
    }
    const res = await fetch(REDIS_URL as string, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${REDIS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
    });
    const data = await res.json();
    return data?.result ?? null;
}

export function getAuthRateLimiter() {
    if (!_authRateLimiter) {
        _authRateLimiter = {
            limit: async (ip: string) => {
                const key = `ratelimit_auth:${ip}`;
                const count = Number(await redisCmd(["INCR", key]));
                if (count === 1) {
                    await redisCmd(["EXPIRE", key, 10]);
                }
                return { success: count <= 5 };
            },
        };
    }
    return _authRateLimiter;
}

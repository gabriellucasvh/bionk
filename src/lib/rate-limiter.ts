import { getRedis } from "@/lib/redis";

let _authRateLimiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;

export function getAuthRateLimiter() {
    if (!_authRateLimiter) {
        _authRateLimiter = {
            limit: async (ip: string) => {
                const key = `ratelimit_auth:${ip}`;
                const redis = getRedis();
                const count = Number(await redis.incr(key));
                if (count === 1) {
                    await redis.expire(key, 10);
                }
                return { success: count <= 5 };
            },
        };
    }
    return _authRateLimiter;
}

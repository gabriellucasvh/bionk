import { Redis } from "@upstash/redis"

let _redis: Redis | null = null

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!(url && token)) {
      throw new Error("Variáveis de ambiente do Upstash Redis não definidas")
    }
    _redis = new Redis({ url, token })
  }
  return _redis
}

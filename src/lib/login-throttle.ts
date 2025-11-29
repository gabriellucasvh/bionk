import { getRedis } from "@/lib/redis"
import crypto from "node:crypto"

// getRedis centralizado

function getKey(email: string, ip: string | null) {
  const normalizedEmail = email.trim().toLowerCase()
  const emailHash = crypto.createHash("sha256").update(normalizedEmail).digest("hex")
  const ipPart = ip || "unknown"
  return `login_fail:${emailHash}:${ipPart}`
}

type State = { count: number; blockedUntil: number | null; lastFail: number }

const thresholds = [3, 5, 8]
const durationsSeconds = [30, 300, 3600]

function getLevel(count: number) {
  if (count >= thresholds[2]) {
    return 2
  }
  if (count >= thresholds[1]) {
    return 1
  }
  if (count >= thresholds[0]) {
    return 0
  }
  return -1
}

export async function getBlockInfo(email: string, ip: string | null) {
  const key = getKey(email, ip)
  const redis = getRedis()
  const state = (await redis.get<State | null>(key)) || null
  const now = Date.now()
  const blocked = !!(state && state.blockedUntil && state.blockedUntil > now)
  const count = state?.count || 0
  const blockedUntil = state?.blockedUntil || null
  return { blocked, blockedUntil, count }
}

export async function registerFailure(email: string, ip: string | null) {
  const key = getKey(email, ip)
  const redis = getRedis()
  const now = Date.now()
  const state = (await redis.get<State | null>(key)) || { count: 0, blockedUntil: null, lastFail: 0 }
  const nextCount = state.count + 1
  const level = getLevel(nextCount)
  const blockedUntil = level >= 0 ? now + durationsSeconds[level] * 1000 : null
  const nextState: State = { count: nextCount, blockedUntil, lastFail: now }
  await redis.set(key, nextState, { ex: 24 * 60 * 60 })
  return { blockedUntil }
}

export async function clearFailures(email: string, ip: string | null) {
  const key = getKey(email, ip)
  const redis = getRedis()
  await redis.del(key)
}

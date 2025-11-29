import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

// getRedis centralizado em src/lib/redis

function monthBounds(date: Date) {
	const y = date.getUTCFullYear();
	const m = date.getUTCMonth();
	const start = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
	const next = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
	return { start, next };
}

function nameSuffix(d: Date) {
	const y = d.getUTCFullYear();
	const m = `${d.getUTCMonth() + 1}`.padStart(2, "0");
	return `${y}_${m}`;
}

async function toRegClass(name: string): Promise<boolean> {
	const res = await prisma.$queryRawUnsafe<any[]>(
		`SELECT to_regclass('${name}') AS exists`
	);
	return Array.isArray(res) && res[0] && res[0].exists !== null;
}

async function createLinkClickPartition(
	startISO: string,
	endISO: string,
	suffix: string
) {
	await prisma.$executeRawUnsafe(
		`CREATE TABLE "public"."LinkClick_p_${suffix}" PARTITION OF "public"."LinkClick" FOR VALUES FROM ('${startISO}') TO ('${endISO}')`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "LinkClick_p_${suffix}_linkId_createdAt_idx" ON "public"."LinkClick_p_${suffix}"("linkId","createdAt")`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "LinkClick_p_${suffix}_device_idx" ON "public"."LinkClick_p_${suffix}"("device")`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "LinkClick_p_${suffix}_referrer_idx" ON "public"."LinkClick_p_${suffix}"("referrer")`
	);
}

async function createProfileViewPartition(
	startISO: string,
	endISO: string,
	suffix: string
) {
	await prisma.$executeRawUnsafe(
		`CREATE TABLE "public"."ProfileView_p_${suffix}" PARTITION OF "public"."ProfileView" FOR VALUES FROM ('${startISO}') TO ('${endISO}')`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "ProfileView_p_${suffix}_userId_createdAt_idx" ON "public"."ProfileView_p_${suffix}"("userId","createdAt")`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "ProfileView_p_${suffix}_device_idx" ON "public"."ProfileView_p_${suffix}"("device")`
	);
	await prisma.$executeRawUnsafe(
		`CREATE INDEX "ProfileView_p_${suffix}_referrer_idx" ON "public"."ProfileView_p_${suffix}"("referrer")`
	);
}

export async function ensureMonthlyPartitions(): Promise<void> {
	const now = new Date();
	const { start, next } = monthBounds(now);
	const nextNext = monthBounds(next).next;

	const startISO = start.toISOString().slice(0, 10);
	const nextISO = next.toISOString().slice(0, 10);
	const nextNextISO = nextNext.toISOString().slice(0, 10);

	const currentSuffix = nameSuffix(start);
	const nextSuffix = nameSuffix(next);

	const redis = getRedis();
	const lockKey = `partitions:${currentSuffix}`;

	const existsLinkCurrent = await toRegClass(
		`public."LinkClick_p_${currentSuffix}"`
	);
	const existsViewCurrent = await toRegClass(
		`public."ProfileView_p_${currentSuffix}"`
	);
	const existsLinkNext = await toRegClass(`public."LinkClick_p_${nextSuffix}"`);
	const existsViewNext = await toRegClass(
		`public."ProfileView_p_${nextSuffix}"`
	);

	if (
		existsLinkCurrent &&
		existsViewCurrent &&
		existsLinkNext &&
		existsViewNext
	) {
		return;
	}

	const ttlSeconds = Math.max(
		60,
		Math.floor((next.getTime() - now.getTime()) / 1000)
	);
	const gotLock = await redis.set(lockKey, "1", { nx: true, ex: ttlSeconds });
	if (!gotLock) {
		return;
	}

	if (!existsLinkCurrent) {
		await createLinkClickPartition(startISO, nextISO, currentSuffix);
	}
	if (!existsViewCurrent) {
		await createProfileViewPartition(startISO, nextISO, currentSuffix);
	}
	if (!existsLinkNext) {
		await createLinkClickPartition(nextISO, nextNextISO, nextSuffix);
	}
	if (!existsViewNext) {
		await createProfileViewPartition(nextISO, nextNextISO, nextSuffix);
	}
}

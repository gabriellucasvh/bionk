import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

async function popBatchList(r: any, key: string, max: number) {
	const arr = await r.lrange(key, -max, -1);
	const items = Array.isArray(arr)
		? arr.filter((x) => typeof x === "string")
		: [];
	if (items.length > 0) {
		await r.ltrim(key, 0, -items.length - 1);
	}
	return items;
}

async function popBatchListPrefix(r: any, prefix: string, maxTotal: number) {
	const keys = await r.keys(`${prefix}:*`);
	const ks = Array.isArray(keys) ? keys : [];
	if (ks.length === 0) {
		return [] as string[];
	}
	const per = Math.max(1, Math.floor(maxTotal / ks.length));
	const ranges = ks.map((k) => r.lrange(k, -per, -1));
	const lists = await Promise.all(ranges);
	const trims = ks.map((k, i) => {
		const cnt = Array.isArray(lists[i]) ? lists[i].length : 0;
		return cnt > 0 ? r.ltrim(k, 0, -cnt - 1) : Promise.resolve(null);
	});
	await Promise.all(trims);
	const out: string[] = [];
	for (const lst of lists) {
		if (Array.isArray(lst)) {
			for (const s of lst) {
				if (typeof s === "string") {
					out.push(s);
				}
			}
		}
	}
	return out;
}

function authorized(req: Request) {
	const isProd = process.env.NODE_ENV === "production";
	const vercelHeader = (req.headers.get("x-vercel-cron") || "").trim();
	const token = (new URL(req.url).searchParams.get("token") || "").trim();
	const secret = process.env.CRON_SECRET || "";
	if (isProd) {
		if (vercelHeader.length > 0) {
			return true;
		}
		if (secret && token && token === secret) {
			return true;
		}
		return false;
	}
	if (secret && token && token === secret) {
		return true;
	}
	return false;
}

// uso de getRedis centralizado

export async function POST(req: Request) {
	if (!authorized(req)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const r = getRedis();
		const maxBatch = Math.max(1, Number(process.env.INGEST_MAX_BATCH || 1000));
		const [
			rawClicks,
			rawViews,
			rawLinks,
			rawTexts,
			rawVideos,
			rawImages,
			rawMusics,
			rawSections,
			rawEvents,
			rawQRCodes,
		] = await Promise.all([
			popBatchList(r, "events:clicks", maxBatch),
			popBatchList(r, "events:views", maxBatch),
			popBatchListPrefix(r, "ingest:links", maxBatch),
			popBatchListPrefix(r, "ingest:texts", maxBatch),
			popBatchListPrefix(r, "ingest:videos", maxBatch),
			popBatchListPrefix(r, "ingest:images", maxBatch),
			popBatchListPrefix(r, "ingest:musics", maxBatch),
			popBatchListPrefix(r, "ingest:sections", maxBatch),
			popBatchListPrefix(r, "ingest:events", maxBatch),
			popBatchListPrefix(r, "ingest:qrcodes", maxBatch),
		]);
		const clicks: any[] = [];
		const views: any[] = [];
		const links: any[] = [];
		const texts: any[] = [];
		const videos: any[] = [];
		const images: any[] = [];
		const musics: any[] = [];
		const sections: any[] = [];
		const events: any[] = [];
		const qrcodes: any[] = [];
		for (const raw of rawClicks) {
			if (!raw) {
				continue;
			}
			try {
				clicks.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawViews) {
			if (!raw) {
				continue;
			}
			try {
				views.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawLinks) {
			if (!raw) {
				continue;
			}
			try {
				links.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawTexts) {
			if (!raw) {
				continue;
			}
			try {
				texts.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawVideos) {
			if (!raw) {
				continue;
			}
			try {
				videos.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawImages) {
			if (!raw) {
				continue;
			}
			try {
				images.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawMusics) {
			if (!raw) {
				continue;
			}
			try {
				musics.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawSections) {
			if (!raw) {
				continue;
			}
			try {
				sections.push(JSON.parse(raw));
			} catch {}
		}
		for (const raw of rawEvents) {
			if (!raw) {
				continue;
			}
			try {
				events.push(JSON.parse(raw));
			} catch {}
		}

		for (const raw of rawQRCodes) {
			if (!raw) {
				continue;
			}
			try {
				qrcodes.push(JSON.parse(raw));
			} catch {}
		}

		let insertedClicks = 0;
		let insertedViews = 0;
		let insertedLinks = 0;
		let insertedTexts = 0;
		let insertedVideos = 0;
		let insertedImages = 0;
		let insertedMusics = 0;
		let insertedSections = 0;
		let insertedEvents = 0;
		let generatedQRCodes = 0;

		if (clicks.length > 0) {
			const data = clicks.map((c) => ({
				linkId: Number(c.linkId),
				device: typeof c.device === "string" ? c.device : null,
				userAgent: typeof c.userAgent === "string" ? c.userAgent : null,
				country: typeof c.country === "string" ? c.country : null,
				referrer: typeof c.referrer === "string" ? c.referrer : null,
				createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
			}));
			const res = await prisma.linkClick.createMany({ data });
			insertedClicks = res.count;
		}

		if (views.length > 0) {
			const data = views.map((v) => ({
				userId: String(v.userId),
				device: typeof v.device === "string" ? v.device : null,
				userAgent: typeof v.userAgent === "string" ? v.userAgent : null,
				country: typeof v.country === "string" ? v.country : null,
				referrer: typeof v.referrer === "string" ? v.referrer : null,
				createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
			}));
			const res = await prisma.profileView.createMany({ data });
			insertedViews = res.count;
		}

		if (links.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of links) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const linkTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				linkTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: String(item.title),
							url: String(item.url),
							order: base - 1 - idx,
							active: true,
							sectionId: item.sectionId ? Number(item.sectionId) : null,
							badge: item.badge ? String(item.badge) : null,
							password: item.password ? String(item.password) : null,
							expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
							deleteOnClicks: item.deleteOnClicks
								? Number(item.deleteOnClicks)
								: null,
							launchesAt: item.launchesAt ? new Date(item.launchesAt) : null,
							shareAllowed: !!item.shareAllowed,
						}));
						return prisma.link.createMany({ data });
					})()
				);
			}
			const linkResults = await Promise.all(linkTxs);
			for (const res of linkResults) {
				insertedLinks += (res as any)?.count || 0;
			}
		}

		if (texts.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of texts) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const textTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				textTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: String(item.title),
							description: String(item.description || ""),
							position: String(item.position),
							hasBackground: !!item.hasBackground,
							isCompact: !!item.isCompact,
							active: true,
							order: base - 1 - idx,
							sectionId: item.sectionId ? Number(item.sectionId) : null,
						}));
						return prisma.text.createMany({ data });
					})()
				);
			}
			const textResults = await Promise.all(textTxs);
			for (const res of textResults) {
				insertedTexts += (res as any)?.count || 0;
			}
		}

		if (videos.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of videos) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const videoTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				videoTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: item.title ? String(item.title) : null,
							description: item.description ? String(item.description) : null,
							type: String(item.type),
							url: String(item.url),
							thumbnailUrl: item.thumbnailUrl
								? String(item.thumbnailUrl)
								: null,
							active: true,
							order: base - 1 - idx,
							sectionId: item.sectionId ? Number(item.sectionId) : null,
						}));
						return prisma.video.createMany({ data });
					})()
				);
			}
			const videoResults = await Promise.all(videoTxs);
			for (const res of videoResults) {
				insertedVideos += (res as any)?.count || 0;
			}
		}

		if (images.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of images) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const imageTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				imageTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: item.title ? String(item.title) : null,
							description: item.description ? String(item.description) : null,
							layout: String(item.layout),
							ratio: String(item.ratio),
							sizePercent: Number(item.sizePercent),
							items: Array.isArray(item.items) ? item.items : [],
							active: true,
							order: base - 1 - idx,
							sectionId: item.sectionId ? Number(item.sectionId) : null,
						}));
						return prisma.image.createMany({ data });
					})()
				);
			}
			const imageResults = await Promise.all(imageTxs);
			for (const res of imageResults) {
				insertedImages += (res as any)?.count || 0;
			}
		}

		if (musics.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of musics) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const musicTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				musicTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: item.title ? String(item.title) : "",
							url: String(item.url),
							usePreview: !!item.usePreview,
							active: true,
							order: base - 1 - idx,
							sectionId: item.sectionId ? Number(item.sectionId) : null,
							authorName: item.authorName ? String(item.authorName) : null,
							thumbnailUrl: item.thumbnailUrl
								? String(item.thumbnailUrl)
								: null,
						}));
						return prisma.music.createMany({ data });
					})()
				);
			}
			const musicResults = await Promise.all(musicTxs);
			for (const res of musicResults) {
				insertedMusics += (res as any)?.count || 0;
			}
		}

		if (sections.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of sections) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const sectionTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				sectionTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => ({
							userId: uid,
							title: String(item.title),
							order: base - 1 - idx,
						}));
						return prisma.section.createMany({ data });
					})()
				);
			}
			const sectionResults = await Promise.all(sectionTxs);
			for (const res of sectionResults) {
				insertedSections += (res as any)?.count || 0;
			}
		}

		if (events.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of events) {
				const uid = String(item.userId);
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const eventTxs: Promise<any>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				eventTxs.push(
					(async () => {
						const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
							prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.section.aggregate({ where: { userId: uid }, _min: { order: true } }),
							prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
						]);
						const candidates = [
							minL._min.order,
							minT._min.order,
							minV._min.order,
							minI._min.order,
							minM._min.order,
							minS._min.order,
							minE._min.order,
						].filter((n) => typeof n === "number") as number[];
						const base = candidates.length > 0 ? Math.min(...candidates) : 0;
						const data = arr.map((item, idx) => {
							const vis =
								item.countdownLinkVisibility === "after" ||
								item.countdownLinkVisibility === "during"
									? item.countdownLinkVisibility
									: null;
							return {
								userId: uid,
								title: String(item.title),
								location: item.location ? String(item.location) : "",
								eventDate: item.eventDate
									? new Date(item.eventDate)
									: new Date(),
								eventTime: String(item.eventTime),
								descriptionShort: item.descriptionShort
									? String(item.descriptionShort)
									: null,
								externalLink: item.externalLink
									? String(item.externalLink)
									: "",
								coverImageUrl: item.coverImageUrl
									? String(item.coverImageUrl)
									: null,
								active: true,
								order: base - 1 - idx,
								type: item.type ? String(item.type) : undefined,
								targetMonth:
									typeof item.targetMonth === "number"
										? item.targetMonth
										: null,
								targetDay:
									typeof item.targetDay === "number" ? item.targetDay : null,
								countdownLinkUrl: item.countdownLinkUrl
									? String(item.countdownLinkUrl)
									: null,
								countdownLinkVisibility: vis as any,
							};
						});
						return prisma.event.createMany({ data });
					})()
				);
			}
			const eventResults = await Promise.all(eventTxs);
			for (const res of eventResults) {
				insertedEvents += (res as any)?.count || 0;
			}
		}

		if (qrcodes.length > 0) {
			const byUser = new Map<string, any[]>();
			for (const item of qrcodes) {
				const uid = String(item.userId || "");
				const arr = byUser.get(uid) || [];
				arr.push(item);
				byUser.set(uid, arr);
			}
			const jobs: Promise<any>[] = [];
			for (const [_uid, arr] of byUser.entries()) {
				jobs.push(
					(async () => {
						const mod = await import("@/lib/qrcode");
						for (const item of arr) {
							try {
								const fmt = item.format === "svg" ? "svg" : "png";
								const size = Math.max(128, Math.min(2048, Number(item.size || 512)));
								await mod.buildAndCacheQr(String(item.rawUrl), { format: fmt, size, userId: String(item.userId || "") });
								generatedQRCodes += 1;
							} catch {}
						}
					})()
				);
			}
			await Promise.all(jobs);
		}

		const response = NextResponse.json({
			clicks: insertedClicks,
			views: insertedViews,
			links: insertedLinks,
			texts: insertedTexts,
			videos: insertedVideos,
			images: insertedImages,
			musics: insertedMusics,
			sections: insertedSections,
			events: insertedEvents,
			qrcodes: generatedQRCodes,
			empty:
				insertedClicks === 0 &&
				insertedViews === 0 &&
				insertedLinks === 0 &&
				insertedTexts === 0 &&
				insertedVideos === 0 &&
				insertedImages === 0 &&
				insertedMusics === 0 &&
				insertedSections === 0 &&
				insertedEvents === 0 &&
				generatedQRCodes === 0,
		});
		if (
			insertedClicks === 0 &&
			insertedViews === 0 &&
			insertedLinks === 0 &&
			insertedTexts === 0 &&
			insertedVideos === 0 &&
			insertedImages === 0 &&
			insertedMusics === 0 &&
			insertedSections === 0 &&
			insertedEvents === 0 &&
			generatedQRCodes === 0
		) {
			response.headers.set("Retry-After", "30");
		}
		response.headers.set("Cache-Control", "no-store");
		return response;
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

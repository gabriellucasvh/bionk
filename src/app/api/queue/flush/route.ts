import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

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
		const maxBatch = 1000;
		const clicksLenRaw = await r.llen("events:clicks");
		const viewsLenRaw = await r.llen("events:views");
		const linksLenRaw = await r.llen("ingest:links");
		const textsLenRaw = await r.llen("ingest:texts");
		const videosLenRaw = await r.llen("ingest:videos");
		const imagesLenRaw = await r.llen("ingest:images");
		const musicsLenRaw = await r.llen("ingest:musics");
		const sectionsLenRaw = await r.llen("ingest:sections");
		const eventsLenRaw = await r.llen("ingest:events");
		const clicksLen = Number(clicksLenRaw || 0);
		const viewsLen = Number(viewsLenRaw || 0);
		const linksLen = Number(linksLenRaw || 0);
		const textsLen = Number(textsLenRaw || 0);
		const videosLen = Number(videosLenRaw || 0);
		const imagesLen = Number(imagesLenRaw || 0);
		const musicsLen = Number(musicsLenRaw || 0);
		const sectionsLen = Number(sectionsLenRaw || 0);
		const eventsLen = Number(eventsLenRaw || 0);
		const batchClicks = Math.min(maxBatch, Math.max(0, clicksLen));
		const batchViews = Math.min(maxBatch, Math.max(0, viewsLen));
		const batchLinks = Math.min(maxBatch, Math.max(0, linksLen));
		const batchTexts = Math.min(maxBatch, Math.max(0, textsLen));
		const batchVideos = Math.min(maxBatch, Math.max(0, videosLen));
		const batchImages = Math.min(maxBatch, Math.max(0, imagesLen));
		const batchMusics = Math.min(maxBatch, Math.max(0, musicsLen));
		const batchSections = Math.min(maxBatch, Math.max(0, sectionsLen));
		const batchEvents = Math.min(maxBatch, Math.max(0, eventsLen));
		const clicksPops = Array.from({ length: batchClicks }, () =>
			r.rpop<string | null>("events:clicks")
		);
		const viewsPops = Array.from({ length: batchViews }, () =>
			r.rpop<string | null>("events:views")
		);
		const linksPops = Array.from({ length: batchLinks }, () =>
			r.rpop<string | null>("ingest:links")
		);
		const textsPops = Array.from({ length: batchTexts }, () =>
			r.rpop<string | null>("ingest:texts")
		);
		const videosPops = Array.from({ length: batchVideos }, () =>
			r.rpop<string | null>("ingest:videos")
		);
		const imagesPops = Array.from({ length: batchImages }, () =>
			r.rpop<string | null>("ingest:images")
		);
		const musicsPops = Array.from({ length: batchMusics }, () =>
			r.rpop<string | null>("ingest:musics")
		);
		const sectionsPops = Array.from({ length: batchSections }, () =>
			r.rpop<string | null>("ingest:sections")
		);
		const eventsPops = Array.from({ length: batchEvents }, () =>
			r.rpop<string | null>("ingest:events")
		);
		const rawClicks = await Promise.all(clicksPops);
		const rawViews = await Promise.all(viewsPops);
		const rawLinks = await Promise.all(linksPops);
		const rawTexts = await Promise.all(textsPops);
		const rawVideos = await Promise.all(videosPops);
		const rawImages = await Promise.all(imagesPops);
		const rawMusics = await Promise.all(musicsPops);
		const rawSections = await Promise.all(sectionsPops);
		const rawEvents = await Promise.all(eventsPops);
		const clicks: any[] = [];
		const views: any[] = [];
		const links: any[] = [];
		const texts: any[] = [];
		const videos: any[] = [];
		const images: any[] = [];
		const musics: any[] = [];
		const sections: any[] = [];
		const events: any[] = [];
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

		let insertedClicks = 0;
		let insertedViews = 0;
		let insertedLinks = 0;
		let insertedTexts = 0;
		let insertedVideos = 0;
		let insertedImages = 0;
		let insertedMusics = 0;
		let insertedSections = 0;
		let insertedEvents = 0;

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
			const linkTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: String(item.title),
					url: String(item.url),
					order: idx,
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
				linkTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.link.createMany({ data }),
					])
				);
			}
			const linkResults = await Promise.all(linkTxs);
			for (const trx of linkResults) {
				const last = trx.at(-1) as any;
				insertedLinks += last?.count || 0;
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
			const textTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: String(item.title),
					description: String(item.description || ""),
					position: String(item.position),
					hasBackground: !!item.hasBackground,
					isCompact: !!item.isCompact,
					active: true,
					order: idx,
					sectionId: item.sectionId ? Number(item.sectionId) : null,
				}));
				textTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.createMany({ data }),
					])
				);
			}
			const textResults = await Promise.all(textTxs);
			for (const trx of textResults) {
				const last = trx.at(-1) as any;
				insertedTexts += last?.count || 0;
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
			const videoTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: item.title ? String(item.title) : null,
					description: item.description ? String(item.description) : null,
					type: String(item.type),
					url: String(item.url),
					thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : null,
					active: true,
					order: idx,
					sectionId: item.sectionId ? Number(item.sectionId) : null,
				}));
				videoTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.createMany({ data }),
					])
				);
			}
			const videoResults = await Promise.all(videoTxs);
			for (const trx of videoResults) {
				const last = trx.at(-1) as any;
				insertedVideos += last?.count || 0;
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
			const imageTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: item.title ? String(item.title) : null,
					description: item.description ? String(item.description) : null,
					layout: String(item.layout),
					ratio: String(item.ratio),
					sizePercent: Number(item.sizePercent),
					items: Array.isArray(item.items) ? item.items : [],
					active: true,
					order: idx,
					sectionId: item.sectionId ? Number(item.sectionId) : null,
				}));
				imageTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.createMany({ data }),
					])
				);
			}
			const imageResults = await Promise.all(imageTxs);
			for (const trx of imageResults) {
				const last = trx.at(-1) as any;
				insertedImages += last?.count || 0;
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
			const musicTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: item.title ? String(item.title) : "",
					url: String(item.url),
					usePreview: !!item.usePreview,
					active: true,
					order: idx,
					sectionId: item.sectionId ? Number(item.sectionId) : null,
					authorName: item.authorName ? String(item.authorName) : null,
					thumbnailUrl: item.thumbnailUrl ? String(item.thumbnailUrl) : null,
				}));
				musicTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.createMany({ data }),
					])
				);
			}
			const musicResults = await Promise.all(musicTxs);
			for (const trx of musicResults) {
				const last = trx.at(-1) as any;
				insertedMusics += last?.count || 0;
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
			const sectionTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: String(item.title),
					order: idx,
				}));
				sectionTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.createMany({ data }),
					])
				);
			}
			const sectionResults = await Promise.all(sectionTxs);
			for (const trx of sectionResults) {
				const last = trx.at(-1) as any;
				insertedSections += last?.count || 0;
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
			const eventTxs: Promise<any[]>[] = [];
			for (const [uid, arr] of byUser.entries()) {
				const n = arr.length;
				const data = arr.map((item, idx) => ({
					userId: uid,
					title: String(item.title),
					location: item.location ? String(item.location) : "",
					eventDate: item.eventDate ? new Date(item.eventDate) : new Date(),
					eventTime: String(item.eventTime),
					descriptionShort: item.descriptionShort
						? String(item.descriptionShort)
						: null,
					externalLink: item.externalLink ? String(item.externalLink) : "",
					coverImageUrl: item.coverImageUrl ? String(item.coverImageUrl) : null,
					active: true,
					order: idx,
					type: item.type ? String(item.type) : undefined,
					targetMonth:
						typeof item.targetMonth === "number" ? item.targetMonth : null,
					targetDay: typeof item.targetDay === "number" ? item.targetDay : null,
					countdownLinkUrl: item.countdownLinkUrl
						? String(item.countdownLinkUrl)
						: null,
					countdownLinkVisibility:
						item.countdownLinkVisibility === "after" ||
						item.countdownLinkVisibility === "during"
							? item.countdownLinkVisibility
							: null,
				}));
				eventTxs.push(
					prisma.$transaction([
						prisma.link.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.text.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.section.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.video.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.image.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.music.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.updateMany({
							where: { userId: uid },
							data: { order: { increment: n } },
						}),
						prisma.event.createMany({ data }),
					])
				);
			}
			const eventResults = await Promise.all(eventTxs);
			for (const trx of eventResults) {
				const last = trx.at(-1) as any;
				insertedEvents += last?.count || 0;
			}
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
			empty:
				insertedClicks === 0 &&
				insertedViews === 0 &&
				insertedLinks === 0 &&
				insertedTexts === 0 &&
				insertedVideos === 0 &&
				insertedImages === 0 &&
				insertedMusics === 0 &&
				insertedSections === 0 &&
				insertedEvents === 0,
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
			insertedEvents === 0
		) {
			response.headers.set("Retry-After", "30");
		}
		response.headers.set("Cache-Control", "no-store");
		return response;
	} catch {
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

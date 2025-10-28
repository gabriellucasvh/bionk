import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Normaliza uma data para string "YYYY-MM-DD" em UTC
function formatDayISO(date: Date): string {
	return new Date(date).toISOString().split("T")[0];
}

// Função para detectar sistema operacional baseado no user-agent
function detectOS(userAgent: string): string {
	if (!userAgent) {
		return "unknown";
	}

	const ua = userAgent.toLowerCase();

	// iOS (iPhone, iPad, iPod)
	if (
		ua.includes("iphone") ||
		ua.includes("ipad") ||
		ua.includes("ipod") ||
		(ua.includes("mac os x") && ua.includes("mobile"))
	) {
		return "ios";
	}

	// Android
	if (ua.includes("android")) {
		return "android";
	}

	// Windows
	if (
		ua.includes("windows nt") ||
		ua.includes("win32") ||
		ua.includes("win64") ||
		ua.includes("windows")
	) {
		return "windows";
	}

	// macOS (desktop)
	if (ua.includes("macintosh") || ua.includes("mac os x")) {
		return "macos";
	}

	// Linux
	if (ua.includes("linux") || ua.includes("x11")) {
		return "linux";
	}

	return "unknown";
}

export async function GET(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}
	const userId = session.user.id;

	// Ler parâmetros de consulta
	const url = new URL(request.url);
	const rangeParam = (url.searchParams.get("range") || "30d").toLowerCase();
	const startParam = url.searchParams.get("start"); // ISO date string opcional para ultra
	const endParam = url.searchParams.get("end");
	const pageParam = url.searchParams.get("page");
	const limitParam = url.searchParams.get("limit");
	const rollupsOnlyParam = url.searchParams.get("rollupsOnly");
	const rollupsOnly = rollupsOnlyParam === "true" || rollupsOnlyParam === "1";

	// Validar plano do usuário e quais ranges são permitidos
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			createdAt: true,
			subscriptionPlan: true,
			subscriptionStatus: true,
			subscriptionEndDate: true,
		},
	});
	if (!user) {
		return NextResponse.json(
			{ error: "Usuário não encontrado" },
			{ status: 404 }
		);
	}

	const now = new Date();
	const isPaidPlan = ["basic", "pro", "ultra"].includes(
		user.subscriptionPlan || ""
	);
	const subscriptionActive =
		isPaidPlan &&
		user.subscriptionStatus === "active" &&
		(!user.subscriptionEndDate || user.subscriptionEndDate >= now);

	const effectivePlan = subscriptionActive
		? (user.subscriptionPlan as "basic" | "pro" | "ultra")
		: "free";
	const allowedByPlan: Record<string, string[]> = {
		free: ["7d", "30d"],
		basic: ["7d", "30d", "90d"],
		pro: ["7d", "30d", "90d", "365d"],
		ultra: ["7d", "30d", "90d", "365d", "tudo"],
	};
	if (!allowedByPlan[effectivePlan].includes(rangeParam)) {
		return NextResponse.json(
			{ error: `Intervalo não permitido para seu plano (${effectivePlan})` },
			{ status: 403 }
		);
	}

	// Calcular intervalo de datas (startDate, endDate) baseado no range
	const endDate = endParam ? new Date(endParam) : now;
	let startDate: Date;
	switch (rangeParam) {
		case "7d": {
			startDate = new Date(endDate);
			startDate.setDate(endDate.getDate() - 7);
			break;
		}
		case "30d": {
			startDate = new Date(endDate);
			startDate.setDate(endDate.getDate() - 30);
			break;
		}
		case "90d": {
			startDate = new Date(endDate);
			startDate.setDate(endDate.getDate() - 90);
			break;
		}
		case "365d": {
			startDate = new Date(endDate);
			startDate.setDate(endDate.getDate() - 365);
			break;
		}
		case "tudo": {
			if (startParam && endParam) {
				startDate = new Date(startParam);
			} else {
				// Vida toda: da criação da conta até agora
				startDate = new Date(user.createdAt);
			}
			break;
		}
		default: {
			// fallback seguro
			startDate = new Date(endDate);
			startDate.setDate(endDate.getDate() - 30);
		}
	}

	// Sanitização: startDate não pode ser no futuro nem maior que endDate
	if (startDate > endDate) {
		startDate = new Date(endDate);
	}

	// Buscar todos os links do usuário
	const links = await prisma.link.findMany({
		where: { userId },
		select: { id: true, title: true, url: true },
	});

	const linkIds = links.map((link) => link.id);

	// Buscar total de cliques e visualizações paralelamente
	const [totalClicks, totalProfileViews] = await Promise.all([
		prisma.linkClick.count({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: startDate, lte: endDate },
			},
		}),
		prisma.profileView.count({
			where: {
				userId,
				createdAt: { gte: startDate, lte: endDate },
			},
		}),
	]);

	const performanceRate =
		totalProfileViews > 0 ? (totalClicks / totalProfileViews) * 100 : 0;

	// Para período "tudo": usar agregações SQL no banco para baixo custo
	if (rangeParam === "tudo") {
		// Agrupamento por dia usando date_trunc diretamente no Postgres
		const clicksByDayRaw = await prisma.$queryRaw<
			Array<{ day: Date; clicks: number }>
		>`
            SELECT date_trunc('day', lc."createdAt")::date AS day, COUNT(*)::int AS clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE l."userId" = ${userId} AND lc."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY day
            ORDER BY day ASC;
        `;

		const viewsByDayRaw = await prisma.$queryRaw<
			Array<{ day: Date; views: number }>
		>`
            SELECT date_trunc('day', pv."createdAt")::date AS day, COUNT(*)::int AS views
            FROM "public"."ProfileView" pv
            WHERE pv."userId" = ${userId} AND pv."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY day
            ORDER BY day ASC;
        `;

		const dailyMap = new Map<string, { clicks: number; views: number }>();
		const daysDiff = Math.max(
			0,
			Math.ceil(
				(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			)
		);
		for (let i = 0; i <= daysDiff; i++) {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			dailyMap.set(formatDayISO(date), { clicks: 0, views: 0 });
		}

		for (const row of clicksByDayRaw) {
			const key = formatDayISO(row.day);
			const ex = dailyMap.get(key) || { clicks: 0, views: 0 };
			ex.clicks = row.clicks || 0;
			dailyMap.set(key, ex);
		}

		for (const row of viewsByDayRaw) {
			const key = formatDayISO(row.day);
			const ex = dailyMap.get(key) || { clicks: 0, views: 0 };
			ex.views = row.views || 0;
			dailyMap.set(key, ex);
		}

		const chartData = Array.from(dailyMap.entries()).map(([day, data]) => ({
			day,
			clicks: data.clicks,
			views: data.views,
		}));

		// Início do mês do endDate em UTC (para não duplicar mês corrente)
		const currentMonthStart = new Date(
			Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1, 0, 0, 0, 0)
		);

		// Para rollupsOnly, usar série mensal em vez de diária para reduzir custo
		let monthlyChartData:
			| { month: string; clicks: number; views: number }[]
			| null = null;
		if (rollupsOnly) {
			// Buscar rollups mensais para série temporal
			const monthlyRollups = await prisma.monthlyUserAnalytics.findMany({
				where: { userId, monthStart: { lt: currentMonthStart } },
				select: { monthStart: true, clicks: true, views: true },
				orderBy: { monthStart: "asc" },
			});

			function formatMonth(date: Date) {
				return new Date(date).toISOString().substring(0, 7); // YYYY-MM
			}

			monthlyChartData = monthlyRollups.map((rollup) => ({
				month: formatMonth(rollup.monthStart),
				clicks: rollup.clicks || 0,
				views: rollup.views || 0,
			}));
		}

		// Somar rollups diretamente para "tudo" com tratamento de mês parcial
		const page = Math.max(1, Number(pageParam) || 1);
		const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));

		// Totais usando rollups de meses completos
		const rollupTotals = await prisma.monthlyUserAnalytics.aggregate({
			_sum: { clicks: true, views: true },
			where: { userId, monthStart: { lt: currentMonthStart } },
		});
		let totalClicksAll = rollupTotals._sum.clicks || 0;
		let totalProfileViewsAll = rollupTotals._sum.views || 0;
		if (!rollupsOnly) {
			const currentMonthClicks = await prisma.linkClick.count({
				where: {
					linkId: { in: linkIds },
					createdAt: { gte: currentMonthStart, lte: endDate },
				},
			});
			const currentMonthViews = await prisma.profileView.count({
				where: { userId, createdAt: { gte: currentMonthStart, lte: endDate } },
			});
			totalClicksAll += currentMonthClicks;
			totalProfileViewsAll += currentMonthViews;
		}
		const performanceRateAll =
			totalProfileViewsAll > 0
				? (totalClicksAll / totalProfileViewsAll) * 100
				: 0;

		// Ranking all-time de links: rollups de meses completos (+ mês corrente bruto, se não for apenas rollups)
		const rollupLinkSums = await prisma.monthlyLinkAnalytics.groupBy({
			by: ["linkId"],
			_sum: { clicks: true },
			where: { userId, monthStart: { lt: currentMonthStart } },
		});
		const combinedClicks = new Map<number, number>();
		for (const r of rollupLinkSums) {
			combinedClicks.set(r.linkId as number, r._sum.clicks || 0);
		}
		if (!rollupsOnly) {
			const currentMonthClicksPerLink = await prisma.linkClick.groupBy({
				by: ["linkId"],
				_count: true,
				where: {
					linkId: { in: linkIds },
					createdAt: { gte: currentMonthStart, lte: endDate },
				},
			});
			for (const r of currentMonthClicksPerLink) {
				combinedClicks.set(
					r.linkId as number,
					(combinedClicks.get(r.linkId as number) || 0) + (r._count || 0)
				);
			}
		}

		const topLinksAll = links
			.map((link) => ({
				id: link.id,
				title: link.title,
				url: link.url,
				clicks: combinedClicks.get(link.id) || 0,
			}))
			.sort((a, b) => b.clicks - a.clicks);

		const topLinks = topLinksAll.slice((page - 1) * limit, page * limit);
		const topLinksAllCount = topLinksAll.length;

		// Dispositivos: agregação SQL
		const clicksByDeviceRaw = await prisma.$queryRaw<
			Array<{ device: string | null; clicks: number }>
		>`
            SELECT COALESCE(lc.device, 'unknown') AS device, COUNT(*)::int AS clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE l."userId" = ${userId} AND lc."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY device;
        `;
		const viewsByDeviceRaw = await prisma.$queryRaw<
			Array<{ device: string | null; views: number }>
		>`
            SELECT COALESCE(pv.device, 'unknown') AS device, COUNT(*)::int AS views
            FROM "public"."ProfileView" pv
            WHERE pv."userId" = ${userId} AND pv."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY device;
        `;

		const deviceData = new Map<string, { clicks: number; views: number }>();
		const defaultDevices = ["mobile", "desktop", "tablet", "unknown"] as const;
		for (const d of defaultDevices) {
			deviceData.set(d, { clicks: 0, views: 0 });
		}
		for (const r of clicksByDeviceRaw) {
			const key = r.device || "unknown";
			const ex = deviceData.get(key) || { clicks: 0, views: 0 };
			ex.clicks = r.clicks || 0;
			deviceData.set(key, ex);
		}
		for (const r of viewsByDeviceRaw) {
			const key = r.device || "unknown";
			const ex = deviceData.get(key) || { clicks: 0, views: 0 };
			ex.views = r.views || 0;
			deviceData.set(key, ex);
		}
		const deviceAnalytics = Array.from(deviceData.entries())
			.map(([device, data]) => ({
				device: device === "unknown" ? "unknown" : device,
				clicks: data.clicks || 0,
				views: data.views || 0,
				totalInteractions: (data.clicks || 0) + (data.views || 0),
			}))
			.filter((i) => i.totalInteractions > 0)
			.sort((a, b) => b.totalInteractions - a.totalInteractions);

		// OS via CASE em SQL (aproximação equivalente ao detectOS)
		const clicksByOSRaw = await prisma.$queryRaw<
			Array<{ os: string; clicks: number }>
		>`
            SELECT CASE
                     WHEN lc."userAgent" IS NULL THEN 'unknown'
                     WHEN lower(lc."userAgent") LIKE '%iphone%' OR lower(lc."userAgent") LIKE '%ipad%' OR lower(lc."userAgent") LIKE '%ipod%' OR (lower(lc."userAgent") LIKE '%mac os x%' AND lower(lc."userAgent") LIKE '%mobile%') THEN 'ios'
                     WHEN lower(lc."userAgent") LIKE '%android%' THEN 'android'
                     WHEN lower(lc."userAgent") LIKE '%windows nt%' OR lower(lc."userAgent") LIKE '%win32%' OR lower(lc."userAgent") LIKE '%win64%' OR lower(lc."userAgent") LIKE '%windows%' THEN 'windows'
                     WHEN lower(lc."userAgent") LIKE '%macintosh%' OR lower(lc."userAgent") LIKE '%mac os x%' THEN 'macos'
                     WHEN lower(lc."userAgent") LIKE '%linux%' OR lower(lc."userAgent") LIKE '%x11%' THEN 'linux'
                     ELSE 'unknown'
                   END AS os,
                   COUNT(*)::int AS clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE l."userId" = ${userId} AND lc."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY os;
        `;
		const viewsByOSRaw = await prisma.$queryRaw<
			Array<{ os: string; views: number }>
		>`
            SELECT CASE
                     WHEN pv."userAgent" IS NULL THEN 'unknown'
                     WHEN lower(pv."userAgent") LIKE '%iphone%' OR lower(pv."userAgent") LIKE '%ipad%' OR lower(pv."userAgent") LIKE '%ipod%' OR (lower(pv."userAgent") LIKE '%mac os x%' AND lower(pv."userAgent") LIKE '%mobile%') THEN 'ios'
                     WHEN lower(pv."userAgent") LIKE '%android%' THEN 'android'
                     WHEN lower(pv."userAgent") LIKE '%windows nt%' OR lower(pv."userAgent") LIKE '%win32%' OR lower(pv."userAgent") LIKE '%win64%' OR lower(pv."userAgent") LIKE '%windows%' THEN 'windows'
                     WHEN lower(pv."userAgent") LIKE '%macintosh%' OR lower(pv."userAgent") LIKE '%mac os x%' THEN 'macos'
                     WHEN lower(pv."userAgent") LIKE '%linux%' OR lower(pv."userAgent") LIKE '%x11%' THEN 'linux'
                     ELSE 'unknown'
                   END AS os,
                   COUNT(*)::int AS views
            FROM "public"."ProfileView" pv
            WHERE pv."userId" = ${userId} AND pv."createdAt" BETWEEN ${startDate} AND ${endDate}
            GROUP BY os;
        `;

		const osMap = new Map<string, { clicks: number; views: number }>();
		const defaultOS = [
			"ios",
			"android",
			"windows",
			"macos",
			"linux",
			"unknown",
		] as const;
		for (const os of defaultOS) {
			osMap.set(os, { clicks: 0, views: 0 });
		}
		for (const r of clicksByOSRaw) {
			const ex = osMap.get(r.os) || { clicks: 0, views: 0 };
			ex.clicks = r.clicks || 0;
			osMap.set(r.os, ex);
		}
		for (const r of viewsByOSRaw) {
			const ex = osMap.get(r.os) || { clicks: 0, views: 0 };
			ex.views = r.views || 0;
			osMap.set(r.os, ex);
		}
		const osAnalytics = Array.from(osMap.entries())
			.map(([os, data]) => ({
				os,
				clicks: data.clicks || 0,
				views: data.views || 0,
				totalInteractions: (data.clicks || 0) + (data.views || 0),
			}))
			.filter((i) => i.totalInteractions > 0)
			.sort((a, b) => b.totalInteractions - a.totalInteractions);

		// Países
		const clicksByCountryRaw = await prisma.$queryRaw<
			Array<{ country: string | null; clicks: number }>
		>`
            SELECT lc.country AS country, COUNT(*)::int AS clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE l."userId" = ${userId} AND lc."createdAt" BETWEEN ${startDate} AND ${endDate} AND lc.country IS NOT NULL
            GROUP BY country;
        `;
		const viewsByCountryRaw = await prisma.$queryRaw<
			Array<{ country: string | null; views: number }>
		>`
            SELECT pv.country AS country, COUNT(*)::int AS views
            FROM "public"."ProfileView" pv
            WHERE pv."userId" = ${userId} AND pv."createdAt" BETWEEN ${startDate} AND ${endDate} AND pv.country IS NOT NULL
            GROUP BY country;
        `;
		const countryMap = new Map<string, { clicks: number; views: number }>();
		for (const r of clicksByCountryRaw) {
			if (r.country) {
				const ex = countryMap.get(r.country) || { clicks: 0, views: 0 };
				ex.clicks = r.clicks || 0;
				countryMap.set(r.country, ex);
			}
		}
		for (const r of viewsByCountryRaw) {
			if (r.country) {
				const ex = countryMap.get(r.country) || { clicks: 0, views: 0 };
				ex.views = r.views || 0;
				countryMap.set(r.country, ex);
			}
		}
		const countryAnalytics = Array.from(countryMap.entries())
			.map(([country, data]) => ({
				country,
				clicks: data.clicks || 0,
				views: data.views || 0,
				totalInteractions: (data.clicks || 0) + (data.views || 0),
			}))
			.filter((i) => i.totalInteractions > 0)
			.sort((a, b) => b.totalInteractions - a.totalInteractions);

		// Referrers
		const clicksByReferrerRaw = await prisma.$queryRaw<
			Array<{ referrer: string | null; clicks: number }>
		>`
            SELECT lc.referrer AS referrer, COUNT(*)::int AS clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE l."userId" = ${userId} AND lc."createdAt" BETWEEN ${startDate} AND ${endDate} AND lc.referrer IS NOT NULL
            GROUP BY referrer;
        `;
		const viewsByReferrerRaw = await prisma.$queryRaw<
			Array<{ referrer: string | null; views: number }>
		>`
            SELECT pv.referrer AS referrer, COUNT(*)::int AS views
            FROM "public"."ProfileView" pv
            WHERE pv."userId" = ${userId} AND pv."createdAt" BETWEEN ${startDate} AND ${endDate} AND pv.referrer IS NOT NULL
            GROUP BY referrer;
        `;
		const referrerMap = new Map<string, { clicks: number; views: number }>();
		for (const r of clicksByReferrerRaw) {
			if (r.referrer) {
				const ex = referrerMap.get(r.referrer) || { clicks: 0, views: 0 };
				ex.clicks = r.clicks || 0;
				referrerMap.set(r.referrer, ex);
			}
		}
		for (const r of viewsByReferrerRaw) {
			if (r.referrer) {
				const ex = referrerMap.get(r.referrer) || { clicks: 0, views: 0 };
				ex.views = r.views || 0;
				referrerMap.set(r.referrer, ex);
			}
		}
		const referrerAnalytics = Array.from(referrerMap.entries())
			.map(([referrer, data]) => ({
				referrer,
				clicks: data.clicks || 0,
				views: data.views || 0,
				totalInteractions: (data.clicks || 0) + (data.views || 0),
			}))
			.filter((i) => i.totalInteractions > 0)
			.sort((a, b) => b.totalInteractions - a.totalInteractions);

		const responseBody = {
			totalProfileViews: totalProfileViewsAll,
			totalClicks: totalClicksAll,
			performanceRate: performanceRateAll.toFixed(1),
			chartData: rollupsOnly ? monthlyChartData : chartData,
			topLinks,
			deviceAnalytics,
			osAnalytics,
			countryAnalytics,
			referrerAnalytics,
			meta: {
				range: rangeParam,
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
				page,
				limit,
				totalTopLinks: topLinksAllCount,
				rollupsOnly,
				chartType: rollupsOnly ? "monthly" : "daily",
			},
		};

		const response = NextResponse.json(responseBody);
		response.headers.set("Cache-Control", "private, max-age=120");
		return response;
	}

	// Agrupamento por dia do período selecionado
	const clicksByDay = await prisma.linkClick.groupBy({
		by: ["createdAt"],
		_count: true,
		where: {
			linkId: { in: linkIds },
			createdAt: { gte: startDate, lte: endDate },
		},
	});

	const viewsByDay = await prisma.profileView.groupBy({
		by: ["createdAt"],
		_count: true,
		where: {
			userId,
			createdAt: { gte: startDate, lte: endDate },
		},
	});

	const dailyMap = new Map<string, { clicks: number; views: number }>();

	// Preencher dias com 0 ao longo do intervalo
	const daysDiff = Math.max(
		0,
		Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
	);
	for (let i = 0; i <= daysDiff; i++) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);
		dailyMap.set(formatDayISO(date), { clicks: 0, views: 0 });
	}

	// Preencher cliques
	for (const entry of clicksByDay) {
		const date = formatDayISO(entry.createdAt);
		const existing = dailyMap.get(date);
		if (existing) {
			existing.clicks += entry._count;
		}
	}

	// Preencher views
	for (const entry of viewsByDay) {
		const date = formatDayISO(entry.createdAt);
		const existing = dailyMap.get(date);
		if (existing) {
			existing.views += entry._count;
		}
	}

	const chartData = Array.from(dailyMap.entries()).map(([day, data]) => ({
		day,
		clicks: data.clicks,
		views: data.views,
	}));

	// Agrupar cliques por link
	const clicksPerLink = await prisma.linkClick.groupBy({
		by: ["linkId"],
		_count: true,
		where: {
			linkId: { in: linkIds },
			createdAt: { gte: startDate, lte: endDate },
		},
	});

	// Agrupar dados por dispositivo
	const [clicksByDevice, viewsByDevice] = await Promise.all([
		prisma.linkClick.groupBy({
			by: ["device"],
			_count: true,
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: startDate, lte: endDate },
			},
		}),
		prisma.profileView.groupBy({
			by: ["device"],
			_count: true,
			where: {
				userId,
				createdAt: { gte: startDate, lte: endDate },
			},
		}),
	]);

	// Normalizar dados de dispositivos
	const deviceData = new Map<string, { clicks: number; views: number }>();

	// Inicializar com dispositivos padrão
	const defaultDevices = ["mobile", "desktop", "tablet", "unknown"];
	for (const device of defaultDevices) {
		deviceData.set(device, { clicks: 0, views: 0 });
	}

	// Preencher cliques por dispositivo
	for (const entry of clicksByDevice) {
		const device = entry.device || "unknown";
		const existing = deviceData.get(device) || { clicks: 0, views: 0 };
		existing.clicks = entry._count;
		deviceData.set(device, existing);
	}

	// Preencher views por dispositivo
	for (const entry of viewsByDevice) {
		const device = entry.device || "unknown";
		const existing = deviceData.get(device) || { clicks: 0, views: 0 };
		existing.views = entry._count;
		deviceData.set(device, existing);
	}

	// Converter para array
	const deviceAnalytics = Array.from(deviceData.entries())
		.map(([device, data]) => ({
			device: device === "unknown" ? "unknown" : device,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0),
		}))
		.filter((item) => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Agrupar dados por sistema operacional, país e referrer
	const [
		clicksByOS,
		viewsByOS,
		clicksByCountry,
		viewsByCountry,
		clicksByReferrer,
		viewsByReferrer,
	] = await Promise.all([
		prisma.linkClick.findMany({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { userAgent: true },
		}),
		prisma.profileView.findMany({
			where: {
				userId,
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { userAgent: true },
		}),
		prisma.linkClick.findMany({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { country: true },
		}),
		prisma.profileView.findMany({
			where: {
				userId,
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { country: true },
		}),
		prisma.linkClick.findMany({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { referrer: true },
		}),
		prisma.profileView.findMany({
			where: {
				userId,
				createdAt: { gte: startDate, lte: endDate },
			},
			select: { referrer: true },
		}),
	]);

	// Processar dados de OS
	const osData = new Map<string, { clicks: number; views: number }>();

	// Inicializar com sistemas operacionais padrão
	const defaultOS = ["ios", "android", "windows", "macos", "linux", "unknown"];
	for (const os of defaultOS) {
		osData.set(os, { clicks: 0, views: 0 });
	}

	// Processar cliques por OS
	for (const click of clicksByOS) {
		const os = detectOS(click.userAgent || "");
		const existing = osData.get(os) || { clicks: 0, views: 0 };
		existing.clicks += 1;
		osData.set(os, existing);
	}

	// Processar views por OS
	for (const view of viewsByOS) {
		const os = detectOS(view.userAgent || "");
		const existing = osData.get(os) || { clicks: 0, views: 0 };
		existing.views += 1;
		osData.set(os, existing);
	}

	// Converter para array
	const osAnalytics = Array.from(osData.entries())
		.map(([os, data]) => ({
			os,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0),
		}))
		.filter((item) => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Processar dados por país
	const countryData = new Map<string, { clicks: number; views: number }>();

	// Processar cliques por país
	for (const click of clicksByCountry) {
		if (click.country) {
			const existing = countryData.get(click.country) || {
				clicks: 0,
				views: 0,
			};
			existing.clicks += 1;
			countryData.set(click.country, existing);
		}
	}

	// Processar views por país
	for (const view of viewsByCountry) {
		if (view.country) {
			const existing = countryData.get(view.country) || { clicks: 0, views: 0 };
			existing.views += 1;
			countryData.set(view.country, existing);
		}
	}

	// Converter para array
	const countryAnalytics = Array.from(countryData.entries())
		.map(([country, data]) => ({
			country,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0),
		}))
		.filter((item) => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Processar dados por referrer
	const referrerData = new Map<string, { clicks: number; views: number }>();

	// Processar cliques por referrer
	for (const click of clicksByReferrer) {
		if (click.referrer) {
			const existing = referrerData.get(click.referrer) || {
				clicks: 0,
				views: 0,
			};
			existing.clicks += 1;
			referrerData.set(click.referrer, existing);
		}
	}

	// Processar views por referrer
	for (const view of viewsByReferrer) {
		if (view.referrer) {
			const existing = referrerData.get(view.referrer) || {
				clicks: 0,
				views: 0,
			};
			existing.views += 1;
			referrerData.set(view.referrer, existing);
		}
	}

	// Converter para array
	const referrerAnalytics = Array.from(referrerData.entries())
		.map(([referrer, data]) => ({
			referrer,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0),
		}))
		.filter((item) => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Associar cliques com os links
	// Paginação simples para topLinks
	const page = Math.max(1, Number(pageParam) || 1);
	const limit = Math.min(100, Math.max(1, Number(limitParam) || 20));

	const topLinksAll = links
		.map((link) => {
			const match = clicksPerLink.find((c) => c.linkId === link.id);
			return {
				id: link.id,
				title: link.title,
				url: link.url,
				clicks: match?._count ?? 0,
			};
		})
		.sort((a, b) => b.clicks - a.clicks);

	const topLinks = topLinksAll.slice((page - 1) * limit, page * limit);
	const responseBody = {
		totalProfileViews,
		totalClicks,
		performanceRate: performanceRate.toFixed(1),
		chartData,
		topLinks,
		deviceAnalytics,
		osAnalytics,
		countryAnalytics,
		referrerAnalytics,
		meta: {
			range: rangeParam,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			page,
			limit,
			totalTopLinks: topLinksAll.length,
		},
	};

	const response = NextResponse.json(responseBody);
	const maxAge =
		rangeParam === "7d"
			? 30
			: rangeParam === "30d"
				? 60
				: rangeParam === "90d"
					? 120
					: rangeParam === "365d"
						? 180
						: 60;
	response.headers.set("Cache-Control", `private, max-age=${maxAge}`);
	return response;
}

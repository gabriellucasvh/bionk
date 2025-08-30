import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Função para detectar sistema operacional baseado no user-agent
function detectOS(userAgent: string): string {
	if (!userAgent) return "unknown";
	
	const ua = userAgent.toLowerCase();
	
	// iOS (iPhone, iPad, iPod)
	if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || (ua.includes('mac os x') && ua.includes('mobile'))) {
		return 'ios';
	}
	
	// Android
	if (ua.includes('android')) {
		return 'android';
	}
	
	// Windows
	if (ua.includes('windows nt') || ua.includes('win32') || ua.includes('win64') || ua.includes('windows')) {
		return 'windows';
	}
	
	// macOS (desktop)
	if (ua.includes('macintosh') || ua.includes('mac os x')) {
		return 'macos';
	}
	
	// Linux
	if (ua.includes('linux') || ua.includes('x11')) {
		return 'linux';
	}
	
	return 'unknown';
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	if (!userId) {
		return NextResponse.json({ error: "UserId is required" }, { status: 400 });
	}

	const now = new Date();
	const last30Days = new Date();
	last30Days.setDate(now.getDate() - 30);

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
				createdAt: { gte: last30Days },
			},
		}),
		prisma.profileView.count({
			where: {
				userId,
				createdAt: { gte: last30Days },
			},
		}),
	]);

	const performanceRate =
		totalClicks > 0 ? (totalProfileViews / totalClicks) * 100 : 0;

	// Agrupamento por dia dos últimos 30 dias
	const clicksByDay = await prisma.linkClick.groupBy({
		by: ["createdAt"],
		_count: true,
		where: {
			linkId: { in: linkIds },
			createdAt: { gte: last30Days },
		},
	});

	const viewsByDay = await prisma.profileView.groupBy({
		by: ["createdAt"],
		_count: true,
		where: {
			userId,
			createdAt: { gte: last30Days },
		},
	});

	// Normalizar datas para "YYYY-MM-DD"
	function formatDate(date: Date) {
		return date.toISOString().split("T")[0];
	}

	const dailyMap = new Map<string, { clicks: number; views: number }>();

	// Preencher dias com 0
	for (let i = 0; i <= 30; i++) {
		const date = new Date(last30Days);
		date.setDate(last30Days.getDate() + i);
		dailyMap.set(formatDate(date), { clicks: 0, views: 0 });
	}

	// Preencher cliques
	for (const entry of clicksByDay) {
		const date = formatDate(entry.createdAt);
		const existing = dailyMap.get(date);
		if (existing) existing.clicks += entry._count;
	}

	// Preencher views
	for (const entry of viewsByDay) {
		const date = formatDate(entry.createdAt);
		const existing = dailyMap.get(date);
		if (existing) existing.views += entry._count;
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
			createdAt: { gte: last30Days },
		},
	});

	// Agrupar dados por dispositivo
	const [clicksByDevice, viewsByDevice] = await Promise.all([
		prisma.linkClick.groupBy({
			by: ["device"],
			_count: true,
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: last30Days },
			},
		}),
		prisma.profileView.groupBy({
			by: ["device"],
			_count: true,
			where: {
				userId,
				createdAt: { gte: last30Days },
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
			totalInteractions: (data.clicks || 0) + (data.views || 0)
		}))
		.filter(item => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Agrupar dados por sistema operacional e país
	const [clicksByOS, viewsByOS, clicksByCountry, viewsByCountry] = await Promise.all([
		prisma.linkClick.findMany({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: last30Days },
			},
			select: { userAgent: true },
		}),
		prisma.profileView.findMany({
			where: {
				userId,
				createdAt: { gte: last30Days },
			},
			select: { userAgent: true },
		}),
		prisma.linkClick.findMany({
			where: {
				linkId: { in: linkIds },
				createdAt: { gte: last30Days },
			},
			select: { country: true },
		}),
		prisma.profileView.findMany({
			where: {
				userId,
				createdAt: { gte: last30Days },
			},
			select: { country: true },
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
			os: os,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0)
		}))
		.filter(item => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Processar dados por país
	const countryData = new Map<string, { clicks: number; views: number }>();

	// Processar cliques por país
	for (const click of clicksByCountry) {
		if (click.country) {
			const existing = countryData.get(click.country) || { clicks: 0, views: 0 };
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
			country: country,
			clicks: data.clicks || 0,
			views: data.views || 0,
			totalInteractions: (data.clicks || 0) + (data.views || 0)
		}))
		.filter(item => item.totalInteractions > 0)
		.sort((a, b) => b.totalInteractions - a.totalInteractions);

	// Associar cliques com os links
	const topLinks = links
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

	return NextResponse.json({
		totalProfileViews,
		totalClicks,
		performanceRate: performanceRate.toFixed(1),
		chartData,
		topLinks,
		deviceAnalytics,
		osAnalytics,
		countryAnalytics,
	});
}

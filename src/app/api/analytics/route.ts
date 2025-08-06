import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
	});
}

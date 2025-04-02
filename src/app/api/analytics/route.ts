// app/api/analytics/route.ts
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

  // Obtém os links do usuário
  const links = await prisma.link.findMany({
    where: { userId },
  });

  const linkIds = links.map((link) => link.id);

  // Consulta eventos dos últimos 30 dias
  const totalClicks = await prisma.linkClick.count({
    where: {
      linkId: { in: linkIds },
      createdAt: { gte: last30Days },
    },
  });

  const totalProfileViews = await prisma.profileView.count({
    where: {
      userId,
      createdAt: { gte: last30Days },
    },
  });

  // Calcula a taxa de performance: (perfil visualizações / cliques) * 100
  const performanceRate = totalClicks > 0 ? (totalProfileViews / totalClicks) * 100 : 0;

  // Agrega dados diários para o gráfico
  const chartData = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date(last30Days);
    date.setDate(last30Days.getDate() + i);
    const dayStr = date.toISOString().split("T")[0];

    const dayClicks = await prisma.linkClick.count({
      where: {
        linkId: { in: linkIds },
        createdAt: {
          gte: new Date(dayStr),
          lt: new Date(new Date(dayStr).setDate(new Date(dayStr).getDate() + 1)),
        },
      },
    });

    const dayProfileViews = await prisma.profileView.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(dayStr),
          lt: new Date(new Date(dayStr).setDate(new Date(dayStr).getDate() + 1)),
        },
      },
    });

    chartData.push({
      day: dayStr,
      clicks: dayClicks,
      views: dayProfileViews,
    });
  }

  // Prepara ranking de links (melhor desempenho baseado nos cliques)
  const topLinks = await Promise.all(
    links.map(async (link) => {
      const linkClicks = await prisma.linkClick.count({
        where: {
          linkId: link.id,
          createdAt: { gte: last30Days },
        },
      });
      return {
        title: link.title,
        clicks: linkClicks,
      };
    })
  );

  // Ordena os links por quantidade de cliques
  topLinks.sort((a, b) => b.clicks - a.clicks);

  return NextResponse.json({
    totalProfileViews,
    totalClicks,
    performanceRate: performanceRate.toFixed(1),
    chartData,
    topLinks,
  });
}

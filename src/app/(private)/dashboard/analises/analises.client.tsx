// components/AnalisesClient.tsx
"use client";

import React from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp, LayoutDashboard } from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TopLink {
  title: string;
  clicks: number;
}

interface ChartDataItem {
  day: string;
  clicks: number;
  views: number;
}

interface AnalyticsData {
  totalProfileViews: number;
  totalClicks: number;
  performanceRate: string;
  chartData: ChartDataItem[];
  topLinks: TopLink[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AnalisesClientProps {
  userId: string;
}

const AnalisesClient: React.FC<AnalisesClientProps> = ({ userId }) => {
  const { data, error } = useSWR<AnalyticsData>(
    `/api/analytics?userId=${userId}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  if (error) {
    return (
      <section className="p-4">
        <p>Erro ao carregar os dados.</p>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="p-4">
        <p>Carregando...</p>
      </section>
    );
  }

  return (
    <section className="w-full p-4">
      <header className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Análises</h2>
        <div className="flex gap-2">
          <Button variant="outline">Últimos 30 dias</Button>
          <Button variant="outline">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <article className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Visualizações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {data.totalProfileViews.toLocaleString()}
                </span>
                <div className="flex items-center text-sm text-green-500">
                  <ChevronUp className="h-4 w-4" />
                  <span>--%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cliques nos Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {data.totalClicks.toLocaleString()}
                </span>
                <div className="flex items-center text-sm text-green-500">
                  <ChevronUp className="h-4 w-4" />
                  <span>--%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {data.performanceRate}%
                </span>
                <div className="flex items-center text-sm text-red-500">
                  <ChevronDown className="h-4 w-4" />
                  <span>--%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </article>

        <article>
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral de Desempenho</CardTitle>
              <CardDescription>
                Visualize os cliques e as visualizações diárias dos últimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                <ChartContainer
                  config={{
                    views: {
                      label: "Visualizações",
                      color: "var(--chart-5)",
                    },
                    clicks: {
                      label: "Cliques",
                      color: "var(--chart-2)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--color-views)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="var(--color-clicks)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </article>

        <article>
          <Card>
            <CardHeader>
              <CardTitle>Links com Melhor Desempenho</CardTitle>
              <CardDescription>
                Ranking dos links mais clicados nos últimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col space-y-1 flex-1">
                      <span className="font-medium">{link.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {link.clicks.toLocaleString()}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        cliques
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </article>
      </main>
    </section>
  );
};

export default AnalisesClient;

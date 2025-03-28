"use client";

import React from "react";
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
import "@/app/globals.css";
const AnalisesClient: React.FC = () => {
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
                Total de Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">12.543</span>
                <div className="flex items-center text-sm text-green-500">
                  <ChevronUp className="h-4 w-4" />
                  <span>12,5%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">3.856</span>
                <div className="flex items-center text-sm text-green-500">
                  <ChevronUp className="h-4 w-4" />
                  <span>8,2%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">30,7%</span>
                <div className="flex items-center text-sm text-red-500">
                  <ChevronDown className="h-4 w-4" />
                  <span>2,1%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
            </CardContent>
          </Card>
        </article>

        <article>
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral de Desempenho</CardTitle>
              <CardDescription>
                Veja o desempenho dos seus links ao longo do tempo.
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
                      data={[
                        { month: "Jan", views: 1200, clicks: 300 },
                        { month: "Feb", views: 1800, clicks: 450 },
                        { month: "Mar", views: 2100, clicks: 600 },
                        { month: "Apr", views: 1500, clicks: 500 },
                        { month: "May", views: 2500, clicks: 800 },
                        { month: "Jun", views: 2000, clicks: 600 },
                        { month: "Jul", views: 2300, clicks: 750 },
                        { month: "Aug", views: 2800, clicks: 850 },
                        { month: "Sep", views: 3200, clicks: 950 },
                        { month: "Oct", views: 3500, clicks: 1100 },
                        { month: "Nov", views: 3800, clicks: 1200 },
                        { month: "Dec", views: 4000, clicks: 1350 },
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis tickLine={false} axisLine={false} className="text-xs" />
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
                Seus links mais clicados nos últimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Meu Portfólio", clicks: 1243, views: 3500, ctr: "35,5%" },
                  { title: "Canal no YouTube", clicks: 856, views: 2800, ctr: "30,6%" },
                  { title: "Último Post do Blog", clicks: 421, views: 1500, ctr: "28,1%" },
                  { title: "Conteúdo Premium", clicks: 189, views: 650, ctr: "29,1%" },
                  { title: "Instagram", clicks: 156, views: 720, ctr: "21,7%" },
                ].map((link, index) => (
                  <div
                    key={index}
                    className="flex sm:flex-row items-start sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1 flex-1 flex flex-col">
                      <span className="font-medium">{link.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {link.views.toLocaleString()} visualizações
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                      <div className="text-right">
                        <span className="font-medium">
                          {link.clicks.toLocaleString()}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          cliques
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{link.ctr}</span>
                        <span className="block text-sm text-muted-foreground">
                          CTR
                        </span>
                      </div>
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

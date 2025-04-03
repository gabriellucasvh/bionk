// components/AnalisesClient.tsx
"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  LayoutDashboard,
  MousePointerClick,
  Percent,
  Link as LinkIcon,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface TopLink {
  title: string;
  clicks: number;
  url: string;
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

// Função auxiliar para formatação de datas
const formatDate = (dateStr: string, pattern = "dd/MM/yyyy") =>
  format(parseISO(dateStr), pattern, { locale: ptBR });

interface AnalisesClientProps {
  userId: string;
}

const AnalisesClient: React.FC<AnalisesClientProps> = ({ userId }) => {
  const { data, error } = useSWR<AnalyticsData>(
    `/api/analytics?userId=${userId}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const exportToExcel = async () => {
    if (!data) return;
    // Importação dinâmica para reduzir o bundle inicial
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Analytics");
    worksheet.addRow(["Data", "Cliques", "Visualizações"]);
    data.chartData.forEach((item) =>
      worksheet.addRow([formatDate(item.day), item.clicks, item.views])
    );
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "analytics.xlsx";
    link.click();
  };

  const exportToPDF = async () => {
    if (!data) return;
    // Importação dinâmica para reduzir o bundle inicial
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.text("Análises de Desempenho", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["Data", "Cliques", "Visualizações"]],
      body: data.chartData.map((item) => [
        formatDate(item.day),
        item.clicks,
        item.views,
      ]),
    });
    doc.save("analytics.pdf");
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar para Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Exportar para PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <span className="text-2xl flex items-center gap-2 font-bold">
                  <div className="p-2 rounded-full bg-green-50 text-green-500">
                    <Eye />
                  </div>
                  {data.totalProfileViews.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
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
                <span className="text-2xl flex items-center gap-2 font-bold">
                  <div className="p-2 rounded-full bg-green-50 text-green-500">
                    <MousePointerClick />
                  </div>
                  {data.totalClicks.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">vs. mês anterior</p>
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
                <span className="text-2xl flex items-center gap-2 font-bold">
                  <div className="p-2 rounded-full bg-green-50 text-green-500">
                    <Percent />
                  </div>
                  {parseFloat(data.performanceRate).toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
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
                Visualize os cliques e as visualizações diárias dos últimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                <ChartContainer
                  config={{
                    views: {
                      label: "Visualizações",
                      color: "oklch(55.8% 0.288 302.321)",
                    },
                    clicks: {
                      label: "Cliques",
                      color: "oklch(62.7% 0.194 149.214)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.chartData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(tick) => formatDate(tick, "dd/MM")}
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis
                        tickFormatter={(tick) => tick.toFixed(2)}
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
                      <Link href={link.url} className="text-sm text-blue-500 flex items-center gap-1">
                        <LinkIcon size={16} /> {link.url}
                      </Link>
                    </div>
                    <div className="flex items-center bg-primary/5 px-3 py-1.5 rounded-full text-sm">
                      <MousePointerClick size={14} className="mr-1.5 text-primary" />
                      <span className="font-medium">{link.clicks.toLocaleString()}</span>
                      <span className="ml-1 text-muted-foreground">cliques</span>
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

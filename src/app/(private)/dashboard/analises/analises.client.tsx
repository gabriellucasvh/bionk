"use client";

import React, { useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import LoadingPage from "@/components/layout/LoadingPage";

// Dynamic imports for components
const AnalyticsHeader = dynamic(() => import("./components/AnalyticsHeader"), { 
  // @ts-expect-error
  suspense: true,
  loading: () => <div className="h-16 w-full animate-pulse rounded-md bg-muted"></div> 
});
const AnalyticsStatsCards = dynamic(() => import("./components/AnalyticsStatsCards"), { 
  // @ts-expect-error
  suspense: true,
  loading: () => <div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> </div>
});
const PerformanceChart = dynamic(() => import("./components/PerformanceChart"), { 
  // @ts-expect-error
  suspense: true,
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-md bg-muted"></div>
});
const TopLinksTable = dynamic(() => import("./components/TopLinksTable"), { 
  // @ts-expect-error
  suspense: true,
  loading: () => <div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>
});

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
    { refreshInterval: 5000, suspense: true } // Adicionado suspense: true para SWR
  );

  const memoizedChartData = useMemo(() => data?.chartData || [], [data?.chartData]);
  const memoizedTopLinks = useMemo(() => data?.topLinks || [], [data?.topLinks]);

  const exportToExcel = useCallback(async () => {
    if (!data) return;
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
  }, [data]);

  const exportToPDF = useCallback(async () => {
    if (!data) return;
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
  }, [data]);

  if (error) {
    return (
      <section className="p-4">
        <p>Erro ao carregar os dados.</p>
      </section>
    );
  }
  // O estado de carregamento agora é tratado pelo Suspense do SWR e do next/dynamic
  // if (!data) {
  //   return <LoadingPage />;
  // }

  return (
    <section className="w-full p-4">
      <Suspense fallback={<div className="h-16 w-full animate-pulse rounded-md bg-muted"></div>}>
        <AnalyticsHeader
          onExportToExcel={exportToExcel}
          onExportToPDF={exportToPDF}
        />
      </Suspense>
      <main className="space-y-6">
        <Suspense fallback={<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> <div className="h-full w-full animate-pulse rounded-md bg-muted"></div> </div>}>
          <AnalyticsStatsCards
            totalProfileViews={data?.totalProfileViews ?? 0}
            totalClicks={data?.totalClicks ?? 0}
            performanceRate={data?.performanceRate ?? "0"}
          />
        </Suspense>
        <Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-md bg-muted"></div>}>
          <PerformanceChart chartData={memoizedChartData} />
        </Suspense>
        <Suspense fallback={<div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>}>
          <TopLinksTable topLinks={memoizedTopLinks} />
        </Suspense>
      </main>
    </section>
  );
};

const MemoizedAnalisesClient = React.memo(AnalisesClient);
MemoizedAnalisesClient.displayName = "AnalisesClient";

export default MemoizedAnalisesClient;

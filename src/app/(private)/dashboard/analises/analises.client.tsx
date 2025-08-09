"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo } from "react";
import useSWR from "swr";

// Dynamic imports for components
const AnalyticsHeader = dynamic(() => import("./components/analises.AnalyticsHeader"), {
	loading: () => (
		<div className="h-16 w-full animate-pulse rounded-md bg-muted"></div>
	),
});
const AnalyticsStatsCards = dynamic(
	() => import("./components/analises.AnalyticsStatsCards"),
	{
		loading: () => (
			<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
				<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
				<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
			</div>
		),
	},
);
const PerformanceChart = dynamic(
	() => import("./components/analises.PerformanceChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted"></div>
		),
	},
);
const TopLinksTable = dynamic(() => import("./components/analises.TopLinksTable"), {
	loading: () => (
		<div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>
	),
});

interface TopLink {
	id: string;
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
	const { data, error, isLoading } = useSWR<AnalyticsData>(
		userId ? `/api/analytics?userId=${userId}` : null,
		fetcher,
		{
			refreshInterval: 0,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const memoizedChartData = useMemo(
		() => data?.chartData || [],
		[data?.chartData],
	);
	const memoizedTopLinks = useMemo(
		() => data?.topLinks || [],
		[data?.topLinks],
	);

	const exportToExcel = useCallback(async () => {
		if (!data) return;
		const ExcelJS = (await import("exceljs")).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Analytics");
		worksheet.addRow(["Data", "Cliques", "Visualizações"]);
		data.chartData.forEach((item) =>
			worksheet.addRow([formatDate(item.day), item.clicks, item.views]),
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
				<p>Erro ao carregar os dados. Recarregue a página e tente novamente.</p>
			</section>
		);
	}

	return (
		<section className="w-full p-4">
			<AnalyticsHeader
				onExportToExcel={exportToExcel}
				onExportToPDF={exportToPDF}
			/>
			<main className="space-y-6">
				{isLoading || !data ? (
					<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
						<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
						<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
						<div className="h-full w-full animate-pulse rounded-md bg-muted"></div>
					</div>
				) : (
					<AnalyticsStatsCards
						totalProfileViews={data.totalProfileViews}
						totalClicks={data.totalClicks}
						performanceRate={data.performanceRate}
					/>
				)}

				{isLoading || !data ? (
					<div className="h-[400px] w-full animate-pulse rounded-md bg-muted"></div>
				) : (
					<PerformanceChart chartData={memoizedChartData} />
				)}

				{isLoading || !data ? (
					<div className="h-[200px] w-full animate-pulse rounded-md bg-muted"></div>
				) : (
					<TopLinksTable topLinks={memoizedTopLinks} />
				)}
			</main>
		</section>
	);
};

const MemoizedAnalisesClient = React.memo(AnalisesClient);
MemoizedAnalisesClient.displayName = "AnalisesClient";

export default MemoizedAnalisesClient;

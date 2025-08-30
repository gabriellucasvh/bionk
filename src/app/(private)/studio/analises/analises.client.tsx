"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo } from "react";
import useSWR from "swr";

// Dynamic imports for components
const AnalyticsHeader = dynamic(
	() => import("./components/analises.AnalyticsHeader"),
	{
		loading: () => (
			<div className="h-16 w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const AnalyticsStatsCards = dynamic(
	() => import("./components/analises.AnalyticsStatsCards"),
	{
		loading: () => (
			<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				<div className="h-full w-full animate-pulse rounded-md bg-muted" />
				<div className="h-full w-full animate-pulse rounded-md bg-muted" />
				<div className="h-full w-full animate-pulse rounded-md bg-muted" />
			</div>
		),
	}
);
const PerformanceChart = dynamic(
	() => import("./components/analises.PerformanceChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const TopLinksTable = dynamic(
	() => import("./components/analises.TopLinksTable"),
	{
		loading: () => (
			<div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const DeviceAnalyticsTable = dynamic(
	() => import("./components/analises.DeviceAnalyticsTable"),
	{
		loading: () => (
			<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const DeviceChart = dynamic(
	() => import("./components/analises.DeviceChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const OSAnalyticsChart = dynamic(
	() => import("./components/analises.OSAnalyticsChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const WorldMapD3 = dynamic(
	() => import("../../../../components/analises/WorldMapD3"),
	{
		loading: () => (
			<div className="h-[500px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const ReferrerChart = dynamic(
	() => import("./components/analises.ReferrerChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const ReferrerTable = dynamic(
	() => import("./components/analises.ReferrerTable"),
	{
		loading: () => (
			<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);

interface TopLink {
	id: string;
	title: string;
	clicks: number;
	url: string;
}

interface DeviceAnalytics {
	device: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface OSAnalytics {
	os: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface CountryAnalytics {
	country: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface ReferrerAnalytics {
	referrer: string;
	views: number;
	clicks: number;
	totalInteractions: number;
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
	deviceAnalytics: DeviceAnalytics[];
	osAnalytics: OSAnalytics[];
	countryAnalytics: CountryAnalytics[];
	referrerAnalytics: ReferrerAnalytics[];
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
			revalidateOnFocus: false, // Otimização: Desabilitar refetch em foco
			revalidateOnReconnect: false, // Otimização: Desabilitar refetch em reconexão
		}
	);

	const memoizedChartData = useMemo(
		() => data?.chartData || [],
		[data?.chartData]
	);
	const memoizedTopLinks = useMemo(
		() => data?.topLinks || [],
		[data?.topLinks]
	);

	const exportToExcel = useCallback(async () => {
		if (!data) {
			return;
		}
		const ExcelJS = (await import("exceljs")).default;
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Analytics");
		worksheet.addRow(["Data", "Cliques", "Visualizações"]);
		for (const item of data.chartData) {
			worksheet.addRow([formatDate(item.day), item.clicks, item.views]);
		}
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
		if (!data) {
			return;
		}
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
			<section className="p-4 text-center text-red-600">
				<p>
					Ocorreu um erro ao carregar os dados das análises.
					<br />
					Por favor, tente recarregar a página.
				</p>
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
						<div className="h-full w-full animate-pulse rounded-md bg-muted" />
						<div className="h-full w-full animate-pulse rounded-md bg-muted" />
						<div className="h-full w-full animate-pulse rounded-md bg-muted" />
					</div>
				) : (
					<AnalyticsStatsCards
						performanceRate={data.performanceRate}
						totalClicks={data.totalClicks}
						totalProfileViews={data.totalProfileViews}
					/>
				)}

				{isLoading || !data ? (
					<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
				) : (
					<PerformanceChart chartData={memoizedChartData} />
				)}

				{isLoading || !data ? (
					<div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />
				) : (
					<TopLinksTable topLinks={memoizedTopLinks} />
				)}

				{/* Seção de Analytics por Dispositivo */}
				<div className="space-y-6 xl:grid xl:gap-6 xl:grid-cols-2 xl:space-y-0">
					{isLoading || !data ? (
						<div className="h-[300px] sm:h-[400px] w-full animate-pulse rounded-md bg-muted" />
					) : (
						<DeviceChart data={data.deviceAnalytics || []} isLoading={isLoading} />
					)}

					{isLoading || !data ? (
						<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
					) : (
						<DeviceAnalyticsTable data={data.deviceAnalytics || []} isLoading={isLoading} />
					)}
				</div>

				{/* Seção de Analytics por Sistema Operacional */}
				{isLoading || !data ? (
					<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
				) : (
					<OSAnalyticsChart data={data.osAnalytics || []} isLoading={isLoading} />
				)}

				{/* Seção de Analytics por País/Região */}
				{isLoading || !data ? (
					<div className="h-[500px] w-full animate-pulse rounded-md bg-muted" />
				) : (
					<WorldMapD3 data={data.countryAnalytics || []} width={800} height={500} />
				)}

				{/* Seção de Analytics por Origem do Tráfego */}
				<div className="space-y-6 xl:grid xl:gap-6 xl:grid-cols-2 xl:space-y-0">
					{isLoading || !data ? (
						<div className="h-[300px] sm:h-[400px] w-full animate-pulse rounded-md bg-muted" />
					) : (
						<ReferrerChart data={data.referrerAnalytics || []} isLoading={isLoading} />
					)}

					{isLoading || !data ? (
						<div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
					) : (
						<ReferrerTable data={data.referrerAnalytics || []} isLoading={isLoading} />
					)}
				</div>
			</main>
		</section>
	);
};

const MemoizedAnalisesClient = React.memo(AnalisesClient);
MemoizedAnalisesClient.displayName = "AnalisesClient";

export default MemoizedAnalisesClient;

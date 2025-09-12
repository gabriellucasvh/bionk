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
			<div className="h-16 w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
		),
	}
);
const AnalyticsStatsCards = dynamic(
	() => import("./components/analises.AnalyticsStatsCards"),
	{
		loading: () => (
			<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
				<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
				<div className="h-full w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
			</div>
		),
	}
);
const PerformanceChart = dynamic(
	() => import("./components/analises.PerformanceChart"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
		),
	}
);
const TopLinksTable = dynamic(
	() => import("./components/analises.TopLinksTable"),
	{
		loading: () => (
			<div className="h-[200px] w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
		),
	}
);
const DeviceAnalytics = dynamic(
	() => import("./components/analises.DeviceAnalytics"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted dark:bg-neutral-700" />
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
const WorldMapAnalytics = dynamic(
	() => import("./components/analises.WorldMapAnalytics"),
	{
		loading: () => (
			<div className="h-[500px] w-full animate-pulse rounded-md bg-muted" />
		),
	}
);
const ReferrerAnalytics = dynamic(
	() => import("./components/analises.ReferrerAnalytics"),
	{
		loading: () => (
			<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
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

// Componente para renderizar seções com loading
const LoadingSection: React.FC<{ className: string }> = ({ className }) => (
	<div className={`animate-pulse rounded-md bg-muted dark:bg-neutral-700 ${className}`} />
);

// Componente para renderizar o conteúdo das análises
interface AnalyticsContentProps {
	isLoading: boolean;
	data: AnalyticsData | undefined;
	memoizedChartData: any[];
	memoizedTopLinks: any[];
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({
	isLoading,
	data,
	memoizedChartData,
	memoizedTopLinks
}) => {
	if (isLoading || !data) {
		return (
			<main className="space-y-4 sm:space-y-6">
				<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					<LoadingSection className="h-full w-full" />
					<LoadingSection className="h-full w-full" />
					<LoadingSection className="h-full w-full" />
				</div>
				<LoadingSection className="h-[400px] w-full" />
				<LoadingSection className="h-[200px] w-full" />
				<LoadingSection className="h-[400px] w-full" />
				<LoadingSection className="h-[400px] w-full" />
				<LoadingSection className="h-[300px] w-full sm:h-[400px] lg:h-[500px]" />
				<LoadingSection className="h-[400px] w-full" />
			</main>
		);
	}

	return (
		<main className="space-y-4 sm:space-y-6">
			<AnalyticsStatsCards
				performanceRate={data.performanceRate}
				totalClicks={data.totalClicks}
				totalProfileViews={data.totalProfileViews}
			/>
			<PerformanceChart chartData={memoizedChartData} />
			<TopLinksTable topLinks={memoizedTopLinks} />
			<DeviceAnalytics data={data.deviceAnalytics || []} isLoading={false} />
			<OSAnalyticsChart data={data.osAnalytics || []} isLoading={false} />
			<div className="w-full overflow-hidden">
				<WorldMapAnalytics
					data={data.countryAnalytics || []}
					height={300}
					isLoading={false}
				/>
			</div>
			<ReferrerAnalytics data={data.referrerAnalytics || []} isLoading={false} />
		</main>
	);
};

// Hook customizado para lógica de dados
const useAnalyticsData = (userId: string | null) => {
	const { data, error, isLoading } = useSWR<AnalyticsData>(
		userId ? `/api/analytics?userId=${userId}` : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
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

	return { data, error, isLoading, memoizedChartData, memoizedTopLinks };
};

const AnalisesClient: React.FC<AnalisesClientProps> = ({ userId }) => {
	const { data, error, isLoading, memoizedChartData, memoizedTopLinks } = useAnalyticsData(userId);

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
			<section className="p-4 text-center text-red-600 dark:text-red-400">
				<p>
					Ocorreu um erro ao carregar os dados das análises.
					<br />
					Por favor, tente recarregar a página.
				</p>
			</section>
		);
	}

	return (
			<section className="w-full max-w-full overflow-x-hidden p-3 pb-24 sm:p-4 sm:pb-8 lg:p-6 lg:pb-8 dark:text-white">
				<AnalyticsHeader
					onExportToExcel={exportToExcel}
					onExportToPDF={exportToPDF}
				/>
				<AnalyticsContent 
					isLoading={isLoading}
					data={data}
					memoizedChartData={memoizedChartData}
					memoizedTopLinks={memoizedTopLinks}
				/>
			</section>
		);
};

const MemoizedAnalisesClient = React.memo(AnalisesClient);
MemoizedAnalisesClient.displayName = "AnalisesClient";

export default MemoizedAnalisesClient;

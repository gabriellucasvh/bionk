"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for components
const AnalyticsHeader = dynamic(
	() => import("./components/analises.AnalyticsHeader"),
	{
		loading: () => <Skeleton className="h-16 w-full" />,
	}
);
const AnalyticsStatsCards = dynamic(
	() => import("./components/analises.AnalyticsStatsCards"),
	{
		loading: () => (
			<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				<Skeleton className="h-full w-full" />
				<Skeleton className="h-full w-full" />
				<Skeleton className="h-full w-full" />
			</div>
		),
	}
);
const PerformanceChart = dynamic(
	() => import("./components/analises.PerformanceChart"),
	{
		loading: () => <Skeleton className="h-[400px] w-full" />,
	}
);
const TopLinksTable = dynamic(
	() => import("./components/analises.TopLinksTable"),
	{
		loading: () => <Skeleton className="h-[200px] w-full" />,
	}
);
const DeviceAnalytics = dynamic(
	() => import("./components/analises.DeviceAnalytics"),
	{
		loading: () => <Skeleton className="h-[400px] w-full" />,
	}
);
const OSAnalyticsChart = dynamic(
	() => import("./components/analises.OSAnalyticsChart"),
	{
		loading: () => <Skeleton className="h-[400px] w-full" />,
	}
);
const WorldMapAnalytics = dynamic(
	() => import("./components/analises.WorldMapAnalytics"),
	{
		loading: () => <Skeleton className="h-[500px] w-full" />,
	}
);
const ReferrerAnalytics = dynamic(
	() => import("./components/analises.ReferrerAnalytics"),
	{
		loading: () => <Skeleton className="h-[400px] w-full" />,
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

const fetcher = (url: string) =>
	fetch(url, { cache: "no-store" }).then((res) => res.json());

// Função auxiliar para formatação de datas
const formatDate = (dateStr: string, pattern = "dd/MM/yyyy") =>
	format(parseISO(dateStr), pattern, { locale: ptBR });

interface AnalisesClientProps {
	userId: string;
}

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
	memoizedTopLinks,
}) => {
	if (isLoading || !data) {
		return (
			<main className="space-y-4 sm:space-y-6">
				<div className="grid h-32 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
					<Skeleton className="h-full w-full" />
					<Skeleton className="h-full w-full" />
					<Skeleton className="h-full w-full" />
				</div>
				<Skeleton className="h-[400px] w-full" />
				<Skeleton className="h-[200px] w-full" />
				<Skeleton className="h-[400px] w-full" />
				<Skeleton className="h-[400px] w-full" />
				<Skeleton className="h-[300px] w-full sm:h-[400px] lg:h-[500px]" />
				<Skeleton className="h-[400px] w-full" />
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
			<ReferrerAnalytics
				data={data.referrerAnalytics || []}
				isLoading={false}
			/>
		</main>
	);
};

// Hook customizado para lógica de dados
const useAnalyticsData = (
	userId: string | null,
	range: "7d" | "30d" | "90d" | "365d" | "tudo",
	customStart?: Date | null,
	customEnd?: Date | null
) => {
	const params = new URLSearchParams();
	params.set("range", range);
	if (range === "tudo") {
		if (customStart) {
			params.set("start", customStart.toISOString());
		}
		if (customEnd) {
			params.set("end", customEnd.toISOString());
		}
	}
	const key = userId ? `/api/analytics?${params.toString()}` : null;
	const { data, error, isLoading } = useSWR<AnalyticsData>(key, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
	});

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

type SubscriptionPlan = "free" | "basic" | "pro" | "ultra";
type AnalyticsPeriodOption = "7d" | "30d" | "90d" | "365d" | "custom";
const PLAN_RANK: Record<SubscriptionPlan, number> = {
	free: 0,
	basic: 1,
	pro: 2,
	ultra: 3,
};
const PERIOD_REQUIRED_RANK: Record<AnalyticsPeriodOption, number> = {
	"7d": 0,
	"30d": 0,
	"90d": 1,
	"365d": 2,
	custom: 3,
};
const isPeriodAvailable = (
	plan: SubscriptionPlan,
	option: AnalyticsPeriodOption
) => PLAN_RANK[plan] >= PERIOD_REQUIRED_RANK[option];

const AnalisesClient: React.FC<AnalisesClientProps> = ({ userId }) => {
	const [plan, setPlan] = useState<SubscriptionPlan>("free");
	const [range, setRange] = useState<"7d" | "30d" | "90d" | "365d" | "tudo">(
		"7d"
	);
	const [customStart, setCustomStart] = useState<Date | null>(null);
	const [customEnd, setCustomEnd] = useState<Date | null>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch("/api/user-plan");
				const json = await res.json();
				if (!active) {
					return;
				}
				const p = (json.subscriptionPlan || "free") as SubscriptionPlan;
				setPlan(p);
				// Garantir que o range atual é permitido pelo plano; caso contrário, voltar para 7d
				setRange((prev) => {
					const option = (prev === "tudo" ? "custom" : prev) as
						| "7d"
						| "30d"
						| "90d"
						| "365d"
						| "custom";
					return isPeriodAvailable(p, option) ? prev : "7d";
				});
			} catch {}
		})();
		return () => {
			active = false;
		};
	}, []);

	const { data, error, isLoading, memoizedChartData, memoizedTopLinks } =
		useAnalyticsData(userId, range, customStart, customEnd);

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
		<section className="mb-10 w-full max-w-full overflow-x-hidden p-6 pb-24 sm:p-6 md:mb-0 md:p-16 lg:pb-8 dark:text-white">
			<AnalyticsHeader
				customEnd={customEnd}
				customStart={customStart}
				onCustomRangeChange={(start, end) => {
					setCustomStart(start);
					setCustomEnd(end);
				}}
				onExportToExcel={exportToExcel}
				onExportToPDF={exportToPDF}
				onRangeChange={(r) => setRange(r)}
				plan={plan}
				range={range}
			/>
			<AnalyticsContent
				data={data}
				isLoading={isLoading}
				memoizedChartData={memoizedChartData}
				memoizedTopLinks={memoizedTopLinks}
			/>
		</section>
	);
};

const MemoizedAnalisesClient = React.memo(AnalisesClient);
MemoizedAnalisesClient.displayName = "AnalisesClient";

export default MemoizedAnalisesClient;

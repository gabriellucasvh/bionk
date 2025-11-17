"use client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for components
const AnalyticsHeader = dynamic(
	() => import("./components/analises.AnalyticsHeader")
);
const AnalyticsStatsCards = dynamic(
	() => import("./components/analises.AnalyticsStatsCards"),
	{
		loading: () => (
			<div className="grid h-44 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
		const wsDaily = workbook.addWorksheet("Diário");
		wsDaily.addRow(["Data", "Visualizações", "Cliques", "Total", "% do Total"]);
		const totalAll = (data.chartData || []).reduce(
			(sum, i) => sum + i.clicks + i.views,
			0
		);
		for (const item of data.chartData) {
			const total = (item.clicks || 0) + (item.views || 0);
			const pct =
				totalAll > 0 ? String(Math.round((total / totalAll) * 100)) : "0";
			wsDaily.addRow([
				formatDate(item.day),
				item.views,
				item.clicks,
				total,
				pct,
			]);
		}

		const wsDevice = workbook.addWorksheet("Dispositivo");
		wsDevice.addRow([
			"Dispositivo",
			"Visualizações",
			"Cliques",
			"Total",
			"% do Total",
		]);
		const totalDevice = (data.deviceAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.deviceAnalytics || []) {
			const pct =
				totalDevice > 0
					? String(Math.round((item.totalInteractions / totalDevice) * 100))
					: "0";
			wsDevice.addRow([
				item.device,
				item.views,
				item.clicks || 0,
				item.totalInteractions,
				pct,
			]);
		}

		const wsOS = workbook.addWorksheet("Sistema Operacional");
		wsOS.addRow(["OS", "Visualizações", "Cliques", "Total", "% do Total"]);
		const totalOS = (data.osAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.osAnalytics || []) {
			const pct =
				totalOS > 0
					? String(Math.round((item.totalInteractions / totalOS) * 100))
					: "0";
			wsOS.addRow([
				item.os,
				item.views,
				item.clicks || 0,
				item.totalInteractions,
				pct,
			]);
		}

		const wsCountry = workbook.addWorksheet("País");
		wsCountry.addRow([
			"País",
			"Visualizações",
			"Cliques",
			"Total",
			"% do Total",
		]);
		const totalCountry = (data.countryAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.countryAnalytics || []) {
			const pct =
				totalCountry > 0
					? String(Math.round((item.totalInteractions / totalCountry) * 100))
					: "0";
			wsCountry.addRow([
				item.country,
				item.views,
				item.clicks || 0,
				item.totalInteractions,
				pct,
			]);
		}

		const wsReferrer = workbook.addWorksheet("Origem");
		wsReferrer.addRow([
			"Origem",
			"Visualizações",
			"Cliques",
			"Total",
			"% do Total",
		]);
		const totalRef = (data.referrerAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.referrerAnalytics || []) {
			const pct =
				totalRef > 0
					? String(Math.round((item.totalInteractions / totalRef) * 100))
					: "0";
			wsReferrer.addRow([
				item.referrer,
				item.views,
				item.clicks || 0,
				item.totalInteractions,
				pct,
			]);
		}
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "bionk_metricas.xlsx";
		link.click();
	}, [data]);

	const exportToPDF = useCallback(async () => {
		if (!data) {
			return;
		}
		const { default: jsPDF } = await import("jspdf");
		const { default: autoTable } = await import("jspdf-autotable");
		const doc = new jsPDF();
		doc.text("Bionk – Relatório de Métricas", 14, 10);
		autoTable(doc, {
			startY: 20,
			head: [["Data", "Visualizações", "Cliques", "Total", "% do Total"]],
			body: (() => {
				const totalAll = (data.chartData || []).reduce(
					(sum, i) => sum + i.clicks + i.views,
					0
				);
				return data.chartData.map((item) => {
					const total = (item.clicks || 0) + (item.views || 0);
					const pct =
						totalAll > 0 ? String(Math.round((total / totalAll) * 100)) : "0";
					return [formatDate(item.day), item.views, item.clicks, total, pct];
				});
			})(),
		});
		autoTable(doc, {
			startY: (doc as any).lastAutoTable.finalY + 10,
			head: [
				["Dispositivo", "Visualizações", "Cliques", "Total", "% do Total"],
			],
			body: (data.deviceAnalytics || []).map((item) => {
				const total = (data.deviceAnalytics || []).reduce(
					(s, i) => s + i.totalInteractions,
					0
				);
				const pct =
					total > 0
						? String(Math.round((item.totalInteractions / total) * 100))
						: "0";
				return [
					item.device,
					item.views,
					item.clicks || 0,
					item.totalInteractions,
					pct,
				];
			}),
		});
		autoTable(doc, {
			startY: (doc as any).lastAutoTable.finalY + 10,
			head: [
				[
					"Sistema Operacional",
					"Visualizações",
					"Cliques",
					"Total",
					"% do Total",
				],
			],
			body: (data.osAnalytics || []).map((item) => {
				const total = (data.osAnalytics || []).reduce(
					(s, i) => s + i.totalInteractions,
					0
				);
				const pct =
					total > 0
						? String(Math.round((item.totalInteractions / total) * 100))
						: "0";
				return [
					item.os,
					item.views,
					item.clicks || 0,
					item.totalInteractions,
					pct,
				];
			}),
		});
		autoTable(doc, {
			startY: (doc as any).lastAutoTable.finalY + 10,
			head: [["País", "Visualizações", "Cliques", "Total", "% do Total"]],
			body: (data.countryAnalytics || []).map((item) => {
				const total = (data.countryAnalytics || []).reduce(
					(s, i) => s + i.totalInteractions,
					0
				);
				const pct =
					total > 0
						? String(Math.round((item.totalInteractions / total) * 100))
						: "0";
				return [
					item.country,
					item.views,
					item.clicks || 0,
					item.totalInteractions,
					pct,
				];
			}),
		});
		autoTable(doc, {
			startY: (doc as any).lastAutoTable.finalY + 10,
			head: [["Origem", "Visualizações", "Cliques", "Total", "% do Total"]],
			body: (data.referrerAnalytics || []).map((item) => {
				const total = (data.referrerAnalytics || []).reduce(
					(s, i) => s + i.totalInteractions,
					0
				);
				const pct =
					total > 0
						? ((item.totalInteractions / total) * 100).toFixed(1)
						: "0.0";
				return [
					item.referrer,
					item.views,
					item.clicks || 0,
					item.totalInteractions,
					pct,
				];
			}),
		});
		doc.save("bionk_metricas.pdf");
	}, [data]);

	const exportToCSV = useCallback(() => {
		if (!data) {
			return;
		}
		function esc(value: any) {
			const s = String(value ?? "");
			if (s.includes(",") || s.includes("\n") || s.includes('"')) {
				return `"${s.replace(/"/g, '""')}"`;
			}
			return s;
		}
		const lines: string[] = [];
		lines.push(
			[
				"Seção",
				"Categoria",
				"Visualizações",
				"Cliques",
				"Total",
				"% do Total",
			].join(",")
		);
		for (const item of data.chartData) {
			lines.push(
				(() => {
					const total = (item.clicks || 0) + (item.views || 0);
					return [
						"Diário",
						esc(formatDate(item.day)),
						esc(item.views),
						esc(item.clicks),
						esc(total),
						"",
					].join(",");
				})()
			);
		}
		const totalDevice = (data.deviceAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.deviceAnalytics || []) {
			const pct =
				totalDevice > 0
					? String(Math.round((item.totalInteractions / totalDevice) * 100))
					: "0";
			lines.push(
				[
					"Dispositivo",
					esc(item.device),
					esc(item.views),
					esc(item.clicks || 0),
					esc(item.totalInteractions),
					esc(pct),
				].join(",")
			);
		}
		const totalOS = (data.osAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.osAnalytics || []) {
			const pct =
				totalOS > 0
					? String(Math.round((item.totalInteractions / totalOS) * 100))
					: "0";
			lines.push(
				[
					"Sistema Operacional",
					esc(item.os),
					esc(item.views),
					esc(item.clicks || 0),
					esc(item.totalInteractions),
					esc(pct),
				].join(",")
			);
		}
		const totalCountry = (data.countryAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.countryAnalytics || []) {
			const pct =
				totalCountry > 0
					? String(Math.round((item.totalInteractions / totalCountry) * 100))
					: "0";
			lines.push(
				[
					"País",
					esc(item.country),
					esc(item.views),
					esc(item.clicks || 0),
					esc(item.totalInteractions),
					esc(pct),
				].join(",")
			);
		}
		const totalRef = (data.referrerAnalytics || []).reduce(
			(sum, i) => sum + i.totalInteractions,
			0
		);
		for (const item of data.referrerAnalytics || []) {
			const pct =
				totalRef > 0
					? String(Math.round((item.totalInteractions / totalRef) * 100))
					: "0";
			lines.push(
				[
					"Origem",
					esc(item.referrer),
					esc(item.views),
					esc(item.clicks || 0),
					esc(item.totalInteractions),
					esc(pct),
				].join(",")
			);
		}
		const csv = lines.join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "bionk_metricas.csv";
		link.click();
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
				onExportToCSV={exportToCSV}
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

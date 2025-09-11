"use client";

import { Monitor, SendToBack, Smartphone } from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OSAnalytics {
	os: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface OSAnalyticsChartProps {
	data: OSAnalytics[];
	isLoading?: boolean;
}

const getOSIcon = (os: string) => {
	switch (os.toLowerCase()) {
		case "ios":
			return <Smartphone className="h-4 w-4" />;
		case "android":
			return <Smartphone className="h-4 w-4" />;
		case "windows":
			return <Monitor className="h-4 w-4" />;
		case "macos":
			return <Monitor className="h-4 w-4" />;
		case "linux":
			return <Monitor className="h-4 w-4" />;
		default:
			return <Monitor className="h-4 w-4" />;
	}
};

const getOSLabel = (os: string) => {
	switch (os.toLowerCase()) {
		case "ios":
			return "iOS";
		case "android":
			return "Android";
		case "windows":
			return "Windows";
		case "macos":
			return "macOS";
		case "linux":
			return "Linux";
		default:
			return "Outros";
	}
};

const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border bg-background p-3 shadow-lg">
				<div className="mb-2 flex items-center gap-2">
					{getOSIcon(label)}
					<span className="font-medium">{getOSLabel(label)}</span>
				</div>
				<div className="space-y-1 text-sm">
					<div className="flex justify-between gap-4">
						<span className="text-blue-600">Visualizações:</span>
						<span className="font-medium">
							{payload[0]?.value?.toLocaleString() || 0}
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="text-green-600">Cliques:</span>
						<span className="font-medium">
							{payload[1]?.value?.toLocaleString() || 0}
						</span>
					</div>
					<div className="flex justify-between gap-4 border-t pt-1">
						<span>Total:</span>
						<span className="font-semibold">
							{(
								(payload[0]?.value || 0) + (payload[1]?.value || 0)
							).toLocaleString()}
						</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
};

export default function OSAnalyticsChart({
	data,
	isLoading,
}: OSAnalyticsChartProps) {
	if (isLoading) {
		return (
			<Card className="dark:border-white/40 dark:bg-neutral-900">
				<CardHeader>
					<CardTitle>Distribuição por Sistema Operacional</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-80 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	// Filtrar dados com interações > 0
	const filteredData = data.filter((item) => item.totalInteractions > 0);
	const totalInteractions = filteredData.reduce(
		(sum, item) => sum + item.totalInteractions,
		0
	);

	const chartData = filteredData.map((item) => ({
		...item,
		name: getOSLabel(item.os),
		percentage:
			totalInteractions > 0
				? ((item.totalInteractions / totalInteractions) * 100).toFixed(1)
				: "0.0",
	}));

	if (chartData.length === 0) {
		return (
			<Card className="dark:border-white/40 dark:bg-neutral-900">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<SendToBack className="h-5 w-5" />
						Distribuição por Sistema Operacional
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
						<SendToBack className="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p className="mb-2 font-medium text-lg">Nenhum dado disponível</p>
						<p className="text-sm">
							Os dados aparecerão conforme as interações forem registradas.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="dark:border-white/40 dark:bg-neutral-900">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<SendToBack className="h-5 w-5" />
					Distribuição por Sistema Operacional
				</CardTitle>
				<p className="text-muted-foreground text-sm">
					Visualizações e cliques por sistema operacional (iOS, Android,
					Desktop)
				</p>
			</CardHeader>
			<CardContent>
				<div className="h-64 sm:h-80">
					<ResponsiveContainer height="100%" width="100%">
						<BarChart
							data={chartData}
							margin={{
								top: 20,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
							<XAxis
								className="text-xs"
								dataKey="name"
								tick={{ fontSize: 12 }}
							/>
							<YAxis className="text-xs" tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomTooltip />} />
							<Legend />
							<Bar
								dataKey="views"
								fill="#3b82f6"
								name="Visualizações"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="clicks"
								fill="#10b981"
								name="Cliques"
								radius={[2, 2, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Resumo estatístico */}
				<div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4 sm:gap-4">
					<div className="p-2 text-center">
						<div className="font-bold text-amber-600 text-lg sm:text-2xl">
							{chartData.length}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Sistemas Operacionais
						</div>
					</div>

					<div className="p-2 text-center">
						<div className="font-bold text-blue-600 text-lg sm:text-2xl">
							{data.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Visualizações
						</div>
					</div>
					<div className="p-2 text-center">
						<div className="font-bold text-green-600 text-lg sm:text-2xl">
							{data
								.reduce((sum, item) => sum + item.clicks, 0)
								.toLocaleString()}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Cliques
						</div>
					</div>
					<div className="p-2 text-center">
						<div className="font-bold text-lg text-primary sm:text-2xl">
							{totalInteractions.toLocaleString()}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Total de Interações
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

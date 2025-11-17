"use client";

import Image from "next/image";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

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

const DEFAULT_OS = [
	"ios",
	"android",
	"windows",
	"macos",
	"linux",
	"unknown",
] as const;

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

export default function OSAnalyticsChart({
	data,
	isLoading,
}: OSAnalyticsChartProps) {
	if (isLoading) {
		return (
			<Card className=" dark:bg-zinc-900">
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

	const getOSIconSrc = (os: string) => {
		const lower = os.toLowerCase();
		if (lower === "ios") {
			return "/icons/apple.svg";
		}
		if (lower === "android") {
			return "/icons/android.svg";
		}
		if (lower === "windows") {
			return "/icons/windows.svg";
		}
		if (lower === "macos") {
			return "/icons/macos.svg";
		}
		if (lower === "linux") {
			return "/icons/linux.svg";
		}
		return "/images/bionk-icon-black.svg";
	};

	const dataMap = new Map(data.map((item) => [item.os.toLowerCase(), item]));
	const baseData = DEFAULT_OS.map((os) => {
		const found = dataMap.get(os);
		const clicks = found?.clicks || 0;
		const views = found?.views || 0;
		const totalInteractions = clicks + views;
		return { os, clicks, views, totalInteractions, name: getOSLabel(os) };
	});
	const totalInteractions = baseData.reduce(
		(sum, item) => sum + item.totalInteractions,
		0
	);
	const chartData = baseData.map((item) => ({
		...item,
		percentage:
			totalInteractions > 0
				? ((item.totalInteractions / totalInteractions) * 100).toFixed(1)
				: "0.0",
	}));

	if (totalInteractions === 0) {
		return (
			<Card className=" dark:bg-zinc-900">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						Distribuição por Sistema Operacional
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
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
		<Card className=" dark:bg-zinc-900">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Distribuição por Sistema Operacional
				</CardTitle>
				<CardDescription>
					Visualizações e cliques por sistema operacional (iOS, Android,
					Desktop)
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="h-64 w-full overflow-hidden sm:h-80">
					<ChartContainer
						className="h-full w-full"
						config={{
							views: {
								label: "Visualizações",
								color: "oklch(0.7521 0.293 221.93)",
							},
							clicks: {
								label: "Cliques",
								color: "oklch(0.7521 0.3054 281.22)",
							},
						}}
					>
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
								<CartesianGrid vertical={false} />
								<XAxis
									axisLine={false}
									dataKey="name"
									tickLine={false}
									tickMargin={10}
								/>
								<ChartTooltip
									content={<ChartTooltipContent indicator="dashed" />}
									cursor={false}
								/>
								<Bar dataKey="views" fill="var(--color-views)" radius={4} />
								<Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
							</BarChart>
						</ResponsiveContainer>
					</ChartContainer>
				</div>

				<div className="mt-6 overflow-x-auto">
					<Table className="min-w-[340px]">
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-[120px]">
									Sistema Operacional
								</TableHead>
								<TableHead className="min-w-[80px] text-right">
									Visualizações
								</TableHead>
								<TableHead className="min-w-[80px] text-right">
									Cliques
								</TableHead>
								<TableHead className="min-w-[80px] text-right">Total</TableHead>
								<TableHead className="hidden min-w-[80px] text-right md:table-cell">
									% do Total
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{chartData
								.slice()
								.filter((item) => item.totalInteractions > 0)
								.sort((a, b) => b.totalInteractions - a.totalInteractions)
								.map((item) => {
									const percentage =
										totalInteractions > 0
											? (
													(item.totalInteractions / totalInteractions) *
													100
												).toFixed(0)
											: "0";
									return (
										<TableRow key={item.os}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
														<Image
															alt={item.name}
															className="h-4 w-4 dark:invert"
															height={16}
															src={getOSIconSrc(item.os)}
															width={16}
														/>
													</div>
													<span>{item.name}</span>
												</div>
											</TableCell>
											<TableCell className="text-right">
												{item.views.toLocaleString()}
											</TableCell>
											<TableCell className="text-right">
												{(item.clicks || 0).toLocaleString()}
											</TableCell>
											<TableCell className="text-right font-semibold">
												{item.totalInteractions.toLocaleString()}
											</TableCell>
											<TableCell className="hidden text-right md:table-cell">
												<div className="flex items-center justify-end gap-2">
													<span className="font-medium">{percentage}%</span>
													<div className="h-2 w-12 overflow-hidden rounded-full bg-muted">
														<div
															className="h-full rounded-full bg-primary transition-all duration-300"
															style={{
																width: `${Math.min(Number.parseFloat(percentage), 100)}%`,
															}}
														/>
													</div>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

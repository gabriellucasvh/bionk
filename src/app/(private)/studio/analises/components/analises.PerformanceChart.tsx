"use client";

import { ChartPie } from "lucide-react";
import React from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
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
import { formatDate } from "@/lib/utils";

interface ChartDataPoint {
	day: string;
	views: number;
	clicks: number;
}

interface PerformanceChartProps {
	chartData: ChartDataPoint[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = React.memo(
	({ chartData }) => {
		return (
			<article>
				<Card className="dark:border-white/40 dark:bg-neutral-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<ChartPie className="h-5 w-5" />
							Visão Geral de Desempenho
						</CardTitle>
						<CardDescription className="dark:text-gray-400">
							Visualize os cliques e as visualizações diárias dos últimos 30
							dias.
						</CardDescription>
					</CardHeader>
					<CardContent className="px-3">
						<div className="h-[300px] w-full overflow-hidden sm:h-[350px] md:h-[400px]">
							<ChartContainer
								className="h-full w-full"
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
							>
								<ResponsiveContainer height="100%" width="100%">
									<LineChart
										data={chartData}
										margin={{ top: 10, right: 10, left: 1, bottom: 10 }}
									>
										<CartesianGrid
											className="stroke-muted dark:stroke-gray-600"
											strokeDasharray="3 3"
										/>
										<XAxis
											axisLine={false}
											className="text-xs dark:text-gray-300"
											dataKey="day"
											tickFormatter={(tick) => formatDate(tick, "dd/MM")}
											tickLine={false}
										/>
										<YAxis
											axisLine={false}
											className="text-xs dark:text-gray-300"
											tickFormatter={(tick) => tick.toString()}
											tickLine={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Line
											activeDot={{ r: 6 }}
											dataKey="views"
											dot={true}
											stroke="var(--color-views)"
											strokeWidth={2}
											type="monotone"
										/>
										<Line
											activeDot={{ r: 6 }}
											dataKey="clicks"
											dot={true}
											stroke="var(--color-clicks)"
											strokeWidth={2}
											type="monotone"
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>
			</article>
		);
	}
);

PerformanceChart.displayName = "PerformanceChart";

export default PerformanceChart;

"use client";

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
				<Card className=" dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							Visão Geral de Desempenho
						</CardTitle>
						<CardDescription className="dark:text-gray-400">
							Visualize cliques e visualizações diárias no período selecionado.
						</CardDescription>
					</CardHeader>
					<CardContent className="-ml-10 pr-5">
						<div className="h-[300px] w-full overflow-hidden sm:h-[350px] md:h-[400px]">
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

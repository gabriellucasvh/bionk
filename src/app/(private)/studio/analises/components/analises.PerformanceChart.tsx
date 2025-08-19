"use client";

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
import React from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

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
				<Card>
					<CardHeader>
						<CardTitle>Visão Geral de Desempenho</CardTitle>
						<CardDescription>
							Visualize os cliques e as visualizações diárias dos últimos 30
							dias.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px] sm:h-[350px] md:h-[400px]">
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
										margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
									>
										<CartesianGrid
											className="stroke-muted"
											strokeDasharray="3 3"
										/>
										<XAxis
											axisLine={false}
											className="text-xs"
											dataKey="day"
											tickFormatter={(tick) => formatDate(tick, "dd/MM")}
											tickLine={false}
										/>
										<YAxis
											axisLine={false}
											className="text-xs"
											tickFormatter={(tick) => tick.toString()}
											tickLine={false}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Line
											activeDot={{ r: 6 }}
											dataKey="views"
											dot={{ r: 4 }}
											stroke="var(--color-views)"
											strokeWidth={2}
											type="monotone"
										/>
										<Line
											activeDot={{ r: 6 }}
											dataKey="clicks"
											dot={{ r: 4 }}
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

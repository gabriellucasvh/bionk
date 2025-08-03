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
								className="h-full w-full"
							>
								<ResponsiveContainer width="100%" height="100%">
									<LineChart
										data={chartData}
										margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											className="stroke-muted"
										/>
										<XAxis
											dataKey="day"
											tickFormatter={(tick) => formatDate(tick, "dd/MM")}
											tickLine={false}
											axisLine={false}
											className="text-xs"
										/>
										<YAxis
											tickFormatter={(tick) => tick.toString()}
											tickLine={false}
											axisLine={false}
											className="text-xs"
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Line
											type="monotone"
											dataKey="views"
											stroke="var(--color-views)"
											strokeWidth={2}
											dot={{ r: 4 }}
											activeDot={{ r: 6 }}
										/>
										<Line
											type="monotone"
											dataKey="clicks"
											stroke="var(--color-clicks)"
											strokeWidth={2}
											dot={{ r: 4 }}
											activeDot={{ r: 6 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						</div>
					</CardContent>
				</Card>
			</article>
		);
	},
);

PerformanceChart.displayName = "PerformanceChart";

export default PerformanceChart;

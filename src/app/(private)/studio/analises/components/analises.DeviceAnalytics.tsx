"use client";

import {
	HelpCircle,
	Monitor,
	PictureInPicture2,
	Smartphone,
	Tablet,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface DeviceAnalytics {
	device: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface DeviceAnalyticsProps {
	data: DeviceAnalytics[];
	isLoading?: boolean;
}

const getDeviceIcon = (device: string) => {
	switch (device.toLowerCase()) {
		case "mobile":
			return <Smartphone className="h-4 w-4" />;
		case "desktop":
			return <Monitor className="h-4 w-4" />;
		case "tablet":
			return <Tablet className="h-4 w-4" />;
		default:
			return <HelpCircle className="h-4 w-4" />;
	}
};

const getDeviceLabel = (device: string) => {
	switch (device.toLowerCase()) {
		case "mobile":
			return "Mobile";
		case "desktop":
			return "Desktop";
		case "tablet":
			return "Tablet";
		case "unknown":
			return "Outros";
		default:
			return device;
	}
};

const DEFAULT_DEVICES = ["mobile", "tablet", "desktop", "unknown"] as const;

export default function DeviceAnalytics({
	data,
	isLoading,
}: DeviceAnalyticsProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PictureInPicture2 className="h-5 w-5" />
						Analytics por Dispositivo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex h-80 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					</div>
				</CardContent>
			</Card>
		);
	}

	const map = new Map(data.map((d) => [d.device.toLowerCase(), d]));
	const baseData = DEFAULT_DEVICES.map((device) => {
		const found = map.get(device);
		const clicks = found?.clicks || 0;
		const views = found?.views || 0;
		const totalInteractions = clicks + views;
		return {
			device,
			clicks,
			views,
			totalInteractions,
			name: getDeviceLabel(device),
		};
	});
	const totalViews = baseData.reduce((sum, i) => sum + i.views, 0);
	const totalClicks = baseData.reduce((sum, i) => sum + i.clicks, 0);
	const chartData = baseData;

	return (
		<Card className=" dark:bg-zinc-900">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<PictureInPicture2 className="h-5 w-5" />
					Analytics por Dispositivo
				</CardTitle>
				<p className="text-muted-foreground text-sm">
					Distribuição de visualizações e cliques por tipo de dispositivo
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
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
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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

				{/* Tabela */}
				<div className="overflow-x-auto">
					<Table className="min-w-[340px]">
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-[120px]">Dispositivo</TableHead>
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
							{data.map((item) => {
								const percentage =
									totalViews + totalClicks > 0
										? (
												(item.totalInteractions / (totalViews + totalClicks)) *
												100
											).toFixed(0)
										: "0";

								return (
									<TableRow key={item.device}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{getDeviceIcon(item.device)}
												<span>{getDeviceLabel(item.device)}</span>
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

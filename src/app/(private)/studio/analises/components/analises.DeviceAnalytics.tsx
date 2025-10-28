"use client";

import {
	HelpCircle,
	Monitor,
	PictureInPicture2,
	Smartphone,
	Tablet,
} from "lucide-react";
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const DEVICE_COLORS = {
	mobile: "#3b82f6", // blue
	desktop: "#10b981", // green
	tablet: "#f59e0b", // amber
	unknown: "#6b7280", // gray
};

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

const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="rounded-lg border bg-background p-3 shadow-lg">
				<div className="mb-2 flex items-center gap-2">
					{getDeviceIcon(data.device)}
					<span className="font-medium">{getDeviceLabel(data.device)}</span>
				</div>
				<div className="space-y-1 text-sm">
					<div className="flex justify-between gap-4">
						<span>Visualizações:</span>
						<span className="font-medium">{data.views.toLocaleString()}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span>Cliques:</span>
						<span className="font-medium">
							{(data.clicks || 0).toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between gap-4 border-t pt-1">
						<span>Total:</span>
						<span className="font-semibold">
							{data.totalInteractions.toLocaleString()}
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span>Porcentagem:</span>
						<span className="font-medium">{data.percentage}%</span>
					</div>
				</div>
			</div>
		);
	}
	return null;
};

const CustomLegend = ({ payload }: any) => {
	return (
		<div className="mt-4 flex flex-wrap justify-center gap-4">
			{payload.map((entry: any, index: number) => (
				<div className="flex items-center gap-2" key={index}>
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<div className="flex items-center gap-1">
						{getDeviceIcon(entry.payload.device)}
						<span className="text-sm">
							{getDeviceLabel(entry.payload.device)}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

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

	// Filtrar dados com interações > 0 e calcular porcentagens
	const filteredData = data.filter((item) => item.totalInteractions > 0);
	const totalInteractions = filteredData.reduce(
		(sum, item) => sum + item.totalInteractions,
		0
	);
	const totalViews = data.reduce((sum, item) => sum + item.views, 0);
	const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

	const chartData = filteredData.map((item) => ({
		...item,
		name: getDeviceLabel(item.device),
		percentage:
			totalInteractions > 0
				? ((item.totalInteractions / totalInteractions) * 100).toFixed(1)
				: "0.0",
	}));

	if (chartData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<PictureInPicture2 className="h-5 w-5" />
						Analytics por Dispositivo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
						<PictureInPicture2 className="mx-auto mb-4 h-16 w-16 opacity-50" />
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
		<Card className="dark:border-white/40 dark:bg-zinc-900">
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
				{/* Gráfico */}
				<div className="h-64 w-full overflow-hidden sm:h-80">
					<ResponsiveContainer height="100%" width="100%">
						<PieChart>
							<Pie
								className="sm:!r-[60px] sm:!R-[120px]"
								cx="50%"
								cy="50%"
								data={chartData}
								dataKey="totalInteractions"
								innerRadius={40}
								outerRadius={80}
								paddingAngle={2}
							>
								{chartData.map((entry, index) => (
									<Cell
										fill={
											DEVICE_COLORS[
												entry.device as keyof typeof DEVICE_COLORS
											] || DEVICE_COLORS.unknown
										}
										key={`cell-${index}`}
									/>
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
							<Legend content={<CustomLegend />} />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Tabela */}
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="min-w-[120px]">Dispositivo</TableHead>
								<TableHead className="hidden min-w-[80px] text-right sm:table-cell">
									Visualizações
								</TableHead>
								<TableHead className="hidden min-w-[80px] text-right sm:table-cell">
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
											).toFixed(1)
										: "0.0";

								return (
									<TableRow key={item.device}>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{getDeviceIcon(item.device)}
												<span>{getDeviceLabel(item.device)}</span>
												<div
													className="h-3 w-3 rounded-full"
													style={{
														backgroundColor:
															DEVICE_COLORS[
																item.device as keyof typeof DEVICE_COLORS
															] || DEVICE_COLORS.unknown,
													}}
												/>
											</div>
										</TableCell>
										<TableCell className="hidden text-right sm:table-cell">
												{item.views.toLocaleString()}
										</TableCell>
										<TableCell className="hidden text-right sm:table-cell">
												{(item.clicks || 0).toLocaleString()}
										</TableCell>
										<TableCell className="text-right font-semibold">
											{item.totalInteractions.toLocaleString()}
										</TableCell>
										<TableCell className="hidden text-right text-muted-foreground md:table-cell">
											{percentage}%
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>

				{/* Resumo estatístico */}
				<div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4 sm:gap-4">
					<div className="p-2 text-center">
						<div className="font-bold text-amber-600 text-lg sm:text-2xl">
							{chartData.length}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Tipos de Dispositivo
						</div>
					</div>

					<div className="p-2 text-center">
						<div className="font-bold text-blue-600 text-lg sm:text-2xl">
							{totalViews.toLocaleString()}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Visualizações
						</div>
					</div>
					<div className="p-2 text-center">
						<div className="font-bold text-green-600 text-lg sm:text-2xl">
							{totalClicks.toLocaleString()}
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

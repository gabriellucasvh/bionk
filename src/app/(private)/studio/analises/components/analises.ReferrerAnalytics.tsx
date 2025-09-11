"use client";

import { ExternalLink, Globe, HelpCircle, Radar, Search } from "lucide-react";
import Image from "next/image";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface ReferrerAnalytics {
	referrer: string;
	views: number;
	clicks: number;
	totalInteractions: number;
}

interface ReferrerAnalyticsProps {
	data: ReferrerAnalytics[];
	isLoading?: boolean;
}

const REFERRER_COLORS = {
	Instagram: "#E4405F",
	TikTok: "#000000",
	"Twitter/X": "#1DA1F2",
	Facebook: "#1877F2",
	YouTube: "#FF0000",
	LinkedIn: "#0A66C2",
	WhatsApp: "#25D366",
	Telegram: "#0088CC",
	Discord: "#5865F2",
	Reddit: "#FF4500",
	Pinterest: "#BD081C",
	Google: "#4285F4",
	Bing: "#00809D",
	DuckDuckGo: "#DE5833",
	Yahoo: "#720E9E",
	direct: "#10b981",
	unknown: "#6b7280",
	other: "#8b5cf6",
};

const getReferrerIcon = (referrer: string) => {
	switch (referrer) {
		case "Instagram":
			return (
				<Image
					alt="Instagram"
					className="h-4 w-4"
					height={16}
					src="/icons/instagram.svg"
					width={16}
				/>
			);
		case "Twitter/X":
			return (
				<Image
					alt="X (Twitter)"
					className="h-4 w-4"
					height={16}
					src="/icons/x.svg"
					width={16}
				/>
			);
		case "Facebook":
			return (
				<Image
					alt="Facebook"
					className="h-4 w-4"
					height={16}
					src="/icons/facebook.svg"
					width={16}
				/>
			);
		case "YouTube":
			return (
				<Image
					alt="YouTube"
					className="h-4 w-4"
					height={16}
					src="/icons/youtube.svg"
					width={16}
				/>
			);
		case "LinkedIn":
			return (
				<Image
					alt="LinkedIn"
					className="h-4 w-4"
					height={16}
					src="/icons/linkedin.svg"
					width={16}
				/>
			);
		case "WhatsApp":
			return (
				<Image
					alt="WhatsApp"
					className="h-4 w-4"
					height={16}
					src="/icons/whatsapp.svg"
					width={16}
				/>
			);
		case "Telegram":
			return (
				<Image
					alt="Telegram"
					className="h-4 w-4"
					height={16}
					src="/icons/telegram.svg"
					width={16}
				/>
			);
		case "Discord":
			return (
				<Image
					alt="Discord"
					className="h-4 w-4"
					height={16}
					src="/icons/discord.svg"
					width={16}
				/>
			);
		case "TikTok":
			return (
				<Image
					alt="TikTok"
					className="h-4 w-4"
					height={16}
					src="/icons/tiktok.svg"
					width={16}
				/>
			);
		case "Reddit":
			return (
				<Image
					alt="Reddit"
					className="h-4 w-4"
					height={16}
					src="/icons/reddit.svg"
					width={16}
				/>
			);
		case "Pinterest":
			return (
				<Image
					alt="Pinterest"
					className="h-4 w-4"
					height={16}
					src="/icons/pinterest.svg"
					width={16}
				/>
			);
		case "Google":
		case "Bing":
		case "DuckDuckGo":
		case "Yahoo":
			return <Search className="h-4 w-4" />;
		case "direct":
			return <Globe className="h-4 w-4" />;
		case "unknown":
			return <HelpCircle className="h-4 w-4" />;
		default:
			return <ExternalLink className="h-4 w-4" />;
	}
};

const getReferrerLabel = (referrer: string) => {
	switch (referrer) {
		case "direct":
			return "Acesso Direto";
		case "unknown":
			return "Outros";
		default:
			return referrer;
	}
};

const getReferrerColor = (referrer: string): string => {
	return (
		REFERRER_COLORS[referrer as keyof typeof REFERRER_COLORS] ||
		REFERRER_COLORS.other
	);
};

const getReferrerBadgeVariant = (referrer: string) => {
	switch (referrer) {
		case "Instagram":
		case "TikTok":
		case "Facebook":
		case "Twitter/X":
			return "default" as const;
		case "Google":
		case "Bing":
		case "DuckDuckGo":
		case "Yahoo":
			return "secondary" as const;
		case "direct":
			return "outline" as const;
		default:
			return "secondary" as const;
	}
};

const getReferrerCategory = (referrer: string): string => {
	if (referrer === "direct") {
		return "Direto";
	}
	if (referrer === "unknown") {
		return "Outros";
	}
	if (referrer.includes("Google") || referrer.includes("Bing")) {
		return "Busca";
	}
	if (
		referrer.includes("Instagram") ||
		referrer.includes("TikTok") ||
		referrer.includes("Facebook")
	) {
		return "Social";
	}
	return "Outros";
};

const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="rounded-lg border bg-background p-3 shadow-lg">
				<div className="mb-2 flex items-center gap-2">
					{getReferrerIcon(data.referrer)}
					<p className="font-medium">{getReferrerLabel(data.referrer)}</p>
				</div>
				<div className="space-y-1 text-sm">
					<p className="text-muted-foreground">
						<span className="font-medium">Cliques:</span>{" "}
						{data.clicks.toLocaleString()}
					</p>
					<p className="text-muted-foreground">
						<span className="font-medium">Visualizações:</span>{" "}
						{data.views.toLocaleString()}
					</p>
					<p className="font-medium">
						<span>Total:</span> {data.totalInteractions.toLocaleString()}
					</p>
					<p className="text-muted-foreground text-xs">
						{((data.totalInteractions / data.total) * 100).toFixed(1)}% do total
					</p>
				</div>
			</div>
		);
	}
	return null;
};

const CustomLegend = ({ payload }: any) => {
	return (
		<div className="mt-4 flex flex-wrap justify-center gap-4">
			{payload?.map((entry: any, index: number) => (
				<div className="flex items-center gap-2" key={index}>
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: entry.color }}
					/>
					<div className="flex items-center gap-1">
						{getReferrerIcon(entry.payload.referrer)}
						<span className="text-sm">
							{getReferrerLabel(entry.payload.referrer)}
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default function ReferrerAnalytics({
	data,
	isLoading,
}: ReferrerAnalyticsProps) {
	if (isLoading) {
		return (
			<Card className="dark:border-white/40 dark:bg-neutral-900">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Radar className="h-5 w-5" />
						Analytics de Origem do Tráfego
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

	if (!data || data.length === 0) {
		return (
			<Card className="dark:border-white/40 dark:bg-neutral-900">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Radar className="h-5 w-5" />
						Analytics de Origem do Tráfego
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-12 text-center text-muted-foreground">
						<Radar className="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p className="mb-2 font-medium text-lg">Nenhum dado disponível</p>
						<p className="text-sm">
							Os dados de origem aparecerão aqui quando houver interações
						</p>
						<p className="mt-2 text-muted-foreground text-xs">
							Debug: Data = {JSON.stringify(data)}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Calcular totais para percentuais
	const totalInteractions = data.reduce(
		(sum, item) => sum + item.totalInteractions,
		0
	);
	const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
	const totalViews = data.reduce((sum, item) => sum + item.views, 0);

	// Preparar dados para o gráfico
	const chartData = data.map((item) => ({
		...item,
		name: getReferrerLabel(item.referrer),
		fill: getReferrerColor(item.referrer),
		total: totalInteractions,
	}));

	// Ordenar por total de interações (decrescente)
	const sortedData = [...data].sort(
		(a, b) => b.totalInteractions - a.totalInteractions
	);

	// Determinar se usar gráfico de pizza ou barra baseado na quantidade de dados
	const useBarChart = data.length > 6;

	return (
		<Card className="dark:border-white/40 dark:bg-neutral-900">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Radar className="h-5 w-5" />
						Analytics de Origem do Tráfego
					</div>
				</CardTitle>
				<p className="text-muted-foreground text-sm">
					De onde seus visitantes estão vindo - análise completa por origem
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Gráfico */}
				<div className="h-80 w-full overflow-hidden">
					<ResponsiveContainer height="100%" width="100%">
						{useBarChart ? (
							<BarChart
								data={chartData}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid className="opacity-30" strokeDasharray="3 3" />
								<XAxis
									angle={-45}
									dataKey="name"
									height={80}
									textAnchor="end"
									tick={{ fontSize: 12 }}
								/>
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip content={<CustomTooltip />} />
								<Bar dataKey="totalInteractions" radius={[4, 4, 0, 0]}>
									{chartData.map((entry, index) => (
										<Cell fill={entry.fill} key={`cell-${index}`} />
									))}
								</Bar>
							</BarChart>
						) : (
							<PieChart>
								<Pie
									cx="50%"
									cy="50%"
									data={chartData}
									dataKey="totalInteractions"
									innerRadius={60}
									outerRadius={120}
									paddingAngle={2}
								>
									{chartData.map((entry, index) => (
										<Cell fill={entry.fill} key={`cell-${index}`} />
									))}
								</Pie>
								<Tooltip content={<CustomTooltip />} />
								<Legend content={<CustomLegend />} />
							</PieChart>
						)}
					</ResponsiveContainer>
				</div>

				{/* Tabela */}
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Origem</TableHead>
								<TableHead className="text-right">Visualizações</TableHead>
								<TableHead className="text-right">Cliques</TableHead>
								<TableHead className="text-right">Total</TableHead>
								<TableHead className="text-right">% do Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedData.map((item, index) => {
								const percentage =
									totalInteractions > 0
										? (
												(item.totalInteractions / totalInteractions) *
												100
											).toFixed(1)
										: "0.0";

								return (
									<TableRow key={`${item.referrer}-${index}`}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
													{getReferrerIcon(item.referrer)}
												</div>
												<div>
													<div className="font-medium">
														{getReferrerLabel(item.referrer)}
													</div>
													<Badge
														className="mt-1 text-xs"
														variant={getReferrerBadgeVariant(item.referrer)}
													>
														{getReferrerCategory(item.referrer)}
													</Badge>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right font-mono">
											{item.views.toLocaleString()}
										</TableCell>
										<TableCell className="text-right font-mono">
											{item.clicks.toLocaleString()}
										</TableCell>
										<TableCell className="text-right font-medium font-mono">
											{item.totalInteractions.toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
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

				{/* Resumo estatístico */}
				<div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-4 sm:gap-4">
					<div className="p-2 text-center">
						<div className="font-bold text-amber-600 text-lg sm:text-2xl">
							{data.length}
						</div>
						<div className="text-muted-foreground text-xs sm:text-sm">
							Fontes de Tráfego
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

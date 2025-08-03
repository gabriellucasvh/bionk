"use client";

import { Eye, MousePointerClick, Percent } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsStatsCardsProps {
	totalProfileViews: number;
	totalClicks: number;
	performanceRate: string;
}

const AnalyticsStatsCards: React.FC<AnalyticsStatsCardsProps> = React.memo(
	({ totalProfileViews, totalClicks, performanceRate }) => {
		return (
			<article className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total de Visualizações do Perfil
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="text-2xl flex items-center gap-2 font-bold">
								<div className="p-2 rounded-full bg-green-50 text-green-500">
									<Eye />
								</div>
								{totalProfileViews.toLocaleString()}
							</span>
						</div>
						<p className="text-xs text-muted-foreground">vs. mês anterior</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total de Cliques nos Links
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="text-2xl flex items-center gap-2 font-bold">
								<div className="p-2 rounded-full bg-green-50 text-green-500">
									<MousePointerClick />
								</div>
								{totalClicks.toLocaleString()}
							</span>
						</div>
						<p className="text-xs text-muted-foreground">vs. mês anterior</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Taxa de Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="text-2xl flex items-center gap-2 font-bold">
								<div className="p-2 rounded-full bg-green-50 text-green-500">
									<Percent />
								</div>
								{parseFloat(performanceRate).toLocaleString("pt-BR", {
									minimumFractionDigits: 0,
									maximumFractionDigits: 1,
								})}
								%
							</span>
						</div>
						<p className="text-xs text-muted-foreground">vs. mês anterior</p>
					</CardContent>
				</Card>
			</article>
		);
	},
);

AnalyticsStatsCards.displayName = "AnalyticsStatsCards";

export default AnalyticsStatsCards;

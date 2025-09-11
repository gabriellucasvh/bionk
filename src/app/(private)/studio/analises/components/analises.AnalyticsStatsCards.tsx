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
				<Card className="dark:border-white/40 dark:bg-neutral-900">
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm dark:text-white">
							Total de Visualizações do Perfil
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-2 font-bold text-2xl dark:text-white">
								<div className="rounded-full bg-green-50 p-2 text-green-500 dark:bg-green-900 dark:text-green-400">
									<Eye />
								</div>
								{totalProfileViews.toLocaleString()}
							</span>
						</div>
						<p className="text-muted-foreground text-xs dark:text-gray-400">
							vs. mês anterior
						</p>
					</CardContent>
				</Card>

				<Card className="dark:border-white/40 dark:bg-neutral-900">
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm dark:text-white">
							Total de Cliques nos Links
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-2 font-bold text-2xl dark:text-white">
								<div className="rounded-full bg-green-50 p-2 text-green-500 dark:bg-green-900 dark:text-green-400">
									<MousePointerClick />
								</div>
								{totalClicks.toLocaleString()}
							</span>
						</div>
						<p className="text-muted-foreground text-xs dark:text-gray-400">
							vs. mês anterior
						</p>
					</CardContent>
				</Card>

				<Card className="dark:border-white/40 dark:bg-neutral-900">
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-muted-foreground text-sm dark:text-white">
							Taxa de Performance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-2 font-bold text-2xl dark:text-white">
								<div className="rounded-full bg-green-50 p-2 text-green-500 dark:bg-green-900 dark:text-green-400">
									<Percent />
								</div>
								{Number.parseFloat(performanceRate).toLocaleString("pt-BR", {
									minimumFractionDigits: 0,
									maximumFractionDigits: 1,
								})}
								%
							</span>
						</div>
						<p className="text-muted-foreground text-xs dark:text-gray-400">
							vs. mês anterior
						</p>
					</CardContent>
				</Card>
			</article>
		);
	}
);

AnalyticsStatsCards.displayName = "AnalyticsStatsCards";

export default AnalyticsStatsCards;

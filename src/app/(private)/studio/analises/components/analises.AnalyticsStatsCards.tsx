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
			<article className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
				<Card className=" dark:bg-zinc-900">
					<CardHeader className="pb-1 sm:pb-2">
						<CardTitle className="font-medium text-muted-foreground text-xs sm:text-sm dark:text-white">
							Total de Visualizações do Perfil
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-1 sm:pt-2">
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-1 font-bold text-lg sm:gap-2 sm:text-2xl dark:text-white">
								<div className="rounded-full bg-blue-50 p-1 text-sky-500 sm:p-2 dark:bg-sky-950 dark:text-sky-400">
									<Eye className="h-4 w-4 sm:h-5 sm:w-5" />
								</div>
								{totalProfileViews.toLocaleString()}
							</span>
						</div>
						<p className="text-muted-foreground text-xs dark:text-gray-400">
							vs. mês anterior
						</p>
					</CardContent>
				</Card>

				<Card className=" dark:bg-zinc-900">
					<CardHeader className="pb-1 sm:pb-2">
						<CardTitle className="font-medium text-muted-foreground text-xs sm:text-sm dark:text-white">
							Total de Cliques nos Links
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-1 sm:pt-2">
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-1 font-bold text-lg sm:gap-2 sm:text-2xl dark:text-white">
								<div className="rounded-full bg-blue-50 p-1 text-sky-500 sm:p-2 dark:bg-sky-950 dark:text-sky-400">
									<MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5" />
								</div>
								{totalClicks.toLocaleString()}
							</span>
						</div>
						<p className="text-muted-foreground text-xs dark:text-gray-400">
							vs. mês anterior
						</p>
					</CardContent>
				</Card>

				<Card className=" dark:bg-zinc-900">
					<CardHeader className="pb-1 sm:pb-2">
						<CardTitle className="font-medium text-muted-foreground text-xs sm:text-sm dark:text-white">
							Taxa de Performance
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-1 sm:pt-2">
						<div className="flex items-baseline justify-between">
							<span className="flex items-center gap-1 font-bold text-lg sm:gap-2 sm:text-2xl dark:text-white">
								<div className="rounded-full bg-blue-50 p-1 text-sky-500 sm:p-2 dark:bg-sky-950 dark:text-sky-400">
									<Percent className="h-4 w-4 sm:h-5 sm:w-5" />
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

"use client";

import {
	CalendarRange,
	FileSpreadsheet,
	FileText,
	LayoutDashboard as LayoutStudio,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import "react-day-picker/dist/style.css";
import { ProButton } from "@/components/buttons/ProButton";
import { cn } from "@/lib/utils";

type Plan = "free" | "basic" | "pro" | "ultra";
type RangeKey = "7d" | "30d" | "90d" | "365d" | "tudo";

interface AnalyticsHeaderProps {
	plan: Plan;
	range: RangeKey;
	onRangeChange: (range: RangeKey) => void;
	onExportToExcel: () => void;
	onExportToPDF: () => void;
	customStart?: Date | null;
	customEnd?: Date | null;
	onCustomRangeChange?: (start: Date | null, end: Date | null) => void;
}

const RANGE_LABEL: Record<RangeKey, string> = {
	"7d": "Últimos 7 dias",
	"30d": "Últimos 30 dias",
	"90d": "Últimos 90 dias",
	"365d": "Últimos 365 dias",
	// Usamos "tudo" como chave interna para customização de período
	// mas exibimos como "Personalizar período"
	tudo: "Personalizar período",
};

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = React.memo(
	({
		plan,
		range,
		onRangeChange,
		onExportToExcel,
		onExportToPDF,
		customStart,
		customEnd,
		onCustomRangeChange,
	}) => {
		const [customOpen, setCustomOpen] = useState(false);
		const now = new Date();
		const currentYear = now.getFullYear();
		const years = useMemo(() => {
			const arr: number[] = [];
			for (let y = 2025; y <= currentYear; y++) {
				arr.push(y);
			}
			return arr;
		}, [currentYear]);

		// Mantemos todas as opções sempre visíveis; disponibilidade controlada pelo plano

		type PeriodOption = "7d" | "30d" | "90d" | "365d" | "custom";
		const PLAN_RANK: Record<Plan, number> = {
			free: 0,
			basic: 1,
			pro: 2,
			ultra: 3,
		};
		const PERIOD_REQUIRED_RANK: Record<PeriodOption, number> = {
			"7d": 0,
			"30d": 0,
			"90d": 1,
			"365d": 2,
			custom: 3,
		};
		const PLAN_BY_RANK: Record<number, Plan> = {
			0: "free",
			1: "basic",
			2: "pro",
			3: "ultra",
		};
		const isPeriodAvailable = (p: Plan, option: PeriodOption) =>
			PLAN_RANK[p] >= PERIOD_REQUIRED_RANK[option];
		const disabledItemClasses = (disabled: boolean) =>
			cn(disabled && "cursor-not-allowed select-none");

		const labelFromPlan = (p: Plan) =>
			p === "free"
				? "Free"
				: p === "basic"
					? "Basic"
					: p === "pro"
						? "Pro"
						: "Ultra";

		const onSelectMonthYear = (year: number, monthIndex: number) => {
			if (!onCustomRangeChange) {
				return;
			}
			const start = new Date(year, monthIndex, 1);
			const end = new Date(year, monthIndex + 1, 0);
			onRangeChange("tudo");
			onCustomRangeChange(start, end);
		};

		return (
			<header className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
				<h2 className="font-bold text-xl sm:text-2xl">Análises</h2>
				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					{/* Seletor de intervalo */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="select-none text-xs sm:text-sm"
								size="sm"
								variant="outline"
							>
								<CalendarRange className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								{RANGE_LABEL[range]}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48 sm:w-56">
							{/* 7d */}
							{(() => {
								const enabled = isPeriodAvailable(plan, "7d");
								return (
									<DropdownMenuItem
										aria-disabled={!enabled}
										className={cn(
											"text-xs sm:text-sm",
											"flex items-center justify-between gap-2",
											!enabled && disabledItemClasses(true)
										)}
										onClick={() => enabled && onRangeChange("7d")}
									>
										<span className={cn(!enabled && "text-muted-foreground")}>
											{RANGE_LABEL["7d"]}
										</span>
										{!enabled && (
											<ProButton
												href="/planos"
												label={labelFromPlan(
													PLAN_BY_RANK[PERIOD_REQUIRED_RANK["7d"]]
												)}
												showOverlayTooltip={false}
												size="xs"
												tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK["7d"]])}`}
											/>
										)}
									</DropdownMenuItem>
								);
							})()}
							{/* 30d */}
							{(() => {
								const enabled = isPeriodAvailable(plan, "30d");
								return (
									<DropdownMenuItem
										aria-disabled={!enabled}
										className={cn(
											"text-xs sm:text-sm",
											"flex items-center justify-between gap-2",
											!enabled && disabledItemClasses(true)
										)}
										onClick={() => enabled && onRangeChange("30d")}
									>
										<span className={cn(!enabled && "text-muted-foreground")}>
											{RANGE_LABEL["30d"]}
										</span>
										{!enabled && (
											<ProButton
												href="/planos"
												label={labelFromPlan(
													PLAN_BY_RANK[PERIOD_REQUIRED_RANK["30d"]]
												)}
												showOverlayTooltip={false}
												size="xs"
												tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK["30d"]])}`}
											/>
										)}
									</DropdownMenuItem>
								);
							})()}
							{/* 90d */}
							{(() => {
								const enabled = isPeriodAvailable(plan, "90d");
								return (
									<DropdownMenuItem
										aria-disabled={!enabled}
										className={cn(
											"text-xs sm:text-sm",
											"flex items-center justify-between gap-2",
											!enabled && disabledItemClasses(true)
										)}
										onClick={() => enabled && onRangeChange("90d")}
									>
										<span className={cn(!enabled && "text-muted-foreground")}>
											{RANGE_LABEL["90d"]}
										</span>
										{!enabled && (
											<ProButton
												href="/planos"
												label="Pro"
												showOverlayTooltip={false}
												size="xs"
												tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK["90d"]])}`}
											/>
										)}
									</DropdownMenuItem>
								);
							})()}
							{/* 365d */}
							{(() => {
								const enabled = isPeriodAvailable(plan, "365d");
								return (
									<DropdownMenuItem
										aria-disabled={!enabled}
										className={cn(
											"text-xs sm:text-sm",
											"flex items-center justify-between gap-2",
											!enabled && disabledItemClasses(true)
										)}
										onClick={() => enabled && onRangeChange("365d")}
									>
										<span className={cn(!enabled && "text-muted-foreground")}>
											{RANGE_LABEL["365d"]}
										</span>
										{!enabled && (
											<ProButton
												href="/planos"
												label="Pro"
												showOverlayTooltip={false}
												size="xs"
												tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK["365d"]])}`}
											/>
										)}
									</DropdownMenuItem>
								);
							})()}
							{/* Personalizar período (custom) */}
							{(() => {
								const enabled = isPeriodAvailable(plan, "custom");
								return (
									<DropdownMenuItem
										aria-disabled={!enabled}
										className={cn(
											"text-xs sm:text-sm",
											"flex items-center justify-between gap-2",
											!enabled && disabledItemClasses(true)
										)}
										onClick={() => {
											if (!enabled) {
												return;
											}
											setCustomOpen(true);
										}}
									>
										<span className={cn(!enabled && "text-muted-foreground")}>
											Personalizar período…
										</span>
										{!enabled && (
											<ProButton
												href="/planos"
                                                label="Pro"
												showOverlayTooltip={false}
												size="xs"
                                                tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK.custom])}`}
											/>
										)}
									</DropdownMenuItem>
								);
							})()}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Popover de customização (apenas abre quando permitido) */}
					<Popover onOpenChange={setCustomOpen} open={customOpen}>
						<PopoverTrigger asChild>
							<span />
						</PopoverTrigger>
						<PopoverContent align="end" className="w-[320px] sm:w-[500px]">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Select
										onValueChange={(y) =>
											onSelectMonthYear(Number(y), customStart?.getMonth() ?? 0)
										}
									>
										<SelectTrigger className="w-28">
											<SelectValue placeholder="Ano" />
										</SelectTrigger>
										<SelectContent>
											{years.map((y) => (
												<SelectItem key={y} value={String(y)}>
													{y}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										onValueChange={(m) =>
											onSelectMonthYear(
												customStart?.getFullYear() ?? currentYear,
												Number(m)
											)
										}
									>
										<SelectTrigger className="w-36">
											<SelectValue placeholder="Mês" />
										</SelectTrigger>
										<SelectContent>
											{[
												"Jan",
												"Fev",
												"Mar",
												"Abr",
												"Mai",
												"Jun",
												"Jul",
												"Ago",
												"Set",
												"Out",
												"Nov",
												"Dez",
											].map((name, idx) => (
												<SelectItem key={name} value={String(idx)}>
													{name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<DayPicker
										mode="range"
										onSelect={(rangeSel) => {
											if (!onCustomRangeChange) {
												return;
											}
											onRangeChange("tudo");
											onCustomRangeChange(
												rangeSel?.from ?? null,
												rangeSel?.to ?? null
											);
										}}
										selected={
											customStart && customEnd
												? { from: customStart, to: customEnd }
												: undefined
										}
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										onClick={() => setCustomOpen(false)}
										size="sm"
										variant="outline"
									>
										Fechar
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>

					{/* Exportações */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="select-none text-xs sm:text-sm"
								size="sm"
								variant="outline"
							>
								<LayoutStudio className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								Exportar
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-36 sm:w-40">
							<DropdownMenuItem
								className="cursor-pointer text-xs sm:text-sm"
								onClick={onExportToExcel}
							>
								<FileSpreadsheet className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								<span className="hidden sm:inline">Exportar para </span>Excel
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer text-xs sm:text-sm"
								onClick={onExportToPDF}
							>
								<FileText className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								<span className="hidden sm:inline">Exportar para </span>PDF
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		);
	}
);

AnalyticsHeader.displayName = "AnalyticsHeader";

export default AnalyticsHeader;

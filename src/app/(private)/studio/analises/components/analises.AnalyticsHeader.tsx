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
	tudo: "Vida toda",
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

		const allowedRanges = useMemo<RangeKey[]>(() => {
			switch (plan) {
				case "free":
					return ["7d", "30d"];
				case "basic":
					return ["7d", "30d", "90d"];
				case "pro":
					return ["7d", "30d", "90d", "365d"];
				case "ultra":
					return ["7d", "30d", "90d", "365d", "tudo"];
				default:
					return ["30d"];
			}
		}, [plan]);

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
								className="text-xs sm:text-sm"
								size="sm"
								variant="outline"
							>
								<CalendarRange className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								{RANGE_LABEL[range]}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48 sm:w-56">
							{allowedRanges.map((r) => (
								<DropdownMenuItem
									className="cursor-pointer text-xs sm:text-sm"
									key={r}
									onClick={() => onRangeChange(r)}
								>
									{RANGE_LABEL[r]}
								</DropdownMenuItem>
							))}
							{plan === "ultra" && (
								<DropdownMenuItem
									className="cursor-pointer text-xs sm:text-sm"
									onClick={() => setCustomOpen(true)}
								>
									Customizar período…
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Popover de customização para Ultra */}
					{plan === "ultra" && (
						<Popover onOpenChange={setCustomOpen} open={customOpen}>
							<PopoverTrigger asChild>
								<span />
							</PopoverTrigger>
							<PopoverContent align="end" className="w-[320px] sm:w-[500px]">
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<Select
											onValueChange={(y) =>
												onSelectMonthYear(
													Number(y),
													customStart?.getMonth() ?? 0
												)
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
					)}

					{/* Exportações */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="text-xs sm:text-sm"
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

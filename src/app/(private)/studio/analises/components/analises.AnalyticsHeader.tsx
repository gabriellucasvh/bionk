"use client";

import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
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
import ExportOptions from "./analises.ExportOptions";
import PeriodSelector from "./analises.PeriodSelector";

type Plan = "free" | "basic" | "pro" | "ultra";
type RangeKey = "7d" | "30d" | "90d" | "365d" | "tudo";

interface AnalyticsHeaderProps {
	plan: Plan;
	range: RangeKey;
	onRangeChange: (range: RangeKey) => void;
	onExportToExcel: () => void;
	onExportToPDF: () => void;
	onExportToCSV: () => void;
	customStart?: Date | null;
	customEnd?: Date | null;
	onCustomRangeChange?: (start: Date | null, end: Date | null) => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = React.memo(
	({
		plan,
		range,
		onRangeChange,
		onExportToExcel,
		onExportToPDF,
		onExportToCSV,
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
				<div className="flex w-full flex-row justify-between gap-2 sm:w-auto">
					<PeriodSelector
						customEnd={customEnd}
						customStart={customStart}
						onCustomRangeChange={(start, end) => {
							if (!onCustomRangeChange) {
								return;
							}
							onRangeChange("tudo");
							onCustomRangeChange(start, end);
						}}
						onOpenCustom={() => setCustomOpen(true)}
						onRangeChange={onRangeChange}
						plan={plan}
						range={range}
					/>

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

					<ExportOptions
						onExportToCSV={onExportToCSV}
						onExportToExcel={onExportToExcel}
						onExportToPDF={onExportToPDF}
					/>
				</div>
			</header>
		);
	}
);

AnalyticsHeader.displayName = "AnalyticsHeader";

export default AnalyticsHeader;

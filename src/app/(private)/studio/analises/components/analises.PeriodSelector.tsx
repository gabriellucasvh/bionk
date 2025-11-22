"use client";

import { CalendarRange, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { BaseButton } from "@/components/buttons/BaseButton";
import { ProButton } from "@/components/buttons/ProButton";
import { BottomSheet, BottomSheetContent } from "@/components/ui/bottom-sheet";
import { DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Plan = "free" | "basic" | "pro" | "ultra";
type RangeKey = "7d" | "30d" | "90d" | "365d" | "tudo";

interface PeriodSelectorProps {
	plan: Plan;
	range: RangeKey;
	onRangeChange: (range: RangeKey) => void;
	onOpenCustom?: () => void;
	customStart?: Date | null;
	customEnd?: Date | null;
	onCustomRangeChange?: (start: Date | null, end: Date | null) => void;
}

export default function PeriodSelector({
	plan,
	range,
	onRangeChange,
	onOpenCustom,
	customStart,
	customEnd,
	onCustomRangeChange,
}: PeriodSelectorProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [showCustomMobile, setShowCustomMobile] = useState(false);

	const RANGE_LABEL: Record<RangeKey, string> = {
		"7d": "Últimos 7 dias",
		"30d": "Últimos 30 dias",
		"90d": "Últimos 90 dias",
		"365d": "Últimos 365 dias",
		tudo: "Personalizar período",
	};

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
		<div className="flex">
			<div className="sm:hidden">
				<BottomSheet onOpenChange={setMobileOpen} open={mobileOpen}>
					<BaseButton
						className="select-none rounded-xl bg-black text-white text-xs hover:bg-black/80 dark:bg-white dark:text-black"
						onClick={() => setMobileOpen(true)}
						type="button"
					>
						<CalendarRange className="mr-1 h-3 w-3" />
						{RANGE_LABEL[range]}
						<ChevronDown className="mr-1 ml-2 h-4 w-4" />
					</BaseButton>
					<BottomSheetContent>
						<DialogTitle className="py-3 font-semibold text-base">
							Período
						</DialogTitle>
						<div className="space-y-2">
							{(["7d", "30d", "90d", "365d"] as const).map((key) => {
								const enabled = isPeriodAvailable(plan, key as PeriodOption);
								return (
									<div
										className={cn(
											"flex w-full items-center justify-between gap-2",
											!enabled && "opacity-60"
										)}
										key={key}
									>
										<button
											className={cn(
												"flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm",
												"min-w-0"
											)}
											disabled={!enabled}
											onClick={() => {
												if (!enabled) {
													return;
												}
												onRangeChange(key as RangeKey);
												setMobileOpen(false);
											}}
											type="button"
										>
											<span className="truncate">
												{RANGE_LABEL[key as RangeKey]}
											</span>
										</button>
										{!enabled && (
											<ProButton
												href="/planos"
												label={labelFromPlan(
													PLAN_BY_RANK[
														PERIOD_REQUIRED_RANK[key as PeriodOption]
													]
												)}
												showOverlayTooltip={false}
												size="xs"
												tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK[key as PeriodOption]])}`}
											/>
										)}
									</div>
								);
							})}
							{(() => {
								const enabled = isPeriodAvailable(plan, "custom");
								return (
									<div>
										<div
											className={cn(
												"flex w-full items-center justify-between gap-2",
												!enabled && "opacity-60"
											)}
										>
											<button
												className={cn(
													"flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm",
													"min-w-0"
												)}
												disabled={!enabled}
												onClick={() => {
													if (!enabled) {
														return;
													}
													setShowCustomMobile(true);
												}}
												type="button"
											>
												<span className="truncate">Personalizar período…</span>
											</button>
											{!enabled && (
												<ProButton
													href="/planos"
													label="Pro"
													showOverlayTooltip={false}
													size="xs"
													tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK.custom])}`}
												/>
											)}
										</div>
										{showCustomMobile && (
											<div className="mt-3 space-y-3">
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
												<div className="flex justify-end">
													<BaseButton
														className="rounded-xl"
														onClick={() => setMobileOpen(false)}
														type="button"
													>
														Concluir
													</BaseButton>
												</div>
											</div>
										)}
									</div>
								);
							})()}
						</div>
					</BottomSheetContent>
				</BottomSheet>
			</div>
			<div className="hidden sm:block">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<BaseButton className="select-none rounded-xl bg-black text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black">
							<CalendarRange className="mr-2 h-4 w-4" />
							{RANGE_LABEL[range]}
							<ChevronDown className="mr-1 ml-2 h-4 w-4" />
						</BaseButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{(["7d", "30d", "90d", "365d"] as const).map((k) => {
							const enabled = isPeriodAvailable(plan, k as PeriodOption);
							return (
								<DropdownMenuItem
									aria-disabled={!enabled}
									className={cn(
										"text-sm",
										"flex items-center justify-between gap-2",
										!enabled && disabledItemClasses(true)
									)}
									key={k}
									onClick={() => enabled && onRangeChange(k as RangeKey)}
									onSelect={(e) => {
										if (!enabled) {
											e.preventDefault();
										}
									}}
								>
									<span className={cn(!enabled && "text-muted-foreground")}>
										{RANGE_LABEL[k as RangeKey]}
									</span>
									{!enabled && (
										<ProButton
											href="/planos"
											label={labelFromPlan(
												PLAN_BY_RANK[PERIOD_REQUIRED_RANK[k as PeriodOption]]
											)}
											showOverlayTooltip={false}
											size="xs"
											tooltip={`Disponível no plano ${labelFromPlan(PLAN_BY_RANK[PERIOD_REQUIRED_RANK[k as PeriodOption]])}`}
										/>
									)}
								</DropdownMenuItem>
							);
						})}
						{(() => {
							const enabled = isPeriodAvailable(plan, "custom");
							return (
								<DropdownMenuItem
									aria-disabled={!enabled}
									className={cn(
										"text-sm",
										"flex items-center justify-between gap-2",
										!enabled && disabledItemClasses(true)
									)}
									onClick={() => {
										if (!enabled) {
											return;
										}
										if (onOpenCustom) {
											onOpenCustom();
										}
									}}
									onSelect={(e) => {
										if (!enabled) {
											e.preventDefault();
										}
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
			</div>
		</div>
	);
}

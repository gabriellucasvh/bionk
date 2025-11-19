"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const REJECT_URL = /^https:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;
interface AddNewCountdownFormProps {
	onCreated?: (id: number) => void;
	onSaved?: (id: number) => void;
	onClose?: () => void;
	event?: import("../../types/links.types").EventItem;
	onSaveManaged?: (payload: {
		title: string;
		eventDate: string;
		eventTime: string;
		countdownLinkUrl?: string | null;
		countdownLinkVisibility?: "after" | "during" | null;
	}) => void | Promise<void>;
}

const AddNewCountdownForm = ({
	onCreated,
	onSaved,
	onClose,
	event,
	onSaveManaged,
}: AddNewCountdownFormProps) => {
	const [title, setTitle] = useState(event?.title || "");
	const toLocalInputDate = (s?: string) => {
		if (!s) {
			return "";
		}
		try {
			const d = new Date(s);
			const pad = (n: number) => `${n}`.padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		} catch {
			return s as string;
		}
	};
	const tomorrowLocalStart = () => {
		const t = new Date();
		t.setDate(t.getDate() + 1);
		t.setHours(0, 0, 0, 0);
		return t;
	};

	const oneYearFromTodayStart = () => {
		const t = new Date();
		t.setDate(t.getDate() + 365);
		t.setHours(0, 0, 0, 0);
		return t;
	};

	const pad2 = (n: number) => `${n}`.padStart(2, "0");
	const toLocalInputFromDate = (d: Date) =>
		`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

	const [eventDate, setEventDate] = useState<string>(() => {
		const existing = toLocalInputDate(event?.eventDate);
		if (existing) {
			return existing;
		}
		const t = tomorrowLocalStart();
		return toLocalInputFromDate(t);
	});
	const [dateOpen, setDateOpen] = useState(false);
	const [eventTime, setEventTime] = useState<string>(
		event?.eventTime || "00:00"
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [redirectUrl, setRedirectUrl] = useState<string>(
		event?.countdownLinkUrl || ""
	);
	const [visibility, setVisibility] = useState<"after" | "during" | null>(
		event?.countdownLinkVisibility || "after"
	);
	const [urlError, setUrlError] = useState<string | null>(null);

	const isSafeUrl = (u?: string | null) => {
		if (!u) {
			return false;
		}
		return REJECT_URL.test(String(u));
	};

	const canSubmit = () => {
		if (!(title.trim() && eventDate && eventTime)) {
			return false;
		}
		try {
			const d = parseLocalDate(eventDate);
			d.setHours(0, 0, 0, 0);
			const lower = tomorrowLocalStart().getTime();
			const upper = oneYearFromTodayStart().getTime();
			const ts = d.getTime();
			if (!(ts >= lower && ts <= upper)) {
				return false;
			}
		} catch {
			return false;
		}
		if (redirectUrl && !isSafeUrl(redirectUrl)) {
			return false;
		}
		return true;
	};

	const parseLocalDate = (s: string) => {
		const parts = s.split("-").map((p) => Number(p));
		return new Date(parts[0], parts[1] - 1, parts[2]);
	};

	const handleSubmit = async () => {
		if (!canSubmit()) {
			return;
		}
		setLoading(true);
		setError(null);
		try {
			if (event?.id) {
				if (onSaveManaged) {
					await onSaveManaged({
						title,
						eventDate,
						eventTime,
						countdownLinkUrl: redirectUrl || null,
						countdownLinkVisibility: redirectUrl ? visibility : null,
					});
					onSaved?.(event.id);
				} else {
					const res = await fetch(`/api/events/${event.id}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							title,
							type: "countdown",
							eventDate,
							eventTime,
							countdownLinkUrl: redirectUrl || null,
							countdownLinkVisibility: redirectUrl ? visibility : null,
						}),
					});
					if (!res.ok) {
						setError("Falha ao salvar contagem");
						setLoading(false);
						return;
					}
					const data = await res.json();
					onSaved?.(data.id);
				}
			} else {
				const res = await fetch("/api/events/countdown", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title,
						eventDate,
						eventTime,
						countdownLinkUrl: redirectUrl || null,
						countdownLinkVisibility: redirectUrl ? visibility : null,
					}),
				});
				if (!res.ok) {
					setError("Falha ao criar contagem");
					setLoading(false);
					return;
				}
				const data = await res.json();
				onCreated?.(data.id);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-3 rounded-3xl border-2 border-foreground/20 bg-white p-3 sm:p-4 dark:bg-zinc-900">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<section className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<div className="grid flex-1 gap-2">
							<Label>Título*</Label>
							<Input
								maxLength={80}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Ex: Aniversário"
								value={title}
							/>
						</div>
						<div className="grid w-full gap-2 sm:w-[360px]">
							<div className="grid grid-cols-2 gap-2">
								<div className="grid gap-2">
									<Label>Data*</Label>
									<Popover onOpenChange={setDateOpen} open={dateOpen}>
										<PopoverTrigger asChild>
											<Button
												className={`h-10 w-full justify-between ${eventDate ? "" : "text-muted-foreground"}`}
												onClick={() => setDateOpen(true)}
												type="button"
												variant="outline"
											>
												{eventDate ? (
													new Intl.DateTimeFormat("pt-BR").format(
														parseLocalDate(eventDate)
													)
												) : (
													<span>Selecionar data</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent align="start" className="w-auto p-0">
											<Calendar
												disabled={{
													before: tomorrowLocalStart(),
													after: oneYearFromTodayStart(),
												}}
												mode="single"
												onSelect={(d) => {
													if (!d) {
														return;
													}
													const lower = tomorrowLocalStart().getTime();
													const upper = oneYearFromTodayStart().getTime();
													const ts = new Date(
														d.getFullYear(),
														d.getMonth(),
														d.getDate()
													).getTime();
													if (!(ts >= lower && ts <= upper)) {
														setDateOpen(false);
														return;
													}
													const val = toLocalInputFromDate(
														new Date(d.getFullYear(), d.getMonth(), d.getDate())
													);
													setEventDate(val);
													setDateOpen(false);
												}}
												selected={
													eventDate ? parseLocalDate(eventDate) : undefined
												}
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div className="grid gap-2">
									<Label>Hora*</Label>
									<Input
										className="h-10 w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
										onChange={(e) => setEventTime(e.target.value)}
										step="60"
										type="time"
										value={eventTime}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="grid gap-2">
						<Label>Link (opcional)</Label>
						<Input
							onChange={(e) => {
								const v = e.target.value;
								setRedirectUrl(v);
								if (!v) {
									setUrlError(null);
									return;
								}
								setUrlError(isSafeUrl(v) ? null : "URL inválida ou não segura");
							}}
							placeholder="https://exemplo.com"
							value={redirectUrl}
						/>
						{urlError && <div className="text-red-600 text-sm">{urlError}</div>}
					</div>
					<div className="grid gap-2">
						<Label>Visibilidade do link</Label>
						<RadioGroup
							onValueChange={(v) => setVisibility(v as any)}
							value={visibility || undefined}
						>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									disabled={!(redirectUrl && isSafeUrl(redirectUrl))}
									id="vis-after"
									value="after"
								/>
								<Label htmlFor="vis-after">
									Permitir link após o tempo acabar
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<RadioGroupItem
									disabled={!(redirectUrl && isSafeUrl(redirectUrl))}
									id="vis-during"
									value="during"
								/>
								<Label htmlFor="vis-during">
									Permitir link durante a contagem
								</Label>
							</div>
						</RadioGroup>
					</div>
					{error && <div className="text-red-600 text-sm">{error}</div>}
				</section>
			</div>

			<div className="flex-shrink-0 pt-3">
				<div className="flex items-center justify-end gap-3">
					<BaseButton
						className="px-4"
						onClick={onClose}
						type="button"
						variant="white"
					>
						Cancelar
					</BaseButton>
					<BaseButton
						className="px-4"
						disabled={loading || !canSubmit()}
						loading={loading}
						onClick={handleSubmit}
						type="button"
					>
						<span className="flex items-center">Salvar</span>
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default AddNewCountdownForm;

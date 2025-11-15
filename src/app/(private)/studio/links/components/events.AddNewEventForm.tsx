"use client";

import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";

interface AddNewEventFormProps {
	onCreated?: (id: number) => void;
	onSaved?: (id: number) => void;
	onClose?: () => void;
	event?: import("../types/links.types").EventItem;
}

const AddNewEventForm = ({
	onCreated,
	onSaved,
	onClose,
	event,
}: AddNewEventFormProps) => {
	const toLocalInputDate = (s?: string) => {
		if (!s) {
			return "";
		}
		try {
			const d = new Date(s);
			const pad = (n: number) => `${n}`.padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		} catch {
			return s;
		}
	};
	const [title, setTitle] = useState(event?.title || "");
	const [location, setLocation] = useState(event?.location || "");
	const [eventDate, setEventDate] = useState(
		toLocalInputDate(event?.eventDate)
	);
	const [dateOpen, setDateOpen] = useState(false);
	const [eventTime, setEventTime] = useState(event?.eventTime || "");
	const [descriptionShort, setDescriptionShort] = useState(
		event?.descriptionShort || ""
	);
	const [externalLink, setExternalLink] = useState(event?.externalLink || "");
	const [coverImageUrl, setCoverImageUrl] = useState(
		event?.coverImageUrl || ""
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	const canSubmit = () => {
		if (!(title.trim() && location.trim() && eventDate && eventTime)) {
			return false;
		}
		if (!externalLink.trim()) {
			return false;
		}
		return true;
	};

	const parseLocalDate = (s: string) => {
		const parts = s.split("-").map((p) => Number(p));
		return new Date(parts[0], parts[1] - 1, parts[2]);
	};

	const todayLocalStart = () => {
		const t = new Date();
		t.setHours(0, 0, 0, 0);
		return t;
	};

	const handleSubmit = async () => {
		if (!canSubmit()) {
			setError("Preencha os campos obrigatórios");
			return;
		}
		setLoading(true);
		setError("");
		const payload = {
			title: title.trim(),
			location: location.trim(),
			eventDate,
			eventTime,
			descriptionShort: descriptionShort.trim() || undefined,
			externalLink: externalLink.trim(),
			coverImageUrl: coverImageUrl.trim() || undefined,
		};
		const res = await fetch(event ? `/api/events/${event.id}` : "/api/events", {
			method: event ? "PUT" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		setLoading(false);
		if (!res.ok) {
			setError(event ? "Falha ao salvar evento" : "Falha ao criar evento");
			return;
		}
		const json = await res.json();
		if (event) {
			if (onSaved && typeof json?.id === "number") {
				onSaved(json.id);
			}
		} else if (onCreated && typeof json?.id === "number") {
			onCreated(json.id);
		}
		if (onClose) {
			onClose();
		}
	};

	return (
		<div className="flex flex-col gap-3 rounded-lg border-2 border-foreground/20 p-3 sm:p-4">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<section className="space-y-4 rounded-lg border bg-muted/20 p-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label>Título*</Label>
							<Input
								className="bg-white dark:bg-bunker-950"
								maxLength={80}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Ex: Nome do evento"
								value={title}
							/>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Local*</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									maxLength={80}
									onChange={(e) => setLocation(e.target.value)}
									placeholder="Ex: Auditório Central, São Paulo"
									value={location}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Data*</Label>
								<Popover onOpenChange={setDateOpen} open={dateOpen}>
									<PopoverTrigger asChild>
										<Button
											className={`h-10 w-40 justify-between bg-white dark:bg-bunker-950 ${eventDate ? "" : "text-muted-foreground"}`}
											onClick={() => setDateOpen(true)}
											type="button"
											variant="outline"
										>
											{eventDate ? (
												format(parseLocalDate(eventDate), "dd/MM/yyyy")
											) : (
												<span>Selecionar data</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent align="start" className="w-auto p-0">
										<Calendar
											disabled={{ before: todayLocalStart() }}
											mode="single"
											onSelect={(d) => {
												if (!d) {
													return;
												}
												const now = new Date();
												now.setHours(0, 0, 0, 0);
												if (d.getTime() < now.getTime()) {
													setDateOpen(false);
													return;
												}
												const pad = (n: number) => `${n}`.padStart(2, "0");
												const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Hora*</Label>
								<Input
									className="h-10 w-20 appearance-none bg-white dark:bg-bunker-950 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									onChange={(e) => setEventTime(e.target.value)}
									step="60"
									type="time"
									value={eventTime}
								/>
							</div>
						</div>
						<div className="sm:col-span-2">
							<div className="grid gap-2">
								<Label>Descrição curta</Label>
								<Textarea
									className="bg-white dark:bg-bunker-950"
									maxLength={100}
									onChange={(e) => setDescriptionShort(e.target.value)}
									placeholder="Breve descrição do evento"
									value={descriptionShort}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Link externo*</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									onChange={(e) => setExternalLink(e.target.value)}
									placeholder="Ex: https://meusite.com/ingressos/0123"
									required
									value={externalLink}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Imagem de capa</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									onChange={(e) => setCoverImageUrl(e.target.value)}
									placeholder="Ex: https://cdn.exemplo.com/capa.jpg"
									value={coverImageUrl}
								/>
							</div>
						</div>
					</div>
					{error && <div className="text-red-600 text-sm">{error}</div>}
				</section>
			</div>

			<div className="flex-shrink-0 border-t pt-3">
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

export default AddNewEventForm;

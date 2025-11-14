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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AddNewEventFormProps {
	onCreated?: (id: number) => void;
	onClose?: () => void;
}

const AddNewEventForm = ({ onCreated, onClose }: AddNewEventFormProps) => {
	const [title, setTitle] = useState("");
	const [location, setLocation] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [dateOpen, setDateOpen] = useState(false);
	const [eventTime, setEventTime] = useState("");
	const [descriptionShort, setDescriptionShort] = useState("");
	const [externalLink, setExternalLink] = useState("");
	const [priceType, setPriceType] = useState<"free" | "paid" | "donation">(
		"paid"
	);
	const [priceDigits, setPriceDigits] = useState<string>("");
	const [eventType, setEventType] = useState("");
	const [organizer, setOrganizer] = useState("");
	const [coverImageUrl, setCoverImageUrl] = useState("");
	const [seatsAvailable, setSeatsAvailable] = useState<string>("");
	const [ageRating, setAgeRating] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	const canSubmit = () => {
		if (
			!(
				title.trim() &&
				location.trim() &&
				eventDate &&
				eventTime &&
				eventType.trim()
			)
		) {
			return false;
		}
		if (
			(priceType === "paid" || priceType === "donation") &&
			(!priceDigits || numericPrice() === undefined)
		) {
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

	const formatPriceDisplay = (digits: string) => {
		const n = digits ? Number(digits) : 0;
		const intPart = new Intl.NumberFormat("pt-BR", {
			maximumFractionDigits: 0,
		}).format(n);
		return `R$ ${intPart},00`;
	};

	const handlePriceInputChange = (v: string) => {
		const d = v.replace(/\D/g, "");
		const base = d.endsWith("00") ? d.slice(0, -2) : d;
		setPriceDigits(base);
	};

	const handlePriceKeyDown = (e: any) => {
		const k = e.key;
		if (k >= "0" && k <= "9") {
			e.preventDefault();
			setPriceDigits((prev) => `${prev}${k}`);
			return;
		}
		if (k === "Backspace") {
			e.preventDefault();
			setPriceDigits((prev) => prev.slice(0, -1));
			return;
		}
	};

	const handlePricePaste = (e: any) => {
		const v = e.clipboardData?.getData("text") || "";
		const d = v.replace(/\D/g, "");
		if (!d) {
			e.preventDefault();
			return;
		}
		e.preventDefault();
		setPriceDigits(d);
	};

	const numericPrice = () => {
		if (!priceDigits) {
			return;
		}
		return Number(priceDigits);
	};

	const formatIntegerBR = (digits: string) => {
		if (!digits) {
			return "";
		}
		const n = Number(digits);
		return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(
			n
		);
	};

	const handleSeatsChange = (v: string) => {
		const digits = v.replace(/\D/g, "").slice(0, 11);
		if (!digits) {
			setSeatsAvailable("");
			return;
		}
		const n = Math.max(1, Number(digits));
		setSeatsAvailable(String(n));
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
			externalLink: externalLink.trim() || undefined,
			priceType,
			price: priceDigits ? Number(priceDigits) : undefined,
			eventType: eventType.trim(),
			organizer: organizer.trim() || undefined,
			coverImageUrl: coverImageUrl.trim() || undefined,
			seatsAvailable: seatsAvailable ? Number(seatsAvailable) : undefined,
			ageRating: ageRating.trim() || undefined,
		};
		const res = await fetch("/api/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		setLoading(false);
		if (!res.ok) {
			setError("Falha ao criar evento");
			return;
		}
		const json = await res.json();
		if (onCreated && typeof json?.id === "number") {
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
								<Label>Link externo</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									onChange={(e) => setExternalLink(e.target.value)}
									placeholder="Ex: https://meusite.com/ingressos/0123"
									value={externalLink}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Faixa de preço</Label>
								<Select
									onValueChange={(v) => setPriceType(v as any)}
									value={priceType}
								>
									<SelectTrigger className="bg-white dark:bg-bunker-950">
										<SelectValue placeholder="Selecione" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="free">Gratuito</SelectItem>
										<SelectItem value="paid">Pago</SelectItem>
										<SelectItem value="donation">Doação</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						{(priceType === "paid" || priceType === "donation") && (
							<div>
								<div className="grid gap-2">
									<Label>Preço</Label>
									<Input
										className="bg-white dark:bg-bunker-950"
										onChange={(e) => handlePriceInputChange(e.target.value)}
										onKeyDown={handlePriceKeyDown}
										onPaste={handlePricePaste}
										placeholder="R$ 0,00"
										value={formatPriceDisplay(priceDigits)}
									/>
								</div>
							</div>
						)}
						<div>
							<div className="grid gap-2">
								<Label>Tipo de evento</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									onChange={(e) => setEventType(e.target.value)}
									placeholder="Show, Workshop, Palestra..."
									value={eventType}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Organizador</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									maxLength={30}
									onChange={(e) => setOrganizer(e.target.value)}
									placeholder="Ex: Bionk Produções"
									value={organizer}
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
						<div>
							<div className="grid gap-2">
								<Label>Disponibilidade de vagas</Label>
								<Input
									className="bg-white dark:bg-bunker-950"
									inputMode="numeric"
									maxLength={11}
									onChange={(e) => handleSeatsChange(e.target.value)}
									placeholder="Ex: 1.000"
									value={formatIntegerBR(seatsAvailable)}
								/>
							</div>
						</div>
						<div>
							<div className="grid gap-2">
								<Label>Classificação etária</Label>
								<Select
									onValueChange={(v) => setAgeRating(v)}
									value={ageRating}
								>
									<SelectTrigger className="bg-white dark:bg-bunker-950">
										<SelectValue placeholder="Selecione" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Livre">Livre</SelectItem>
										<SelectItem value="10">10</SelectItem>
										<SelectItem value="12">12</SelectItem>
										<SelectItem value="14">14</SelectItem>
										<SelectItem value="16">16</SelectItem>
										<SelectItem value="18">18</SelectItem>
									</SelectContent>
								</Select>
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

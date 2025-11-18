"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddNewCountdownFormProps {
    onCreated?: (id: number) => void;
    onSaved?: (id: number) => void;
    onClose?: () => void;
    event?: import("../../types/links.types").EventItem;
}

const AddNewCountdownForm = ({ onCreated, onSaved, onClose, event }: AddNewCountdownFormProps) => {
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
    const [eventDate, setEventDate] = useState<string>(toLocalInputDate(event?.eventDate));
    const [dateOpen, setDateOpen] = useState(false);
    const [eventTime, setEventTime] = useState<string>(event?.eventTime || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit = () => {
        if (!(title.trim() && eventDate && eventTime)) {
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
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (event?.id) {
                const res = await fetch(`/api/events/${event.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, type: "countdown", eventDate, eventTime }),
                });
                if (!res.ok) {
                    setError("Falha ao salvar contagem");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                onSaved?.(data.id);
            } else {
                const res = await fetch("/api/events/countdown", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, eventDate, eventTime }),
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Título*</Label>
                            <Input
                                maxLength={80}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Aniversário"
                                value={title}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Data*</Label>
                            <Popover onOpenChange={setDateOpen} open={dateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        className={`h-10 w-40 justify-between ${eventDate ? "" : "text-muted-foreground"}`}
                                        onClick={() => setDateOpen(true)}
                                        type="button"
                                        variant="outline"
                                    >
                                        {eventDate ? (
                                            new Intl.DateTimeFormat("pt-BR").format(parseLocalDate(eventDate))
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
                                        selected={eventDate ? parseLocalDate(eventDate) : undefined}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label>Hora*</Label>
                            <Input
                                className="h-10 w-20 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                onChange={(e) => setEventTime(e.target.value)}
                                step="60"
                                type="time"
                                value={eventTime}
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                </section>
            </div>

            <div className="flex-shrink-0 pt-3">
                <div className="flex items-center justify-end gap-3">
                    <BaseButton className="px-4" onClick={onClose} type="button" variant="white">
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
"use client";

import { ChevronLeft, RotateCcw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

type LinkItem = {
    id: number;
    title: string;
    url: string;
    active: boolean;
    archived?: boolean;
};

type TextItem = {
    id: number;
    title: string;
    description: string;
    active: boolean;
    archived?: boolean;
};

type VideoItem = {
    id: number;
    title: string | null;
    description: string | null;
    url: string | null;
    active: boolean;
    archived?: boolean;
};

type ImageItem = {
    id: number;
    title: string | null;
    description: string | null;
    active: boolean;
    archived?: boolean;
};

type MusicItem = {
    id: number;
    title: string;
    url: string;
    active: boolean;
    archived?: boolean;
};

type EventItem = {
    id: number;
    title: string;
    location: string;
    eventDate: string;
    eventTime: string;
    active: boolean;
};

type ArchivedItem = {
    id: number;
    type: "link" | "text" | "video" | "image" | "music" | "event";
    title: string;
    subtitle?: string;
};

export default function ArchivedItemsPage() {
    const { data: session } = useSession();
    const [items, setItems] = useState<ArchivedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArchivedItems = async () => {
            if (!session?.user?.id) {
                return;
            }
            const [linksRes, textsRes, videosRes, imagesRes, musicsRes, eventsRes] = await Promise.all([
                fetch("/api/links?status=archived"),
                fetch("/api/texts?status=archived"),
                fetch("/api/videos?status=archived"),
                fetch("/api/images?status=archived"),
                fetch("/api/musics?status=archived"),
                fetch("/api/events?status=archived"),
            ]);
            const linksData = await linksRes.json();
            const textsData = await textsRes.json();
            const videosData = await videosRes.json();
            const imagesData = await imagesRes.json();
            const musicsData = await musicsRes.json();
            const eventsData = await eventsRes.json();

            const archivedLinks: ArchivedItem[] = (linksData.links || []).map((l: LinkItem) => ({
                id: l.id,
                type: "link",
                title: l.title,
                subtitle: l.url,
            }));
            const archivedTexts: ArchivedItem[] = (textsData.texts || []).map((t: TextItem) => ({
                id: t.id,
                type: "text",
                title: t.title,
                subtitle: t.description,
            }));
            const archivedVideos: ArchivedItem[] = (videosData.videos || []).map((v: VideoItem) => ({
                id: v.id,
                type: "video",
                title: v.title || "Vídeo",
                subtitle: v.url || undefined,
            }));
            const archivedImages: ArchivedItem[] = (imagesData.images || []).map((i: ImageItem) => ({
                id: i.id,
                type: "image",
                title: i.title || "Imagem",
                subtitle: i.description || undefined,
            }));
            const archivedMusics: ArchivedItem[] = (musicsData.musics || []).map((m: MusicItem) => ({
                id: m.id,
                type: "music",
                title: m.title,
                subtitle: m.url,
            }));
            const archivedEvents: ArchivedItem[] = (eventsData.events || [])
                .map((ev: EventItem) => {
                    let dateLabel = String(ev.eventDate);
                    try {
                        const d = new Date(ev.eventDate);
                        dateLabel = format(d, "dd/MM/yyyy");
                    } catch {}
                    const locationPrefix = ev.location ? ev.location + " • " : "";
                    const timeSuffix = ev.eventTime ? " " + ev.eventTime : "";
                    return {
                        id: ev.id,
                        type: "event",
                        title: ev.title,
                        subtitle: `${locationPrefix}${dateLabel}${timeSuffix}`,
                    };
                });

            const unified = [
                ...archivedLinks,
                ...archivedTexts,
                ...archivedVideos,
                ...archivedImages,
                ...archivedMusics,
                ...archivedEvents,
            ];
            setItems(unified);
            setIsLoading(false);
        };
        fetchArchivedItems();
    }, [session]);

    const restoreItem = async (it: ArchivedItem) => {
        if (it.type === "link") {
            const res = await fetch(`/api/links/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false, active: true }),
            });
            if (!res.ok) {
                return;
            }
        } else if (it.type === "text") {
            const res = await fetch(`/api/texts/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false, active: true }),
            });
            if (!res.ok) {
                return;
            }
        } else if (it.type === "video") {
            const res = await fetch(`/api/videos/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false, active: true }),
            });
            if (!res.ok) {
                return;
            }
        } else if (it.type === "image") {
            const res = await fetch(`/api/images/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false, active: true }),
            });
            if (!res.ok) {
                return;
            }
        } else if (it.type === "music") {
            const res = await fetch(`/api/musics/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false, active: true }),
            });
            if (!res.ok) {
                return;
            }
        } else if (it.type === "event") {
            const res = await fetch(`/api/events/${it.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: true }),
            });
            if (!res.ok) {
                return;
            }
        }
        setItems((prev) => prev.filter((x) => x.id !== it.id || x.type !== it.type));
    };

    const deleteItem = async (it: ArchivedItem) => {
        const res = await fetch(`/api/${it.type}s/${it.id}`, { method: "DELETE" });
        if (!res.ok) {
            return;
        }
        setItems((prev) => prev.filter((x) => x.id !== it.id || x.type !== it.type));
    };

    const restoreAllItems = async () => {
        const results = await Promise.all(
            items.map(async (it) => {
                if (it.type === "event") {
                    const r = await fetch(`/api/events/${it.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ active: true }),
                    });
                    return r.ok;
                }
                const r = await fetch(`/api/${it.type}s/${it.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ archived: false, active: true }),
                });
                return r.ok;
            })
        );
        if (!results.every((ok) => ok)) {
            return;
        }
        setItems([]);
    };

    const deleteAllItems = async () => {
        const results = await Promise.all(
            items.map(async (it) => {
                const r = await fetch(`/api/${it.type}s/${it.id}`, { method: "DELETE" });
                return r.ok;
            })
        );
        if (!results.every((ok) => ok)) {
            return;
        }
        setItems([]);
    };

    if (isLoading) {
        return (
            <main className="h-full w-full bg-zinc-100 dark:bg-zinc-800">
                <div className="container mx-auto max-w-4xl p-3 sm:p-6">
                    <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl dark:text-white">
                        Itens Arquivados
                    </h1>
                </div>
            </main>
        );
    }

    return (
        <main className="h-full w-full bg-zinc-100 dark:bg-zinc-800">
            <div className="container mx-auto max-w-4xl space-y-4 p-3 pb-24 sm:space-y-6 sm:p-6 sm:pb-8 lg:space-y-8 dark:text-white">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl dark:text-white">
                            Itens Arquivados
                        </h1>
                        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base dark:text-zinc-400">
                            Visualize e restaure itens arquivados
                        </p>
                    </div>
                    <Link className="flex items-center" href="/studio/configs">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Link>
                </header>

                {items.length === 0 ? (
                    <p className="text-muted-foreground dark:text-zinc-400">
                        Nenhum item arquivado.
                    </p>
                ) : (
                    <div className="space-y-6">
                        <ul className="space-y-2">
                            {items.map((it) => (
                                <li
                                    className="flex items-center justify-between rounded-3xl border bg-white p-4 dark:border-zinc-900 dark:bg-zinc-900"
                                    key={`${it.type}-${it.id}`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="truncate font-medium">{it.title}</p>
                                        {it.subtitle ? (
                                            <p className="truncate text-muted-foreground text-sm dark:text-zinc-400">
                                                {it.subtitle.length > 80 ? `${it.subtitle.slice(0, 80)}...` : it.subtitle}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="ml-4 flex flex-shrink-0 items-center gap-2">
                                        <BaseButton
                                            aria-label="Restaurar"
                                            onClick={() => restoreItem(it)}
                                            size="icon"
                                            variant="white"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </BaseButton>
                                        <BaseButton
                                            aria-label="Excluir"
                                            onClick={() => deleteItem(it)}
                                            size="icon"
                                            variant="white"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </BaseButton>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-end gap-2">
                            <BaseButton
                                disabled={items.length === 0}
                                onClick={restoreAllItems}
                                variant="white"
                            >
                                Restaurar Todos
                            </BaseButton>
                            <BaseButton
                                disabled={items.length === 0}
                                onClick={deleteAllItems}
                                variant="destructive"
                            >
                                Apagar Todos
                            </BaseButton>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

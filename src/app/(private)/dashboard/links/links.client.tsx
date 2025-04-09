// components/LinksClient.tsx
"use client";

import { useState, useEffect, JSX } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  Grip,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  MousePointerClick,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import Image from "next/image";
import LoadingPage from "@/components/layout/LoadingPage";
import { cn } from "@/lib/utils";

type LinkItem = {
  id: number;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  sensitive: boolean;
  order: number;
  isEditing?: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ICON_MAP = [
  { keyword: "pinterest", src: "/icons/pinterest.svg", alt: "Pinterest" },
  { keyword: "instagram", src: "/icons/instagram.svg", alt: "Instagram" },
  { keyword: "discord", src: "/icons/discord.svg", alt: "Discord" },
  { keyword: "buymeacoffee", src: "/icons/bmc.svg", alt: "Buy Me a Coffee" },
  { keyword: "facebook", src: "/icons/facebook.svg", alt: "Facebook" },
  { keyword: "github", src: "/icons/github-light.svg", alt: "GitHub" },
  { keyword: "gitlab", src: "/icons/gitlab.svg", alt: "GitLab" },
  { keyword: "linkedin", src: "/icons/linkedin.svg", alt: "LinkedIn" },
  { keyword: "gmail", src: "/icons/mail.svg", alt: "Email" },
  { keyword: "patreon", src: "/icons/patreon.svg", alt: "Patreon" },
  { keyword: "paypal", src: "/icons/paypal.svg", alt: "PayPal" },
  { keyword: "reddit", src: "/icons/reddit.svg", alt: "Reddit" },
  { keyword: "snapchat", src: "/icons/snapchat.svg", alt: "Snapchat" },
  { keyword: "soundcloud", src: "/icons/soundcloud-logo.svg", alt: "Soundcloud" },
  { keyword: "spotify", src: "/icons/spotify.svg", alt: "Spotify" },
  { keyword: "steam", src: "/icons/steam.svg", alt: "Steam" },
  { keyword: "t.me", src: "/icons/telegram.svg", alt: "Telegram" },
  { keyword: "tiktok", src: "/icons/tiktok.svg", alt: "Tiktok" },
  { keyword: "twitch", src: "/icons/twitch.svg", alt: "Twitch" },
  { keyword: "x.com", src: "/icons/x.svg", alt: "X" },
  { keyword: "youtube", src: "/icons/youtube.svg", alt: "Youtube" },
];



const getIconForUrl = (url: string): JSX.Element => {
  try {
    const { hostname } = new URL(url);
    const mapping = ICON_MAP.find(({ keyword }) =>
      hostname.includes(keyword)
    );
    if (mapping) {
      return (
        <Image
          src={mapping.src}
          alt={mapping.alt}
          className="h-3 w-3"
          width={10}
          height={10}
        />
      );
    }
  } catch (err) {
    console.error("URL inválida:", url, err);
  }
  return (
    <Image
      src="/icons/globe.svg"
      alt="Default"
      className="h-3 w-3"
      width={10}
      height={10}
    />
  );
};

interface SortableItemProps {
  id: number;
  children: (props: {
    listeners: ReturnType<typeof useSortable>["listeners"];
    attributes: React.HTMLAttributes<HTMLDivElement>;
  }) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ listeners, attributes })}
    </div>
  );
};

const LinksClient = () => {
  const { data: session } = useSession();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const { data: swrData, mutate: mutateLinks } = useSWR<{ links: LinkItem[] }>(
    session?.user?.id ? `/api/links?userId=${session.user.id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  useEffect(() => {
    if (swrData?.links) {
      const sorted = [...swrData.links].sort((a, b) => a.order - b.order);
      setLinks(sorted);
      setIsProfileLoading(false);
    }
  }, [swrData]);

  const handleClickLink = async (id: number) => {
    try {
      const response = await fetch(`/api/link-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: id }),
      });
      if (response.ok) {
        mutateLinks();
        setLinks((prev) =>
          prev.map((link) =>
            link.id === id ? { ...link, clicks: link.clicks + 1 } : link
          )
        );
      }
    } catch (err) {
      console.error("Erro ao registrar clique:", err);
    }
  };

  const isValidUrl = (url: string) =>
    /^(https?:\/\/)?([^\s.]+\.[^\s]{2,})$/.test(url);

  const handleAddNewLink = async () => {
    let formatted = newUrl.trim();
    if (!/^https?:\/\//.test(formatted)) {
      formatted = "https://" + formatted;
    }
    if (!isValidUrl(formatted)) return;

    const res = await fetch(`/api/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.user?.id,
        title: newTitle,
        url: formatted,
      }),
    });

    if (res.ok) {
      await mutateLinks();
      setNewTitle("");
      setNewUrl("");
      setIsAdding(false);
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, active: isActive } : link
      )
    );
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: isActive }),
    });
  };

  const toggleSensitive = async (id: number) => {
    const updated = links.map((link) =>
      link.id === id ? { ...link, sensitive: !link.sensitive } : link
    );
    setLinks(updated);
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensitive: updated.find((l) => l.id === id)?.sensitive,
      }),
    });
  };

  const startEditing = (id: number) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isEditing: true } : link
      )
    );
  };

  const saveEditing = async (id: number, title: string, url: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? { ...link, title, url, isEditing: false }
          : link
      )
    );
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, url }),
    });
  };

  const cancelEditing = (id: number) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isEditing: false } : link
      )
    );
  };

  const handleDeleteLink = async (id: number) => {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (res.ok) setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over?.id);
      const newOrder = arrayMove(links, oldIndex, newIndex);
      setLinks(newOrder);

      await fetch(`/api/links/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          order: newOrder.map((l) => l.id),
        }),
      });

      await mutateLinks();
    }
  };

  if (isProfileLoading) return <LoadingPage />;

  return (
    <section className="w-full p-4 space-y-4 max-h-screen">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar links</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar novo link
        </Button>
      </header>

      {isAdding && (
        <section className="p-4 border rounded-lg space-y-4">
          <div>
            <label className="block mb-1 font-medium">Título</label>
            <input
              type="text"
              placeholder="Título do link"
              className="w-full border rounded px-3 py-2"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">URL</label>
            <input
              type="url"
              placeholder="https://exemplo.com"
              className="w-full border rounded px-3 py-2"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddNewLink} disabled={!isValidUrl(newUrl)}>
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seus Links</CardTitle>
          <CardDescription>
            Gerencie, edite e organize seus links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext
              items={links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {links.map((link) => (
                <SortableItem key={link.id} id={link.id}>
                  {({ listeners }) => (
                    <article
                      className={cn(
                        "transition-all",
                        link.sensitive ? "flex flex-col gap-4 border-2 border-rose-400 rounded-lg p-4 sm:flex-row sm:items-center" : "flex flex-col gap-4 border-2 rounded-lg p-4 sm:flex-row sm:items-center"
                      )}
                    >

                      <div className="flex items-center gap-3 sm:w-7/12">
                        <Grip
                          {...listeners}
                          className="h-5 w-5 cursor-move text-muted-foreground"
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            {link.isEditing ? (
                              <section className="space-y-2">
                                <input
                                  type="text"
                                  className="w-full border rounded px-2 py-1"
                                  value={link.title}
                                  onChange={(e) =>
                                    setLinks((prev) =>
                                      prev.map((l) =>
                                        l.id === link.id
                                          ? { ...l, title: e.target.value }
                                          : l
                                      )
                                    )
                                  }
                                />
                                <input
                                  type="url"
                                  className="w-full border rounded px-2 py-1"
                                  value={link.url}
                                  onChange={(e) =>
                                    setLinks((prev) =>
                                      prev.map((l) =>
                                        l.id === link.id
                                          ? { ...l, url: e.target.value }
                                          : l
                                      )
                                    )
                                  }
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      saveEditing(link.id, link.title, link.url)
                                    }
                                  >
                                    Salvar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => cancelEditing(link.id)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </section>
                            ) : (
                              <>
                                <header className="flex items-center gap-2">
                                  <h3 className="font-medium flex items-center gap-1">
                                    <span className="mt-0.5">
                                      {getIconForUrl(link.url)}
                                    </span>
                                    {link.title}
                                  </h3>
                                </header>
                                <section className="flex items-center gap-1 text-sm text-blue-500">
                                  <ExternalLink className="h-3 w-3" />
                                  <Link
                                    className="truncate"
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() =>
                                      handleClickLink(link.id)
                                    }
                                  >
                                    {link.url}
                                  </Link>
                                </section>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:w-5/12 sm:justify-end">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <MousePointerClick className="h-3 w-3" />
                          {link.clicks.toLocaleString()}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={link.active}
                            onCheckedChange={(checked) =>
                              toggleActive(link.id, checked)
                            }
                            className="transition-colors duration-200"
                            id={`switch-${link.id}`}
                          />
                          <Label
                            htmlFor={`switch-${link.id}`}
                            className="cursor-pointer"
                          >
                            {link.active ? "Ativo" : "Inativo"}
                          </Label>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Mais opções</span>
                              <svg viewBox="0 0 24 24" className="h-4 w-4">
                                <circle cx="5" cy="12" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="19" cy="12" r="2" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(link.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver informações
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleSensitive(link.id)}>
                              {link.sensitive ? (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Conteúdo não Sensível
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Conteúdo Sensível
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteLink(link.id)}>
                              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </article>
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </section>
  );
};

export default LinksClient;

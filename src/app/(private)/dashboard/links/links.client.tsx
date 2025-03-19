"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ExternalLink,
  Grip,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  EyeOff,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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

type LinkItem = {
  id: number;
  title: string;
  url: string;
  active: boolean;
  clicks: number;
  sensitive: boolean;
  isEditing?: boolean;
};

interface SortableItemProps {
  id: number;
  children: (props: { listeners: any; attributes: any }) => React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
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
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newUrl, setNewUrl] = useState<string>("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      if (session?.user?.id) {
        const res = await fetch(`/api/links?userId=${session.user.id}`);
        const data = await res.json();
        setLinks(data.links);
        setIsProfileLoading(false); // Finaliza o carregamento após a busca dos dados
      }
    };
    fetchLinks();
  }, [session]);

  const isValidUrl = (url: string) => {
    const regex = /\.(com|br|me|net|org|info|io|co)$/i;
    return regex.test(url);
  };

  const handleAddNewLink = async () => {
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }
    if (!isValidUrl(formattedUrl)) return;

    const newLink: LinkItem = {
      id: Date.now(),
      title: newTitle,
      url: formattedUrl,
      active: true,
      clicks: 0,
      sensitive: false,
    };

    const res = await fetch(`/api/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session?.user?.id, ...newLink }),
    });

    if (res.ok) {
      setLinks((prev) => [...prev, newLink]);
      setNewTitle("");
      setNewUrl("");
      setIsAdding(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLinks((prev) => prev.filter((link) => link.id !== id));
    }
  };

  const toggleActive = async (id: number) => {
    const updated = links.map((link) =>
      link.id === id ? { ...link, active: !link.active } : link
    );
    setLinks(updated);
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active: updated.find((l) => l.id === id)?.active,
      }),
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
      prev.map((link) => (link.id === id ? { ...link, isEditing: true } : link))
    );
  };

  const saveEditing = async (id: number, newTitle: string, newUrl: string) => {
    const updated = links.map((link) =>
      link.id === id ? { ...link, title: newTitle, url: newUrl, isEditing: false } : link
    );
    setLinks(updated);
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, url: newUrl }),
    });
  };

  const cancelEditing = (id: number) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, isEditing: false } : link))
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over?.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      setLinks(newLinks);
      await fetch(`/api/links/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          order: newLinks.map((l) => l.id),
        }),
      });
    }
  };
  if (isProfileLoading) {
    return (
      <section className="flex items-center justify-center h-screen">
        <span className="loader"></span>
      </section>
    );
  }

  return (
    <section className="w-full p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar links</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar novo link
        </Button>
      </header>

      {isAdding && (
        <div className="p-4 border rounded-lg">
          <div className="mb-2">
            <label className="block mb-1 font-medium">Título</label>
            <input
              type="text"
              placeholder="Título do link"
              className="w-full border rounded px-3 py-2"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">URL</label>
            <input
              type="url"
              placeholder="https://exemplo.com"
              className="w-full border rounded px-3 py-2"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNewLink} disabled={!isValidUrl(newUrl)}>
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Seus Links</CardTitle>
          <CardDescription>Gerencie, edite e organize seus links.</CardDescription>
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
                    <article className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 sm:w-7/12">
                        {/* O arraste ocorrerá somente ao interagir com o ícone */}
                        <Grip
                          {...listeners}
                          className="h-5 w-5 cursor-move text-muted-foreground"
                        />
                        <div className="flex-1 space-y-1">
                          {link.isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={link.title}
                                onChange={(e) =>
                                  setLinks((prev) =>
                                    prev.map((l) =>
                                      l.id === link.id ? { ...l, title: e.target.value } : l
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
                                      l.id === link.id ? { ...l, url: e.target.value } : l
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
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{link.title}</span>
                                {link.sensitive && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-red-300"
                                  >
                                    Sensível
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-blue-500">
                                <ExternalLink className="h-3 w-3" />
                                <Link
                                  className="truncate"
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {link.url}
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:w-5/12 sm:justify-end">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {link.clicks}
                          </Badge>
                          <Switch
                            checked={link.active}
                            aria-label={
                              link.active ? "Desabilitar link" : "Habilitar link"
                            }
                            onChange={() => toggleActive(link.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => startEditing(link.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver informações
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleSensitive(link.id)}
                              >
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
                              <DropdownMenuItem
                                className="flex items-center text-destructive focus:text-destructive"
                                onClick={() => handleDeleteLink(link.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

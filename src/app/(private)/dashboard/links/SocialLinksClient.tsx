"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import useSWR from "swr";
import { SocialLinkItem, SocialPlatform } from '@/types/social';
import { SOCIAL_PLATFORMS } from '@/config/social-platforms';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SocialLinksClient = () => {
  const { data: session } = useSession();
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const { data: swrData, mutate: mutateSocialLinks } = useSWR<
    { socialLinks: SocialLinkItem[] }
  >(
    session?.user?.id ? `/api/social-links?userId=${session.user.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (swrData?.socialLinks) {
      const sorted = [...swrData.socialLinks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSocialLinks(sorted);
      setIsLoading(false);
    } else if (session?.user?.id && !swrData) {
      setIsLoading(true);
    } else if (!session?.user?.id) {
      setIsLoading(false);
    }
  }, [swrData, session?.user?.id]);

  const handlePlatformSelect = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setUsernameInput("");
    setEditingLinkId(null);
  };

  const handleAddOrUpdateSocialLink = async () => {
    if (!selectedPlatform || !usernameInput.trim() || !session?.user?.id) return;

    const fullUrl = `${selectedPlatform.baseUrl}${usernameInput.trim()}`;
    const payload = {
      userId: session.user.id,
      platform: selectedPlatform.key,
      username: usernameInput.trim(),
      url: fullUrl,
      active: true,
    };

    try {
      let response;
      if (editingLinkId) {
        response = await fetch(`/api/social-links/${editingLinkId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: usernameInput.trim(), url: fullUrl }),
        });
      } else {
        response = await fetch("/api/social-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        await mutateSocialLinks();
        setSelectedPlatform(null);
        setUsernameInput("");
        setEditingLinkId(null);
      } else {
        const errorData = await response.json();
        console.error("Erro ao salvar link social:", errorData.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const handleEditSocialLink = (link: SocialLinkItem) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.key === link.platform);
    if (platform) {
      setSelectedPlatform(platform);
      setUsernameInput(link.username || '');
      setEditingLinkId(link.id);
    }
  };

  const handleDeleteSocialLink = async (linkId: string) => {
    if (!session?.user?.id) return;
    setDeletingLinkId(linkId);
    try {
      const response = await fetch(`/api/social-links/${linkId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await mutateSocialLinks();
        if (editingLinkId === linkId) {
          setSelectedPlatform(null);
          setUsernameInput("");
          setEditingLinkId(null);
        }
      } else {
        console.error("Erro ao deletar link social");
      }
    } catch (error) {
      console.error("Erro na requisição de delete:", error);
    } finally {
      setDeletingLinkId(null);
    }
  };

  const handleCancel = () => {
    setSelectedPlatform(null);
    setUsernameInput("");
    setEditingLinkId(null);
  };

  if (isLoading && session?.user?.id) {
    return <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 flex justify-center items-center"><p>Carregando links sociais...</p></div>;
  }

  return (
    <section className="w-full md:w-1/2 p-2 sm:p-4 space-y-4 max-h-screen overflow-y-auto md:mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Links Sociais</CardTitle>
          <CardDescription className="text-sm">
            Adicione e gerencie seus links de redes sociais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedPlatform && (
            <div className="space-y-3">
              <p className="font-medium text-sm">Clique em um ícone para adicionar ou editar:</p>
              <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isExistingLink = socialLinks.some(link => link.platform === platform.key);
                  return (
                    <Button
                      key={platform.key}
                      variant="outline"
                      className="flex flex-col items-center justify-center h-full w-full p-1 sm:p-2 hover:bg-muted/50 transition-colors"
                      onClick={() => handlePlatformSelect(platform)}
                      disabled={isExistingLink}
                      title={isExistingLink ? `Você já adicionou um link para ${platform.name}` : `Adicionar ${platform.name}`}
                    >
                      <Image src={platform.icon} alt={platform.name} width={24} height={24} className="mb-1 sm:mb-1.5 w-6 h-6 sm:w-7 sm:h-7" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedPlatform && (
            <div className="p-3 border rounded-lg space-y-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <Image src={selectedPlatform.icon} alt={selectedPlatform.name} width={28} height={28} />
                <h3 className="font-semibold text-md sm:text-lg">{selectedPlatform.name}</h3>
              </div>
              <div>
                <Label htmlFor="usernameInput" className="text-xs sm:text-sm">{selectedPlatform.baseUrl}{usernameInput || selectedPlatform.placeholder}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="usernameInput"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder={selectedPlatform.placeholder}
                    className="flex-grow text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={handleAddOrUpdateSocialLink} className="w-full sm:w-auto flex-grow" size="sm">
                  {editingLinkId ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {editingLinkId ? "Salvar" : "Adicionar"}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm sm:text-base">Seus Links Adicionados:</h4>
              <ul className="space-y-2">
                {socialLinks.map((link) => {
                  const platform = SOCIAL_PLATFORMS.find(p => p.key === link.platform);
                  return (
                    <li key={link.id} className="flex items-center justify-between p-2.5 border rounded-lg bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
                        {platform && <Image src={platform.icon} alt={platform.name} width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />}
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-medium truncate">{platform?.name || link.platform}</span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate">
                            {link.username}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEditSocialLink(link)}>
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive/80" onClick={() => handleDeleteSocialLink(link.id)} disabled={deletingLinkId === link.id}>
                          {deletingLinkId === link.id ? <Loader2 className="animate-spin h-4 w-4" aria-label="Deletando..." /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default SocialLinksClient;
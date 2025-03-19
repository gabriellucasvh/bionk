"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import Image from "next/image";

const PerfilClient = () => {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [originalProfile, setOriginalProfile] = useState({ name: "", username: "", bio: "" });
  const [isProfileLoading, setIsProfileLoading] = useState(true); // Estado para controle de carregamento

  // Estados para as imagens
  const [bannerPreview, setBannerPreview] = useState<string>("/banner.png");
  const [profilePreview, setProfilePreview] = useState<string>("/person.png");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProfile = async () => {
        const res = await fetch(`/api/profile/${session.user.id}`);
        const data = await res.json();
        const fetchedName = data.name || "";
        const fetchedUsername = data.username || "";
        const fetchedBio = data.bio || "";
        setName(fetchedName);
        setUsername(fetchedUsername);
        setBio(fetchedBio);
        setOriginalProfile({ name: fetchedName, username: fetchedUsername, bio: fetchedBio });
        if (data.bannerUrl) setBannerPreview(data.bannerUrl);
        if (data.profileUrl) setProfilePreview(data.profileUrl);
        setIsProfileLoading(false); // Finaliza o carregamento após a busca dos dados
      };
      fetchProfile();
    }
  }, [session]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const hasChanges =
    name !== originalProfile.name ||
    username !== originalProfile.username ||
    bio !== originalProfile.bio;

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/profile/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha ao atualizar o perfil");
      }

      setMessage("Perfil atualizado com sucesso!");
      setOriginalProfile({ name, username, bio });
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      if (error instanceof Error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage("Erro: Ocorreu um problema ao atualizar o perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, type: "banner" | "profile") => {
    if (!session?.user?.id) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const response = await fetch(`/api/profile/${session.user.id}/upload?type=${type}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha no upload da imagem");
      }
      setMessage(`${type === "banner" ? "Banner" : "Foto de perfil"} atualizado com sucesso!`);
      if (data.url) {
        type === "banner" ? setBannerPreview(data.url) : setProfilePreview(data.url);
      }
    } catch (error) {
      console.error(`Erro ao fazer upload do ${type}:`, error);
      if (error instanceof Error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage(`Erro: Ocorreu um problema ao fazer upload do ${type}`);
      }
    }
  };

  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Erro: O banner deve ter no máximo 5MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
    uploadImage(file, "banner");
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Erro: A foto de perfil deve ter no máximo 2MB.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    uploadImage(file, "profile");
  };

  // Renderiza um placeholder enquanto os dados do usuário são carregados
  if (isProfileLoading) {
    return (
      <section className="flex items-center justify-center h-screen">
        <span className="loader"></span>
      </section>
    );
  }

  return (
    <section className="space-y-4 w-full p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Perfil</h2>
        <Button onClick={handleSaveProfile} disabled={loading || !hasChanges}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </header>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("Erro") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do perfil</CardTitle>
          <CardDescription>
            Atualize as informações do seu perfil e personalize sua página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <article className="space-y-4">
            <div className="relative mx-auto h-[300px] w-full border overflow-hidden rounded-lg bg-muted">
              <Image
                src={bannerPreview}
                alt="Banner"
                width={1500}
                height={500}
                className="h-full w-full object-cover"
              />
              <Button
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => bannerInputRef.current?.click()}
              >
                <Edit className="mr-2 h-4 w-4" />
                Alterar banner
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={bannerInputRef}
                onChange={handleBannerChange}
              />
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <article className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={profilePreview}
                    alt="Foto de perfil"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={profileInputRef}
                  onChange={handleProfileChange}
                />
              </article>
              <article className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">bionk.me/</span>
                    <Input
                      id="username"
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </article>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                placeholder="Fale um pouco sobre você"
                className="min-h-32"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </article>
        </CardContent>
      </Card>
    </section>
  );
};

export default PerfilClient;

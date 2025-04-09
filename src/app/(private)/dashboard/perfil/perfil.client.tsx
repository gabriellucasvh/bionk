// components/PerfilClient.tsx
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
import ToastMessage from "@/components/ToastMessage";
import LoadingPage from "@/components/layout/LoadingPage";

const PerfilClient = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({ name: "", username: "", bio: "" });
  const [originalProfile, setOriginalProfile] = useState({ name: "", username: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profilePreview, setProfilePreview] = useState<string>(
    session?.user?.image || "/person.png"
  );
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchProfile = async () => {
      const res = await fetch(`/api/profile/${session.user.id}`);
      const { name = "", username = "", bio = "", profileUrl } = await res.json();
      setProfile({ name, username, bio: bio || "" });
      setOriginalProfile({ name, username, bio: bio || "" });
      setProfilePreview(profileUrl || session?.user?.image || "/person.png");
      setIsProfileLoading(false);
    };
    fetchProfile();
  }, [session?.user?.id, session?.user?.image]); // Added session?.user?.image to dependencies

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const hasChanges =
    profile.name !== originalProfile.name ||
    profile.username !== originalProfile.username ||
    profile.bio !== originalProfile.bio;

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/profile/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao atualizar o perfil");

      setMessage("Perfil atualizado com sucesso!");
      setOriginalProfile(profile);
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      setMessage(`Erro: ${error instanceof Error ? error.message : "Ocorreu um problema ao atualizar o perfil"
        }`);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, type: "profile") => {
    if (!session?.user?.id) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch(`/api/profile/${session.user.id}/upload?type=${type}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da imagem");
      setMessage(
        `${type === "profile" ? "Foto de perfil" : "Banner"} atualizado com sucesso!`
      );
      if (data.url) setProfilePreview(data.url);
    } catch (error) {
      console.error(`Erro ao fazer upload da ${type}:`, error);
      setMessage(`Erro: ${error instanceof Error ? error.message : "Ocorreu um problema ao fazer upload"
        }`);
    }
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

  if (isProfileLoading) {
    return (
      <LoadingPage />
    );
  }

  return (
    <section className="space-y-4 w-7/12 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Perfil</h2>
      </header>

      {message && (
        <ToastMessage
          message={message}
          variant={message.includes("Erro") ? "error" : "success"}
          onClose={() => setMessage("")}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do perfil</CardTitle>
          <CardDescription>
            Atualize as informações do seu perfil e personalize sua página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <article className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-muted border-2 border-green-500 shadow-md shadow-black/20">
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
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">bionk.me/</span>
                  <Input
                    id="username"
                    placeholder="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </article>
          <div className="grid gap-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              placeholder="Fale um pouco sobre você"
              className="min-h-32"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveProfile} disabled={loading || !hasChanges}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default PerfilClient;

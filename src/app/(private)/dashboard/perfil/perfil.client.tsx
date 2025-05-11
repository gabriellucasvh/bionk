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
import { Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import ToastMessage from "@/components/ToastMessage";
import LoadingPage from "@/components/layout/LoadingPage";

const PerfilClient = () => {
  const { data: session, update: updateSession } = useSession(); 
  const [profile, setProfile] = useState({ name: name ?? "", username: "", bio: "" });
  const [originalProfile, setOriginalProfile] = useState({ name: "", username: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profilePreview, setProfilePreview] = useState<string>(
    session?.user?.image || 'https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png'
  );
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profileImageChanged, setProfileImageChanged] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [originalProfileImageUrl, setOriginalProfileImageUrl] = useState<string>("");

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      try {
        const res = await fetch(`/api/profile/${session.user.id}`);
        const { name = "", username = "", bio = "", image } = await res.json();
        const currentImage = image || session?.user?.image || 'https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png';
        setProfile({ name, username, bio: bio || "" });
        setOriginalProfile({ name, username, bio: bio || "" });
        setProfilePreview(currentImage);
        setOriginalProfileImageUrl(currentImage);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setMessage("Erro ao carregar dados do perfil.");
        const fallbackUrl = session?.user?.image || 'https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png';
        setProfilePreview(fallbackUrl);
        setOriginalProfileImageUrl(fallbackUrl);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [session?.user?.id, session?.user?.image]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const textChanged =
    profile.name !== originalProfile.name ||
    profile.username !== originalProfile.username ||
    profile.bio !== originalProfile.bio;
  const hasChanges = textChanged || profileImageChanged;

  const uploadImage = async (file: File): Promise<boolean> => {
    if (!session?.user?.id) return false;
    setIsUploadingImage(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile");

    try {
      const res = await fetch(`/api/profile/${session.user.id}/upload?type=profile`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da imagem");
      if (data.url) {
        setOriginalProfileImageUrl(data.url);
      }
      setMessage("Foto de perfil atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(`Erro ao fazer upload da imagem:`, error);
      setMessage(`Erro no upload: ${error instanceof Error ? error.message : "Ocorreu um problema"}`);
      setProfilePreview(originalProfileImageUrl);
      return false;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id || (!textChanged && !profileImageChanged)) return;

    setLoading(true);
    setMessage("");
    let imageUploadSuccess = true;
    let textUpdateSuccess = false;
    let finalMessage = "";
    let updatedUserData = null; 

    if (selectedProfileFile) {
      imageUploadSuccess = await uploadImage(selectedProfileFile);
      if (imageUploadSuccess) {
        setSelectedProfileFile(null);
        setProfileImageChanged(false);
        finalMessage = "Foto de perfil atualizada. ";
      } else {
        setLoading(false);
        return;
      }
    }

    if (textChanged) {
      try {
        const res = await fetch(`/api/profile/${session.user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao atualizar o perfil");

        updatedUserData = data.user; 
        setOriginalProfile({ name: updatedUserData.name, username: updatedUserData.username, bio: updatedUserData.bio || "" });
        finalMessage += "Informações do perfil atualizadas com sucesso!";
        textUpdateSuccess = true;
      } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
        finalMessage += `Erro ao salvar informações: ${error instanceof Error ? error.message : "Ocorreu um problema"}`;
      }
    }

    if (imageUploadSuccess || textUpdateSuccess) {
      try {
        const sessionUpdateData = {
          ...session,
          user: {
            ...session?.user,
            name: updatedUserData?.name ?? session?.user?.name, 
            username: updatedUserData?.username ?? session?.user?.username,
            image: imageUploadSuccess && selectedProfileFile === null ? originalProfileImageUrl : (updatedUserData?.image ?? session?.user?.image), // Usa a imagem recém-upada ou a da API ou a da sessão
          },
        };

        await updateSession(sessionUpdateData);
        setMessage(finalMessage || "Perfil atualizado!"); 
        window.location.reload(); 

      } catch (updateError) {
        console.error("Erro ao atualizar a sessão local:", updateError);
        setMessage(finalMessage + " Erro ao atualizar a sessão local.");
      }
    } else {
      setMessage(finalMessage || "Nenhuma alteração para salvar ou erro ocorrido.");
    }

    setLoading(false);
  };

  const handleProfileFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploadingImage) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Erro: A foto de perfil deve ter no máximo 2MB.");
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    setSelectedProfileFile(file);
    setProfileImageChanged(true);

     if (profileInputRef.current) {
        profileInputRef.current.value = "";
     }
  };

  if (isProfileLoading) {
    return <LoadingPage />;
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
              <div className={`h-24 w-24 overflow-hidden rounded-full bg-muted border-2 border-green-500 shadow-md shadow-black/20 ${isUploadingImage ? 'opacity-50' : ''}`}>
                <Image
                  src={profilePreview}
                  alt="Foto de perfil"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  key={profilePreview}
                />
                 {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => !isUploadingImage && profileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={profileInputRef}
                onChange={handleProfileFileSelect}
                disabled={isUploadingImage}
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
                  disabled={loading || isUploadingImage}
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
                    disabled={loading || isUploadingImage}
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
              disabled={loading || isUploadingImage}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={loading || isUploadingImage || !hasChanges}
            >
              {(loading || isUploadingImage) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default PerfilClient;

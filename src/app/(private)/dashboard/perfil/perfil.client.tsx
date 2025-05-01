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
import { Edit, Loader2 } from "lucide-react"; // Importar Loader2
import Image from "next/image";
import ToastMessage from "@/components/ToastMessage";
import LoadingPage from "@/components/layout/LoadingPage";

const PerfilClient = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({ name: "", username: "", bio: "" });
  const [originalProfile, setOriginalProfile] = useState({ name: "", username: "", bio: "" });
  const [loading, setLoading] = useState(false); // Loading para salvar dados do perfil (texto)
  const [isUploadingImage, setIsUploadingImage] = useState(false); // Loading para upload de imagem
  const [message, setMessage] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profilePreview, setProfilePreview] = useState<string>(
    session?.user?.image || "/person.png"
  );
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null); // Estado para guardar o arquivo selecionado
  const [profileImageChanged, setProfileImageChanged] = useState(false); // Estado para rastrear mudança de imagem
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [originalProfileImageUrl, setOriginalProfileImageUrl] = useState<string>(""); // Guardar URL original

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchProfile = async () => {
      setIsProfileLoading(true); // Inicia loading ao buscar
      try {
        const res = await fetch(`/api/profile/${session.user.id}`);
        const { name = "", username = "", bio = "", profileUrl } = await res.json();
        const currentProfileUrl = profileUrl || session?.user?.image || "/person.png";
        setProfile({ name, username, bio: bio || "" });
        setOriginalProfile({ name, username, bio: bio || "" });
        setProfilePreview(currentProfileUrl);
        setOriginalProfileImageUrl(currentProfileUrl); // Guarda a URL original
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setMessage("Erro ao carregar dados do perfil.");
        // Mantém a imagem da sessão ou padrão em caso de erro
        const fallbackUrl = session?.user?.image || "/person.png";
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

  // Verifica se houve alterações nos textos OU na imagem
  const textChanged =
    profile.name !== originalProfile.name ||
    profile.username !== originalProfile.username ||
    profile.bio !== originalProfile.bio;
  const hasChanges = textChanged || profileImageChanged;

  // Função auxiliar para upload de imagem (chamada por handleSaveProfile)
  const uploadImage = async (file: File): Promise<boolean> => {
    if (!session?.user?.id) return false;
    setIsUploadingImage(true);
    setMessage(""); // Limpa mensagens anteriores
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile"); // Hardcoded para perfil aqui

    try {
      const res = await fetch(`/api/profile/${session.user.id}/upload?type=profile`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no upload da imagem");
      // A URL da imagem no banco foi atualizada, mas a preview já está com a nova imagem local.
      // Atualizamos a URL original para refletir o estado salvo.
      if (data.url) {
        setOriginalProfileImageUrl(data.url); // Atualiza a URL original após sucesso
      }
      setMessage("Foto de perfil atualizada com sucesso!"); // Mensagem específica de imagem
      return true; // Indica sucesso
    } catch (error) {
      console.error(`Erro ao fazer upload da imagem:`, error);
      setMessage(`Erro no upload: ${error instanceof Error ? error.message : "Ocorreu um problema"}`);
      // Reverte a preview para a imagem original salva se o upload falhar
      setProfilePreview(originalProfileImageUrl);
      return false; // Indica falha
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id || (!textChanged && !profileImageChanged)) return; // Só salva se houver mudanças

    setLoading(true); // Inicia loading geral (pode cobrir texto e/ou imagem)
    setMessage("");
    let imageUploadSuccess = true;
    let finalMessage = "";

    // 1. Tenta fazer upload da imagem se uma nova foi selecionada
    if (selectedProfileFile) {
      imageUploadSuccess = await uploadImage(selectedProfileFile);
      if (imageUploadSuccess) {
        setSelectedProfileFile(null); // Limpa o arquivo selecionado após sucesso
        setProfileImageChanged(false); // Reseta o estado de mudança da imagem
        finalMessage = "Foto de perfil atualizada. "; // Adiciona à mensagem final
      } else {
        // Se o upload da imagem falhar, paramos aqui. A mensagem de erro já foi definida em uploadImage.
        setLoading(false);
        return;
      }
    }

    // 2. Tenta salvar os dados do perfil (texto) se houveram mudanças OU se a imagem foi salva com sucesso (para atualizar estado geral)
    if (textChanged) {
      try {
        const res = await fetch(`/api/profile/${session.user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Falha ao atualizar o perfil");

        setOriginalProfile(profile); // Atualiza o perfil original com os dados salvos
        finalMessage += "Informações do perfil atualizadas com sucesso!";
      } catch (error) {
        console.error("Erro ao atualizar o perfil:", error);
        // Se o upload da imagem teve sucesso mas o texto falhou, informa ambos
        finalMessage += `Erro ao salvar informações: ${error instanceof Error ? error.message : "Ocorreu um problema"}`;
        setMessage(finalMessage); // Define a mensagem combinada ou de erro
        setLoading(false);
        return; // Para a execução aqui se a atualização do texto falhar
      }
    } else if (imageUploadSuccess && selectedProfileFile === null) {
       // Se só a imagem foi alterada e salva com sucesso
       finalMessage = "Foto de perfil atualizada com sucesso!";
    }


    setMessage(finalMessage || "Nenhuma alteração para salvar."); // Mensagem final de sucesso ou aviso
    setLoading(false); // Finaliza loading geral
    // Resetar estados de mudança só se tudo deu certo
    if (imageUploadSuccess) {
       setProfileImageChanged(false);
       setSelectedProfileFile(null);
    }
    if (textChanged && imageUploadSuccess) { // Garante que o texto foi salvo
        setOriginalProfile(profile);
    }

  };


  // Chamado quando o input[type=file] muda
  const handleProfileFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (isUploadingImage) return; // Impede nova seleção durante upload

    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setMessage("Erro: A foto de perfil deve ter no máximo 2MB.");
      // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente se necessário
      if (profileInputRef.current) {
        profileInputRef.current.value = "";
      }
      return;
    }

    // Gera URL local para preview imediato
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl); // Atualiza a imagem de preview
    setSelectedProfileFile(file); // Guarda o arquivo para upload posterior no save
    setProfileImageChanged(true); // Marca que a imagem foi alterada

    // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente se necessário
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
                  key={profilePreview} // Adiciona key para forçar re-renderização se URL mudar
                />
                 {/* Indicador de Loading sobre a imagem */}
                 {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
              </div>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={() => !isUploadingImage && profileInputRef.current?.click()} // Só permite clique se não estiver carregando
                disabled={isUploadingImage} // Desabilita botão durante upload
              >
                {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={profileInputRef}
                onChange={handleProfileFileSelect} // Mudou para handleProfileFileSelect
                disabled={isUploadingImage} // Desabilita input durante upload
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
                  disabled={loading || isUploadingImage} // Desabilita durante qualquer loading
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
                    disabled={loading || isUploadingImage} // Desabilita durante qualquer loading
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
              disabled={loading || isUploadingImage} // Desabilita durante qualquer loading
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={loading || isUploadingImage || !hasChanges} // Desabilita se carregando ou sem mudanças
            >
              {(loading || isUploadingImage) ? ( // Mostra texto de loading se qualquer operação estiver em andamento
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

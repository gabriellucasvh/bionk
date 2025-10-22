"use client";

import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SectionItem } from "../types/links.types";
import { isValidMusicUrl } from "../utils/music.helpers";

// Local form type for Music only
type MusicFormData = {
  title: string;
  description: string;
  url: string;
  type: "spotify";
  usePreview: boolean;
  sectionId?: number | null;
};

interface AddNewMusicFormProps {
  formData?: MusicFormData;
  setFormData?: (data: MusicFormData) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaveDisabled?: boolean;
  existingSections?: SectionItem[];
  // Allows using the existing videoManager flow for draft creation
  videoManager?: {
    isAddingVideo: boolean;
    videoFormData: any;
    setIsAddingVideo: (isAdding: boolean) => void;
    setVideoFormData: (data: any) => void;
    existingSections: SectionItem[];
    handleAddNewVideo: () => void;
  };
}

const AddNewMusicForm = (props: AddNewMusicFormProps) => {
  const {
    formData: propFormData,
    setFormData: propSetFormData,
    onSave: propOnSave,
    isSaveDisabled: propIsSaveDisabled,
    existingSections: propExistingSections,
    videoManager,
  } = props;

  const formData =
    propFormData ||
    (videoManager?.videoFormData
      ? { ...videoManager.videoFormData, type: "spotify" as const }
      : {
          title: "",
          description: "",
          url: "",
          type: "spotify" as const,
          usePreview: true,
          sectionId: null,
        });

  const setFormData =
    propSetFormData ||
    (videoManager?.setVideoFormData
      ? (d: MusicFormData) => videoManager.setVideoFormData(d as any)
      : () => {});

  const onSave =
    propOnSave || videoManager?.handleAddNewVideo || (() => {});

  const isSaveDisabled =
    propIsSaveDisabled || !formData.url.trim() || !isValidMusicUrl(formData.url).valid;

  const existingSections =
    propExistingSections || videoManager?.existingSections || [];

  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const tryAutoFillTitle = async (url: string) => {
    try {
      const { valid } = isValidMusicUrl(url);
      if (!valid) return;
      if ((formData.title || "").trim().length > 0) return;
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) return;
      const data = await res.json();
      const nextTitle = (data?.title || "").toString();
      if (nextTitle.trim().length > 0) {
        setFormData({ ...formData, title: nextTitle });
      }
    } catch (_) {
      // silent
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex-1 space-y-3 overflow-y-auto">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="url">URL da Música *</Label>
            <Input
              id="url"
              onChange={(e) => {
                const nextUrl = e.target.value;
                const { valid, error } = isValidMusicUrl(nextUrl);
                setUrlError(valid ? null : error || null);
                setFormData({
                  ...formData,
                  url: nextUrl,
                  type: "spotify",
                });
              }}
              onBlur={async (e) => {
                const nextUrl = e.target.value;
                await tryAutoFillTitle(nextUrl);
              }}
              placeholder="Cole a URL do Spotify (track, album, playlist, episódio ou show)"
              type="url"
              value={formData.url}
              aria-invalid={!!urlError}
            />
            {urlError && (
              <p className="text-destructive text-xs">{urlError}</p>
            )}
            <p className="text-muted-foreground text-xs">
              Suportamos links do Spotify (track, album, playlist, episódio e show)
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Como exibir</Label>
            <div className="flex items-center gap-4">
              <RadioGroup
                value={formData.usePreview ? "preview" : "direct"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    usePreview: value === "preview",
                  })
                }
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="opt-preview" value="preview" />
                  <Label htmlFor="opt-preview">Preview (padrão)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="opt-direct" value="direct" />
                  <Label htmlFor="opt-direct">Link Direto</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              maxLength={100}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Digite o título"
              value={formData.title}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              maxLength={200}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Digite uma descrição"
              rows={3}
              value={formData.description}
            />
          </div>

          {existingSections.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="section">Adicionar em uma seção (opcional)</Label>
              <Select
                onValueChange={(value) => {
                  setActiveSection(value);
                  setFormData({
                    ...formData,
                    sectionId: value ? Number(value) : null,
                  });
                }}
                value={activeSection}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder="Selecione uma seção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">(Sem seção)</SelectItem>
                  {existingSections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <BaseButton
          className="px-4"
          disabled={isSaveDisabled || !!urlError}
          loading={isLoading}
          onClick={async () => {
            if (isSaveDisabled || urlError) return;
            setIsLoading(true);
            try {
              await onSave();
            } finally {
              setIsLoading(false);
            }
          }}
        >
          Salvar Música
        </BaseButton>
      </div>
    </div>
  );
};

export default AddNewMusicForm;

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
import {
	fetchMetadataFromProvider,
	parseMusicUrl,
	resolveDeezerShortUrl,
} from "@/utils/music";
import type { MusicFormData } from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";
import { isValidMusicUrl } from "../utils/music.helpers";

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
			? { ...videoManager.videoFormData }
			: {
					title: "",
					url: "",
					usePreview: true,
					sectionId: null,
				});

	const setFormData =
		propSetFormData ||
		(videoManager?.setVideoFormData
			? (d: MusicFormData) => videoManager.setVideoFormData(d as any)
			: () => {});

	const onSave = propOnSave || videoManager?.handleAddNewVideo || (() => {});

	const isSaveDisabled =
		propIsSaveDisabled ||
		!formData.url.trim() ||
		!isValidMusicUrl(formData.url).valid;

	const existingSections =
		propExistingSections || videoManager?.existingSections || [];

	const [isLoading, setIsLoading] = useState(false);
	const [activeSection, setActiveSection] = useState<string>("");
	const [urlError, setUrlError] = useState<string | null>(null);
	const [description, setDescription] = useState<string>("");

	const tryAutoFillTitle = async (inputUrl: string) => {
		try {
			const { valid } = isValidMusicUrl(inputUrl);
			if (!valid) {
				return;
			}
			if ((formData.title || "").trim().length > 0) {
				return;
			}

			const maybeResolvedUrl = inputUrl
				.toLowerCase()
				.includes("link.deezer.com")
				? await resolveDeezerShortUrl(inputUrl)
				: inputUrl;

			const parsed = parseMusicUrl(maybeResolvedUrl);
			const meta = await fetchMetadataFromProvider(parsed);
			const nextTitle = (meta?.title || "").toString();
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
							aria-invalid={!!urlError}
							id="url"
							onBlur={async (e) => {
								const nextUrl = e.target.value;
								await tryAutoFillTitle(nextUrl);
							}}
							onChange={(e) => {
								const nextUrl = e.target.value;
								const { valid, error } = isValidMusicUrl(nextUrl);
								setUrlError(valid ? null : error || null);
								setFormData({
									...formData,
									url: nextUrl,
								});
							}}
							placeholder="Cole a URL do Spotify ou Deezer (track, album, playlist, episódio ou show; aceita link curto do Deezer)"
							type="url"
							value={formData.url}
						/>
						{urlError && <p className="text-destructive text-xs">{urlError}</p>}
						<p className="text-muted-foreground text-xs">
							Suportamos links do Spotify e Deezer (track, album, playlist;
							Spotify também episódio e show). Links curtos do Deezer
							(link.deezer.com) são aceitos.
						</p>
					</div>

					<div className="grid gap-2">
						<Label>Como exibir</Label>
						<div className="flex items-center gap-4">
							<RadioGroup
								className="flex gap-6"
								onValueChange={(value) =>
									setFormData({
										...formData,
										usePreview: value === "preview",
									})
								}
								value={formData.usePreview ? "preview" : "direct"}
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
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Digite uma descrição"
							rows={3}
							value={description}
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
						if (isSaveDisabled || urlError) {
							return;
						}
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

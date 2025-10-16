"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ImageFormData } from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";

interface AddNewImageFormProps {
	formData?: ImageFormData;
	setFormData?: (data: ImageFormData) => void;
	onSave?: () => void;
	onCancel?: () => void;
	isSaveDisabled?: boolean;
	existingSections?: SectionItem[];
	imageManager?: {
		isAddingImage: boolean;
		imageFormData: ImageFormData;
		setIsAddingImage: (isAdding: boolean) => void;
		setImageFormData: (data: ImageFormData) => void;
		existingSections: SectionItem[];
		handleAddNewImage: () => void;
	};
}

const AddNewImageForm = (props: AddNewImageFormProps) => {
	const {
		formData: propFormData,
		setFormData: propSetFormData,
		onSave: propOnSave,
		isSaveDisabled: propIsSaveDisabled,
		existingSections: propExistingSections,
		imageManager,
	} = props;

	const formData = propFormData ||
		imageManager?.imageFormData || {
			title: "",
			description: "",
			layout: "single" as const,
			ratio: "square",
			sizePercent: 100,
			images: [],
			sectionId: null,
		};

	const setFormData =
		propSetFormData || imageManager?.setImageFormData || (() => {});
	const onSave = propOnSave || imageManager?.handleAddNewImage || (() => {});
	const hasImages =
		Array.isArray((formData as any).images) &&
		(formData as any).images.length > 0;
	const computedDisabled = useMemo(() => {
		if (formData.layout === "column") {
			return !(hasImages && formData.title.trim().length > 0);
		}
		return !hasImages;
	}, [formData.layout, hasImages, formData.title]);
	const isSaveDisabled =
		typeof propIsSaveDisabled === "boolean"
			? propIsSaveDisabled
			: computedDisabled;
	const existingSections =
		propExistingSections || imageManager?.existingSections || [];

	const [isLoading, setIsLoading] = useState(false);
	const [activeSection, setActiveSection] = useState<string>("");
	const [uploadError, setUploadError] = useState<string>("");

	const ACCEPTED_IMAGE_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/avif",
		"image/svg+xml",
		"image/bmp",
		"image/heic",
		"image/heif",
	];
	const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

	const uploadFiles = async (files: FileList) => {
		setUploadError("");
		const toAdd: Array<{ url: string; linkUrl?: string }> = [];
		for (const file of Array.from(files)) {
			if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
				setUploadError("Formato não suportado");
				continue;
			}
			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				setUploadError("Imagem muito grande (máx. 10MB)");
				continue;
			}
			const fd = new FormData();
			fd.append("file", file);
			try {
				const res = await fetch("/api/images/upload", {
					method: "POST",
					body: fd,
				});
				const json = await res.json();
				if (!(res.ok && json.url)) {
					setUploadError(json.error || "Falha no upload");
					continue;
				}
				toAdd.push({ url: json.url });
			} catch (e) {
				setUploadError("Erro no upload");
			}
		}
		if (toAdd.length > 0) {
			if (formData.layout === "single") {
				setFormData({ ...formData, images: [toAdd[0]] });
			} else {
				setFormData({
					...formData,
					images: [...(formData.images || []), ...toAdd],
				});
			}
		}
	};

	const addImageUrls = (urls: string[]) => {
		const cleaned = urls.map((u) => u.trim()).filter((u) => !!u);
		if (cleaned.length === 0) return;
		const items = cleaned.map((u) => ({ url: u }));
		if (formData.layout === "single") {
			setFormData({ ...formData, images: [items[0]] });
		} else {
			setFormData({
				...formData,
				images: [...(formData.images || []), ...items],
			});
		}
	};

	const handleUrlAddSingle = (value: string) => {
		const v = value.trim();
		if (!v) return;
		addImageUrls([v]);
	};

	const handleUrlAddMultiple = (value: string) => {
		const parts = value
			.split(/\n|,/)
			.map((u) => u.trim())
			.filter((u) => !!u);
		addImageUrls(parts);
	};

	const updateLinkUrl = (index: number, linkUrl: string) => {
		const next = [...(formData.images || [])];
		if (!next[index]) return;
		next[index] = { ...next[index], linkUrl };
		setFormData({ ...formData, images: next });
	};

	const removeImage = (index: number) => {
		const next = [...(formData.images || [])];
		next.splice(index, 1);
		setFormData({ ...formData, images: next });
	};

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await onSave();
		} finally {
			setIsLoading(false);
		}
	};

	const handleSectionChange = (value: string) => {
		setActiveSection(value);
		if (value === "none") {
			setFormData({
				...formData,
				sectionId: null,
			});
		} else {
			const section = existingSections.find((s) => s.id === value);
			setFormData({
				...formData,
				sectionId: section ? section.dbId : null,
			});
		}
	};

	return (
		<div className="flex h-full flex-col space-y-4">
			<div className="flex-1 space-y-3 overflow-y-auto">
				<div className="grid gap-3">
					{formData.layout === "single" ? (
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label>Upload de imagem</Label>
								<Input
									accept={ACCEPTED_IMAGE_TYPES.join(",")}
									onChange={(e) => {
										const files = e.target.files;
										if (files) uploadFiles(files);
									}}
									type="file"
								/>
								{uploadError && (
									<p className="text-destructive text-xs">{uploadError}</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label>Ou usar URL</Label>
								<div className="flex gap-2">
									<Input
										onBlur={(e) => handleUrlAddSingle(e.target.value)}
										placeholder="https://..."
									/>
									<BaseButton
										onClick={() => {
											const el = document.querySelector<HTMLInputElement>(
												"input[placeholder='https://...']"
											);
											if (el) handleUrlAddSingle(el.value);
										}}
									>
										Adicionar
									</BaseButton>
								</div>
							</div>
						</div>
					) : (
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label>Upload de imagens</Label>
								<Input
									accept={ACCEPTED_IMAGE_TYPES.join(",")}
									multiple
									onChange={(e) => {
										const files = e.target.files;
										if (files) uploadFiles(files);
									}}
									type="file"
								/>
								{uploadError && (
									<p className="text-destructive text-xs">{uploadError}</p>
								)}
							</div>
							<div className="grid gap-2">
								<Label>URLs das imagens</Label>
								<Textarea
									className="min-h-[80px] resize-none"
									onBlur={(e) => handleUrlAddMultiple(e.target.value)}
									placeholder="Cole uma ou várias URLs (uma por linha ou separadas por vírgula)"
								/>
							</div>
						</div>
					)}

					{formData.images && formData.images.length > 0 && (
						<div className="grid gap-3">
							<Label>Imagens adicionadas</Label>
							<div className="space-y-3">
								{formData.images.map((img, idx) => (
									<div
										className="flex items-center gap-3"
										key={`${img.url}-${idx}`}
									>
										<div className="relative h-12 w-12 overflow-hidden rounded">
											<Image
												alt={`Imagem ${idx + 1}`}
												className="h-12 w-12 object-cover"
												height={48}
												src={img.url}
												width={48}
											/>
										</div>
										<Input
											onChange={(e) => updateLinkUrl(idx, e.target.value)}
											placeholder="URL do link (opcional)"
											value={img.linkUrl || ""}
										/>
										<BaseButton
											onClick={() => removeImage(idx)}
											variant="white"
										>
											Remover
										</BaseButton>
									</div>
								))}
							</div>
						</div>
					)}

					{formData.layout === "column" && (
						<div className="grid gap-2">
							<Label htmlFor="title">Título *</Label>
							<Input
								id="title"
								maxLength={100}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Título do bloco de imagem"
								value={formData.title}
							/>
							<p className="text-muted-foreground text-xs">
								Obrigatório no layout de coluna
							</p>
						</div>
					)}

					{formData.layout !== "single" && (
						<div className="grid gap-2">
							<Label htmlFor="description">Descrição (opcional)</Label>
							<Textarea
								className="min-h-[60px] resize-none"
								id="description"
								maxLength={200}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Descrição do bloco de imagem"
								value={formData.description}
							/>
							<p className="text-muted-foreground text-xs">
								Máximo 200 caracteres
							</p>
						</div>
					)}

					<div className="grid gap-2">
						<Label htmlFor="ratio">Proporção</Label>
						<Select
							onValueChange={(value) =>
								setFormData({ ...formData, ratio: value })
							}
							value={formData.ratio}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione a proporção" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="square">Quadrado</SelectItem>
								<SelectItem value="16:9">16:9</SelectItem>
								<SelectItem value="3:2">3:2</SelectItem>
								<SelectItem value="3:1">3:1</SelectItem>
								<SelectItem value="auto">Auto</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="size">Tamanho (%)</Label>
						<input
							id="size"
							max={120}
							min={50}
							onChange={(e) =>
								setFormData({
									...formData,
									sizePercent: Number(e.target.value),
								})
							}
							step={5}
							type="range"
							value={formData.sizePercent}
						/>
						<p className="text-muted-foreground text-xs">
							{formData.sizePercent}%
						</p>
					</div>

					{existingSections.length > 0 && (
						<div className="grid gap-2">
							<Label htmlFor="section">Seção</Label>
							<Select onValueChange={handleSectionChange} value={activeSection}>
								<SelectTrigger>
									<SelectValue placeholder="Selecione uma seção (opcional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">Sem seção</SelectItem>
									{existingSections.map((section) => (
										<SelectItem key={section.id} value={section.id}>
											{section.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>
			</div>

			<div className="flex-shrink-0 border-t pt-3">
				<div className="flex gap-3">
					<BaseButton
						className="flex-1"
						disabled={isSaveDisabled}
						loading={isLoading}
						onClick={handleSave}
					>
						Salvar Imagem
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default AddNewImageForm;

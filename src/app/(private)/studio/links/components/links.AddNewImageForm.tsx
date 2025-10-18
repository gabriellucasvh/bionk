"use client";

import { HelpCircle, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingSpinner from "@/components/buttons/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
	// Novo: controle de edição e limites
	mode?: "create" | "edit";
	maxImages?: number; // aplica para layouts com múltiplas imagens
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
		mode: propMode = "create",
		maxImages: propMaxImages,
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
	const onCancel = props.onCancel || (() => {});
	const hasImages =
		Array.isArray((formData as any).images) &&
		(formData as any).images.length > 0;
	const computedDisabled = useMemo(() => {
		const count = Array.isArray(formData.images) ? formData.images.length : 0;
		if (formData.layout === "column") {
			return !(count > 0 && formData.title.trim().length > 0);
		}
		if (formData.layout === "carousel") {
			return count < 2;
		}
		return count === 0;
	}, [formData.layout, formData.images, formData.title]);
	const isSaveDisabled =
		typeof propIsSaveDisabled === "boolean"
			? propIsSaveDisabled
			: computedDisabled;
	const existingSections =
		propExistingSections || imageManager?.existingSections || [];

	// Destaques visuais por layout para diferenciar claramente os formulários
	const accent =
		formData.layout === "single"
			? { border: "border-emerald-500", bg: "bg-emerald-50" }
			: formData.layout === "column"
				? { border: "border-teal-500", bg: "bg-teal-50" }
				: { border: "border-indigo-500", bg: "bg-indigo-50" };
	const accentDragClass = `${accent.border} ${accent.bg}`;

	const [isLoading, setIsLoading] = useState(false);
	const [didSubmit, setDidSubmit] = useState(false);
	const [showInputsSingle, setShowInputsSingle] = useState(() => false);
	const [isDragOverSingle, setIsDragOverSingle] = useState(false);
	const [isDragOverMultiple, setIsDragOverMultiple] = useState(false);
	const fileInputSingleRef = useRef<HTMLInputElement>(null);
	const fileInputMultipleRef = useRef<HTMLInputElement>(null);
	const [activeSection, setActiveSection] = useState<string>("");
	const [uploadError, setUploadError] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);

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

	const maxImages = useMemo(() => {
		if (formData.layout === "single") {
			return 1;
		}
		return typeof propMaxImages === "number" ? propMaxImages : 10;
	}, [formData.layout, propMaxImages]);

	// Quando remover a única imagem em "single", reabrir o dropzone (evita acionar no primeiro render)
	const didMountRef = useRef(false);
	useEffect(() => {
		if (formData.layout === "single") {
			const count = (formData.images || []).length;
			if (didMountRef.current && count === 0) {
				setShowInputsSingle(true);
			}
		}
		didMountRef.current = true;
	}, [formData.layout, formData.images?.length]);

	const uploadFiles = async (files: FileList) => {
		setUploadError("");
		setIsUploading(true);
		try {
			const arr = Array.from(files);
			const accepted = arr.filter((file) => {
				if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
					setUploadError("Formato não suportado");
					return false;
				}
				if (file.size > MAX_IMAGE_SIZE_BYTES) {
					setUploadError("Imagem muito grande (máx. 10MB)");
					return false;
				}
				return true;
			});

			const requests = accepted.map((file) => {
				const fd = new FormData();
				fd.append("file", file);
				return fetch("/api/images/upload", { method: "POST", body: fd }).then(
					async (res) => {
						const json = await res.json();
						if (!(res.ok && json.url)) {
							throw new Error(json.error || "Falha no upload");
						}
						return { url: json.url } as { url: string; linkUrl?: string };
					}
				);
			});

			const results = await Promise.allSettled(requests);
			const toAdd = results
				.filter((r) => r.status === "fulfilled")
				.map(
					(r) =>
						(r as PromiseFulfilledResult<{ url: string; linkUrl?: string }>)
							.value
				);

			if (toAdd.length === 0) {
				const firstRej = results.find((r) => r.status === "rejected") as
					| PromiseRejectedResult
					| undefined;
				if (firstRej) {
					setUploadError(firstRej.reason?.message || "Erro no upload");
				}
				return;
			}

			// Para layout "single", sempre substituir a imagem existente
			if (formData.layout === "single") {
				setFormData({ ...formData, images: [toAdd.at(-1)!] });
				setUploadError("");
				// Oculta o dropzone após escolher a imagem
				setShowInputsSingle(false);
				return;
			}

			// Para layouts com múltiplas imagens, respeitar o limite
			const currentCount = (formData.images || []).length;
			const allowed = Math.max(0, maxImages - currentCount);
			if (allowed <= 0) {
				setUploadError(`Limite de ${maxImages} imagem(s) atingido`);
				return;
			}
			const sliced = toAdd.slice(0, allowed);
			setFormData({
				...formData,
				images: [...(formData.images || []), ...sliced],
			});
		} catch (e) {
			setUploadError("Erro no upload");
		} finally {
			setIsUploading(false);
		}
	};

	// Removidos handlers de URL de imagem não utilizados

	const updateLinkUrl = (index: number, linkUrl: string) => {
		const next = [...(formData.images || [])];
		if (!next[index]) {
			return;
		}
		next[index] = { ...next[index], linkUrl };
		setFormData({ ...formData, images: next });
	};

	const removeImage = (index: number) => {
		const next = [...(formData.images || [])];
		next.splice(index, 1);
		setFormData({ ...formData, images: next });
		if (formData.layout === "single") {
			setShowInputsSingle(next.length === 0);
		}
	};

	const handleSave = async () => {
		if (propMode === "edit" && didSubmit) {
			return;
		}
		if (propMode === "edit") {
			setDidSubmit(true);
		}
		setIsLoading(true);
		try {
			await onSave();
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		onCancel();
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
				{/* Cabeçalho profissional com ajuda contextual */}
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg">
						{formData.layout === "single" && "Imagem – Única"}
						{formData.layout === "column" && "Imagem – Coluna"}
						{formData.layout === "carousel" && "Imagem – Carrossel"}
					</h3>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								aria-label="Ajuda do layout"
								className="h-8 w-8"
								size="icon"
								variant="ghost"
							>
								<HelpCircle className="h-4 w-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-70 text-sm">
							{formData.layout === "single" && (
								<p>
									Envie uma única imagem para destaque simples. Limite: 1
									imagem.
								</p>
							)}
							{formData.layout === "column" && (
								<p>
									Organize várias imagens em colunas. Título é obrigatório.
									Limite: 10 imagens.
								</p>
							)}
							{formData.layout === "carousel" && (
								<p>
									Crie um carrossel navegável de imagens. Título opcional.
									Limite: 10 imagens.
								</p>
							)}
						</PopoverContent>
					</Popover>
				</div>
				<div className="grid gap-3">
					{formData.layout === "single" ? (
						<div className="grid gap-4">
							{showInputsSingle && (
								<>
									<div className="grid gap-2">
										<Label>Upload de imagem</Label>
										<input
											accept={ACCEPTED_IMAGE_TYPES.join(",")}
											className="hidden"
											disabled={isUploading}
											onChange={(e) => {
												const files = e.target.files;
												if (files) {
													uploadFiles(files);
												}
											}}
											ref={fileInputSingleRef}
											type="file"
										/>
										<div
											aria-busy={isUploading}
											aria-disabled={isUploading}
											className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
												isUploading
													? "pointer-events-none cursor-not-allowed opacity-60"
													: "cursor-pointer"
											} ${
												isDragOverSingle
													? accentDragClass
													: "border-gray-300 hover:bg-muted/30"
											}`}
											onClick={() =>
												!isUploading && fileInputSingleRef.current?.click()
											}
											onDragLeave={(e) => {
												e.preventDefault();
												if (isUploading) {
													return;
												}
												setIsDragOverSingle(false);
											}}
											onDragOver={(e) => {
												e.preventDefault();
												if (isUploading) {
													return;
												}
												setIsDragOverSingle(true);
											}}
											onDrop={(e) => {
												e.preventDefault();
												if (isUploading) {
													return;
												}
												setIsDragOverSingle(false);
												const files = e.dataTransfer.files;
												if (files && files.length > 0) {
													uploadFiles(files);
												}
											}}
											role="none"
										>
											{isUploading ? (
												<div className="mx-auto mt-1 flex justify-center">
													<LoadingSpinner />
												</div>
											) : (
												<Upload className="mx-auto h-8 w-8 text-muted-foreground" />
											)}
											<p className="mt-2 font-medium">
												Arraste uma imagem ou clique para selecionar
											</p>
											<p className="text-muted-foreground text-sm">
												Formatos: JPG, PNG, GIF, SVG, WebP, etc.
											</p>
										</div>
										{uploadError && (
											<p className="text-destructive text-xs">{uploadError}</p>
										)}
									</div>
									{/* Removido: opção de adicionar por URL */}
								</>
							)}
							{!showInputsSingle && (
								<div className="flex justify-end">
									<BaseButton
										onClick={() => setShowInputsSingle(true)}
										variant="white"
									>
										Alterar imagem
									</BaseButton>
								</div>
							)}
						</div>
					) : (
						<div className="grid gap-4">
							{(formData.images || []).length < maxImages && (
								<div className="grid gap-2">
									<Label>Upload de imagens</Label>
									<input
										accept={ACCEPTED_IMAGE_TYPES.join(",")}
										className="hidden"
										disabled={isUploading}
										multiple
										onChange={(e) => {
											const files = e.target.files;
											if (files) {
												uploadFiles(files);
											}
										}}
										ref={fileInputMultipleRef}
										type="file"
									/>
									<div
										aria-busy={isUploading}
										aria-disabled={isUploading}
										className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
											isUploading
												? "pointer-events-none cursor-not-allowed opacity-60"
												: "cursor-pointer"
										} ${
											isDragOverMultiple
												? accentDragClass
												: "border-gray-300 hover:bg-muted/30"
										}`}
										onClick={() =>
											!isUploading && fileInputMultipleRef.current?.click()
										}
										onDragLeave={(e) => {
											e.preventDefault();
											if (isUploading) {
												return;
											}
											setIsDragOverMultiple(false);
										}}
										onDragOver={(e) => {
											e.preventDefault();
											if (isUploading) {
												return;
											}
											setIsDragOverMultiple(true);
										}}
										onDrop={(e) => {
											e.preventDefault();
											if (isUploading) {
												return;
											}
											setIsDragOverMultiple(false);
											const files = e.dataTransfer.files;
											if (files && files.length > 0) {
												uploadFiles(files);
											}
										}}
										role="none"
									>
										{isUploading ? (
											<div className="mx-auto mt-1 flex justify-center">
												<LoadingSpinner />
											</div>
										) : (
											<Upload className="mx-auto h-8 w-8 text-muted-foreground" />
										)}
										<p className="mt-2 font-medium">
											Arraste imagens ou clique para selecionar
										</p>
										<p className="text-muted-foreground text-sm">
											Formatos: JPG, PNG, GIF, SVG, WebP, etc.
										</p>
									</div>
									{uploadError && (
										<p className="text-destructive text-xs">{uploadError}</p>
									)}
								</div>
							)}
							{/* Removido: opção de adicionar múltiplas imagens por URL */}
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
										<div
											className="relative w-28 overflow-hidden rounded"
											style={{
												aspectRatio:
													formData.ratio === "square"
														? "1 / 1"
														: formData.ratio?.includes(":")
															? (formData.ratio as string).replace(":", " / ")
															: "1 / 1",
											}}
										>
											<Image
												alt={`Imagem ${idx + 1}`}
												className="object-cover"
												fill
												sizes="112px"
												src={img.url}
											/>
										</div>
										<Input
											onChange={(e) => updateLinkUrl(idx, e.target.value)}
											placeholder="URL do link (opcional)"
											value={img.linkUrl || ""}
										/>
										{!(propMode === "edit" && formData.layout === "single") && (
											<BaseButton
												className="h-10"
												onClick={() => removeImage(idx)}
												variant="white"
											>
												Remover
											</BaseButton>
										)}
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
								maxLength={80}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Título do bloco de imagem"
								value={formData.title}
							/>
							<p className="text-muted-foreground text-xs">
								{formData.title.length}/80 caracteres • Obrigatório no layout de
								coluna
							</p>
						</div>
					)}

					{formData.layout !== "column" && (
						<div className="grid gap-2">
							<Label htmlFor="title">Título (opcional)</Label>
							<Input
								id="title"
								maxLength={80}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Título do bloco de imagem"
								value={formData.title}
							/>
							<p className="text-muted-foreground text-xs">
								{formData.title.length}/80 caracteres
							</p>
						</div>
					)}

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
							{formData.description.length}/200 caracteres
						</p>
					</div>

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
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="size">Tamanho (%)</Label>
						<Slider
							max={100}
							min={50}
							onValueChange={(vals) => {
								const raw = Array.isArray(vals) ? (vals[0] ?? 50) : 50;
								const next = Math.max(50, Math.min(100, Number(raw)));
								setFormData({ ...formData, sizePercent: next });
							}}
							step={5}
							value={[Math.max(50, Math.min(100, formData.sizePercent))]}
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
				<div className="flex items-center justify-end gap-3">
					<BaseButton
						className="px-4"
						onClick={handleCancel}
						type="button"
						variant="white"
					>
						<X className="mr-2 h-4 w-4" /> Cancelar
					</BaseButton>
					<BaseButton
						className="px-4"
						disabled={isSaveDisabled || (propMode === "edit" && didSubmit)}
						loading={isLoading}
						onClick={handleSave}
						type="button"
					>
						<Save className="mr-2 h-4 w-4" /> Salvar
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default AddNewImageForm;

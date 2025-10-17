"use client";

import { Search, Upload, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BaseButton } from "../buttons/BaseButton";
import LoadingSpinner from "../buttons/LoadingSpinner";

type BackgroundMediaModalProps = {
	isOpen: boolean;
	type: "image" | "video";
	onClose: () => void;
	onUploaded: (url: string, type: "image" | "video") => void;
};

type MediaItem = {
	id: string;
	type: "image" | "video";
	provider: "pexels" | "coverr";
	previewUrl: string;
	url: string;
	width?: number;
	height?: number;
	authorName?: string;
	authorLink?: string;
	sourceLink?: string;
	coverrDownloadUrl?: string; // Coverr
};

const ACCEPTED_IMAGE_EXTS = [
	"jpeg",
	"jpg",
	"png",
	"gif",
	"webp",
	"avif",
	"svg",
	"bmp",
	"heic",
	"heif",
];

const ACCEPTED_VIDEO_EXTS = ["mp4", "webm"]; // HEVC uses mp4 container

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function getExtension(name = "") {
	const parts = name.split(".");
	return parts.at(-1)?.toLowerCase() || "";
}

// Removido modal custom, adotando padrão Dialog como em ImageCropModal

export default function BackgroundMediaModal({
	isOpen,
	type,
	onClose,
	onUploaded,
}: BackgroundMediaModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const [activeTab, setActiveTab] = useState<"upload" | "library">("upload");
	const [query, setQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [results, setResults] = useState<MediaItem[]>([]);
	const [selectedRemote, setSelectedRemote] = useState<MediaItem | null>(null);

	const objectUrl = useMemo(
		() => (file ? URL.createObjectURL(file) : ""),
		[file]
	);

	const imageSrc = useMemo(() => {
		if (type !== "image") {
			return "";
		}
		if (selectedRemote && selectedRemote.type === "image") {
			return selectedRemote.url;
		}
		return objectUrl;
	}, [type, selectedRemote, objectUrl]);

	const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
		setCroppedAreaPixels(areaPixels);
	}, []);

	const reset = () => {
		setFile(null);
		setError("");
		setZoom(1);
		setCrop({ x: 0, y: 0 });
		setCroppedAreaPixels(null);
		setActiveTab("upload");
		setQuery("");
		setResults([]);
		setSelectedRemote(null);
	};

	const performSearch = async () => {
		setIsSearching(true);
		setError("");
		try {
			const qs = new URLSearchParams({ type, q: query || "" }).toString();
			const res = await fetch(`/api/media/search?${qs}`);
			const ct = res.headers.get("content-type") || "";
			if (!ct.includes("application/json")) {
				const text = await res.text();
				throw new Error(text || "Falha na busca de mídias");
			}
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || "Falha na busca de mídias");
			}
			setResults(Array.isArray(data.items) ? data.items : []);
		} catch (e: any) {
			setError(e?.message || "Erro na busca");
		} finally {
			setIsSearching(false);
		}
	};

	useEffect(() => {
		if (activeTab === "library" && results.length === 0) {
			performSearch().catch(() => {});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);

	const validateFile = (f: File) => {
		const ext = getExtension(f.name);
		if (type === "image") {
			if (!ACCEPTED_IMAGE_EXTS.includes(ext)) {
				return "Formato de imagem não suportado.";
			}
			if (f.size > MAX_IMAGE_SIZE_BYTES) {
				return "Imagem muito grande (máx. 10MB).";
			}
			return "";
		}
		if (type === "video") {
			if (!ACCEPTED_VIDEO_EXTS.includes(ext)) {
				return "Formato de vídeo não suportado.";
			}
			if (f.size > MAX_VIDEO_SIZE_BYTES) {
				return "Vídeo muito grande (máx. 50MB).";
			}
			return "";
		}
		return "Tipo inválido";
	};

	const handleFileSelect = (f: File) => {
		const err = validateFile(f);
		if (err) {
			setError(err);
			return;
		}
		setFile(f);
		setError("");
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer?.files[0]) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleUpload = async () => {
		setIsUploading(true);
		try {
			// Upload local de arquivo
			if (file) {
				// Assinar upload direto no Cloudinary
				const signRes = await fetch("/api/background/sign-upload", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						type,
						crop:
							type === "image" && croppedAreaPixels
								? {
										x: Math.round(croppedAreaPixels.x),
										y: Math.round(croppedAreaPixels.y),
										width: Math.round(croppedAreaPixels.width),
										height: Math.round(croppedAreaPixels.height),
									}
								: null,
					}),
				});
				const signCt = signRes.headers.get("content-type") || "";
				if (!signCt.includes("application/json")) {
					const text = await signRes.text();
					throw new Error(text || "Falha ao preparar upload");
				}
				const signData = await signRes.json();
				if (!signRes.ok) {
					throw new Error(signData?.error || "Falha ao preparar upload");
				}

				const fd = new FormData();
				fd.append("file", file);
				fd.append("api_key", signData.apiKey);
				fd.append("timestamp", String(signData.timestamp));
				fd.append("signature", signData.signature);
				fd.append("folder", signData.params.folder);
				fd.append("public_id", signData.params.public_id);
				fd.append("overwrite", String(signData.params.overwrite));
				fd.append("transformation", signData.params.transformation);

				const uploadRes = await fetch(signData.uploadUrl, {
					method: "POST",
					body: fd,
				});
				const uploadCt = uploadRes.headers.get("content-type") || "";
				if (!uploadCt.includes("application/json")) {
					const text = await uploadRes.text();
					throw new Error(text || "Falha no upload");
				}
				const uploadData = await uploadRes.json();
				if (!uploadRes.ok) {
					throw new Error(uploadData?.error?.message || "Falha no upload");
				}
				onUploaded(uploadData.secure_url, type);
				reset();
				onClose();
				return;
			}

			// Importar mídia remota da biblioteca
			if (selectedRemote) {
				const body = {
					url: selectedRemote.url,
					type,
					crop:
						type === "image" && croppedAreaPixels
							? {
									x: Math.round(croppedAreaPixels.x),
									y: Math.round(croppedAreaPixels.y),
									width: Math.round(croppedAreaPixels.width),
									height: Math.round(croppedAreaPixels.height),
								}
							: null,
					credit: {
						provider: selectedRemote.provider,
						authorName: selectedRemote.authorName,
						authorLink: selectedRemote.authorLink,
						sourceLink: selectedRemote.sourceLink,
						coverrDownloadUrl: selectedRemote.coverrDownloadUrl,
					},
				};

				const res = await fetch("/api/background/import", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				});
				const contentType = res.headers.get("content-type") || "";
				if (!contentType.includes("application/json")) {
					const text = await res.text();
					throw new Error(text || "Falha ao importar mídia");
				}
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data?.error || "Falha ao importar mídia");
				}
				onUploaded(data.url, type);
				reset();
				onClose();
				return;
			}

			setError("Selecione um arquivo ou escolha da biblioteca.");
		} catch (e: any) {
			setError(e?.message || "Erro ao enviar mídia");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) {
					reset();
					onClose();
				}
			}}
			open={isOpen}
		>
			<DialogContent className="w-full max-w-[90vw] rounded-2xl border bg-background p-6 shadow-xl sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-center font-bold text-gray-900 text-xl dark:text-white">
						{type === "image"
							? "Imagem de fundo (9:16)"
							: "Vídeo de fundo (9:16)"}
					</DialogTitle>
					<DialogDescription className="text-center text-gray-600 dark:text-white/80">
						{type === "image"
							? "Faça o crop vertical (9:16). Formatos: JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC, HEIF."
							: "Upload de vídeo vertical. Formatos: WebM, MP4 (HEVC)."}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					<Tabs onValueChange={(v) => setActiveTab(v as any)} value={activeTab}>
						<TabsList>
							<TabsTrigger value="upload">Upload</TabsTrigger>
							<TabsTrigger className="pr-4" value="library">
								<div className="flex items-center gap-2">
									{/** biome-ignore lint/performance/noImgElement: <Aqui pega somente o favicon> */}
									<img
										alt={type === "image" ? "Pexels" : "Coverr"}
										className="h-5 w-5"
										src={
											type === "image"
												? "https://www.pexels.com/favicon.ico"
												: "https://coverr.co/favicon.ico"
										}
									/>
									<span>{type === "image" ? "Pexels" : "Coverr"}</span>
								</div>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="upload">
							{!file && (
								<div
									className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
										dragActive
											? "border-blue-500 bg-blue-50"
											: "border-gray-300 hover:border-gray-400"
									}`}
									onClick={() =>
										document
											.getElementById(
												type === "image"
													? "background-file-upload-input"
													: "background-video-upload-input"
											)
											?.click()
									}
									onDragEnter={handleDrag}
									onDragLeave={handleDrag}
									onDragOver={handleDrag}
									onDrop={handleDrop}
									role="none"
								>
									<Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
									<p className="mb-2 font-medium text-gray-700 dark:text-white">
										{type === "image"
											? "Arraste uma imagem ou clique para selecionar"
											: "Arraste um vídeo ou clique para selecionar"}
									</p>
									<p className="text-gray-500 text-sm dark:text-white/80">
										{type === "image"
											? "Formatos: JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC, HEIF."
											: "Formatos: MP4, WebM."}
									</p>
									<input
										accept={type === "image" ? "image/*" : "video/*"}
										className="hidden"
										id={
											type === "image"
												? "background-file-upload-input"
												: "background-video-upload-input"
										}
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) {
												handleFileSelect(f);
											}
										}}
										type="file"
									/>
								</div>
							)}

							{type === "image" && file ? (
								<div className="space-y-4">
									<div className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-100">
										<Cropper
											aspect={9 / 16}
											crop={crop}
											image={imageSrc}
											maxZoom={3}
											minZoom={1}
											onCropChange={setCrop}
											onCropComplete={onCropComplete}
											onZoomChange={setZoom}
											restrictPosition
											showGrid
											zoom={zoom}
										/>
									</div>
									<div className="space-y-3">
										<Label htmlFor="zoom-slider">Zoom</Label>
										<div className="flex items-center gap-2">
											<ZoomOut className="h-5 w-5 text-gray-500" />
											<Slider
												id="zoom-slider"
												max={3}
												min={1}
												onValueChange={(value) => setZoom(value[0])}
												step={0.1}
												value={[zoom]}
											/>
											<ZoomIn className="h-5 w-5 text-gray-500" />
										</div>
									</div>
									<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
										<BaseButton
											className="flex w-full items-center justify-center gap-2"
											onClick={() => setFile(null)}
											variant="white"
										>
											Escolher Outra
										</BaseButton>
										<BaseButton
											className="flex w-full items-center justify-center gap-2"
											loading={isUploading}
											onClick={handleUpload}
										>
											Salvar Fundo
										</BaseButton>
									</div>
								</div>
							) : null}

							{type === "video" && file ? (
								<div className="space-y-4">
									<video
										className="mx-auto max-h-[50vh] w-full rounded-lg"
										controls
										muted
										src={objectUrl}
									/>
									<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
										<BaseButton
											className="flex w-full items-center justify-center gap-2"
											onClick={() => setFile(null)}
											variant="white"
										>
											Escolher Outra
										</BaseButton>
										<BaseButton
											className="flex w-full items-center justify-center gap-2"
											loading={isUploading}
											onClick={handleUpload}
										>
											Salvar Vídeo
										</BaseButton>
									</div>
								</div>
							) : null}

							{error && <div className="text-red-600">{error}</div>}
						</TabsContent>

						<TabsContent value="library">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<div className="relative flex-1">
										<Input
											onChange={(e) => setQuery(e.target.value)}
											placeholder={
												type === "image"
													? "Buscar imagens (Pexels)"
													: "Buscar vídeos (Coverr)"
											}
											value={query}
										/>
									</div>
									<BaseButton
										className="h-10 w-32"
										loading={isSearching}
										onClick={performSearch}
									>
										<span className="flex items-center justify-center gap-2">
											<Search className="h-4 w-4 " />
											Buscar
										</span>
									</BaseButton>
								</div>

								{selectedRemote ? (
									<div className="space-y-4">
										{type === "image" ? (
											<div className="space-y-4">
												<div className="relative h-80 w-full overflow-hidden rounded-lg bg-gray-100">
													<Cropper
														aspect={9 / 16}
														crop={crop}
														image={imageSrc}
														maxZoom={3}
														minZoom={1}
														onCropChange={setCrop}
														onCropComplete={onCropComplete}
														onZoomChange={setZoom}
														restrictPosition
														showGrid
														zoom={zoom}
													/>
												</div>
												<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
													<BaseButton
														className="flex w-full items-center justify-center gap-2"
														onClick={() => {
															setSelectedRemote(null);
															setCroppedAreaPixels(null);
															setZoom(1);
														}}
														variant="white"
													>
														Escolher Outra
													</BaseButton>
													<BaseButton
														className="flex w-full items-center justify-center gap-2"
														disabled={isUploading}
														loading={isUploading}
														onClick={handleUpload}
													>
														{isUploading ? (
															<span className="flex items-center justify-center gap-2">
																<LoadingSpinner />
																Importando...
															</span>
														) : (
															<span className="flex items-center justify-center gap-2">
																<Upload className="h-4 w-4" />
																Importar Fundo
															</span>
														)}
													</BaseButton>
												</div>
											</div>
										) : (
											<div className="space-y-4">
												<video
													className="mx-auto max-h-[50vh] w-full rounded-lg"
													controls
													muted
													src={selectedRemote.url}
												/>
												<div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
													<BaseButton
														className="flex w-full items-center justify-center gap-2"
														onClick={() => setSelectedRemote(null)}
														variant="white"
													>
														Escolher Outra
													</BaseButton>
													<BaseButton
														className="flex w-full items-center justify-center gap-2"
														disabled={isUploading}
														loading={isUploading}
														onClick={handleUpload}
													>
														{isUploading ? (
															<span className="flex items-center justify-center gap-2">
																<LoadingSpinner />
																Importando...
															</span>
														) : (
															<span className="flex items-center justify-center gap-2">
																<Upload className="h-4 w-4" />
																Importar Vídeo
															</span>
														)}
													</BaseButton>
												</div>
											</div>
										)}
									</div>
								) : null}

								{!selectedRemote && (
									<div className="max-h-[50vh] overflow-y-auto pr-1 sm:max-h-[220px]">
										<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
											{results.map((item) => (
												<button
													className="group cursor-pointer rounded-lg border p-2 text-left transition-colors hover:border-green-600"
													key={item.id}
													onClick={() => setSelectedRemote(item)}
													type="button"
												>
													<div className="relative aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
														{item.type === "image" ? (
															<Image
																alt={item.authorName || "Imagem"}
																className="pointer-events-none h-full w-full object-cover"
																fill
																src={item.previewUrl}
															/>
														) : // For Coverr, previewUrl may be an image (thumbnail/poster) or an mp4_preview
														item.previewUrl?.toLowerCase().includes(".mp4") ||
															item.previewUrl
																?.toLowerCase()
																.includes("/mp4") ? (
															<video
																className="pointer-events-none h-full w-full object-cover"
																muted
																playsInline
																src={item.previewUrl || item.url}
															/>
														) : (
															// biome-ignore lint/performance/noImgElement: <Use a native img to avoid Next/Image remote domain restrictions>
															<img
																alt={item.authorName || "Vídeo"}
																className="pointer-events-none h-full w-full object-cover"
																src={item.previewUrl || item.url}
															/>
														)}
													</div>
													<div className="mt-2">
														<p className="text-muted-foreground text-xs">
															{item.provider === "pexels" ? "Pexels" : "Coverr"}
														</p>
														<p className="truncate text-xs">
															{item.authorName ||
																(item.provider === "coverr"
																	? "Coverr"
																	: "Autor desconhecido")}
														</p>
													</div>
												</button>
											))}
											{results.length === 0 && !isSearching && (
												<p className="col-span-full text-center text-muted-foreground text-sm">
													Nenhum resultado.
												</p>
											)}
										</div>
									</div>
								)}

								{error && <div className="text-red-600">{error}</div>}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}

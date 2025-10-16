"use client";

import { Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BaseButton } from "../buttons/BaseButton";

type BackgroundMediaModalProps = {
	isOpen: boolean;
	type: "image" | "video";
	onClose: () => void;
	onUploaded: (url: string, type: "image" | "video") => void;
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

	const objectUrl = useMemo(
		() => (file ? URL.createObjectURL(file) : ""),
		[file]
	);

	const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
		setCroppedAreaPixels(areaPixels);
	}, []);

	const reset = () => {
		setFile(null);
		setError("");
		setZoom(1);
		setCrop({ x: 0, y: 0 });
		setCroppedAreaPixels(null);
	};

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) {
			return;
		}
		const err = validateFile(f);
		if (err) {
			setError(err);
			return;
		}
		setFile(f);
		setError("");
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
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			setError("Selecione um arquivo primeiro.");
			return;
		}
		setIsUploading(true);
		try {
			const fd = new FormData();
			fd.append("file", file);
			fd.append("type", type);
			if (type === "image" && croppedAreaPixels) {
				fd.append("crop", JSON.stringify(croppedAreaPixels));
			}

			const res = await fetch("/api/background/upload", {
				method: "POST",
				body: fd,
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || "Falha no upload");
			}
			onUploaded(data.url, type);
			reset();
			onClose();
		} catch (e: any) {
			setError(e?.message || "Erro ao enviar arquivo");
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
			<DialogContent className="w-full max-w-[90vw] rounded-2xl border bg-background p-6 shadow-xl sm:max-w-lg">
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
									image={objectUrl}
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
				</div>
			</DialogContent>
		</Dialog>
	);
}

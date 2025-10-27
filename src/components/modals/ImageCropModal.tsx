"use client";

import {
	Check,
	RotateCcw,
	Trash2,
	Upload,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import NextImage from "next/image";
import type { FC } from "react";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
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
import { Button } from "../ui/button";

// --- Interfaces e Constantes ---
interface ImageCropModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImageSave: (imageUrl: string) => void;
	linkId?: string;
	currentImageUrl?: string | null;
	onImageRemove?: () => void;
}

// Lista de formatos de imagem expandida conforme solicitado
const ACCEPTED_FORMATS = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/svg+xml",
	"image/bmp",
	"image/heic",
	"image/heif",
];

// Formatos que devem pular a etapa de recorte para preservar suas propriedades
const CROP_BYPASS_FORMATS = [
	"image/gif",
	"image/svg+xml",
	"image/heic",
	"image/heif",
];

// --- Função Utilitária para Recortar a Imagem ---
const createCroppedImage = (
	imageSrc: string,
	pixelCrop: Area
): Promise<Blob> => {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = imageSrc;
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				return reject(new Error("Erro ao criar o canvas para recorte."));
			}
			canvas.width = pixelCrop.width;
			canvas.height = pixelCrop.height;
			ctx.drawImage(
				image,
				pixelCrop.x,
				pixelCrop.y,
				pixelCrop.width,
				pixelCrop.height,
				0,
				0,
				pixelCrop.width,
				pixelCrop.height
			);
			canvas.toBlob((blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Erro ao converter o canvas para Blob."));
				}
			}, "image/png");
		};
		image.onerror = (error) => reject(error);
	});
};

// --- Componente Principal ---
const ImageCropModal: FC<ImageCropModalProps> = ({
	isOpen,
	onClose,
	onImageSave,
	linkId,
	currentImageUrl,
	onImageRemove,
}) => {
	const [selectedImage, setSelectedImage] = useState<{
		src: string;
		file: File;
	} | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [dragActive, setDragActive] = useState(false);

	const handleFileSelect = (file: File) => {
		if (!ACCEPTED_FORMATS.includes(file.type)) {
			alert(
				"Formato de arquivo não suportado. Use um dos seguintes: JPEG, PNG, GIF, WebP, AVIF, SVG, BMP, HEIC, HEIF."
			);
			return;
		}

		// Validar tamanho do arquivo (máximo 5MB)
		const maxFileSize = 5 * 1024 * 1024; // 5MB em bytes
		if (file.size > maxFileSize) {
			alert("Arquivo muito grande. O tamanho máximo permitido é 5MB.");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) =>
			setSelectedImage({ src: e.target?.result as string, file });
		reader.readAsDataURL(file);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <Não será necessário atualizar as dependências>
	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFileSelect(e.dataTransfer.files[0]);
		}
	}, []);

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const onCropComplete = useCallback(
		(_croppedArea: Area, croppedAreaPixelsValue: Area) => {
			setCroppedAreaPixels(croppedAreaPixelsValue);
		},
		[]
	);

	const processImage = async () => {
		if (!selectedImage) {
			return;
		}
		setIsProcessing(true);

		try {
			let imageBlob: Blob;

			// Se for um formato que não deve ser recortado (como GIF), usa o arquivo original
			if (CROP_BYPASS_FORMATS.includes(selectedImage.file.type)) {
				imageBlob = selectedImage.file;
			} else {
				if (!croppedAreaPixels) {
					throw new Error("Área de recorte não definida.");
				}
				imageBlob = await createCroppedImage(
					selectedImage.src,
					croppedAreaPixels
				);
			}

			if (linkId) {
				const formData = new FormData();
				formData.append("file", imageBlob, selectedImage.file.name);
				const response = await fetch(`/api/links/${linkId}/upload`, {
					method: "POST",
					body: formData,
				});
				const result = await response.json();
				if (!result.success) {
					throw new Error(result.error || "Erro no upload da imagem.");
				}
				onImageSave(result.url);
			} else {
				const reader = new FileReader();
				reader.readAsDataURL(imageBlob);
				reader.onloadend = () => onImageSave(reader.result as string);
			}

			handleClose();
		} catch (error) {
			console.error("Erro ao processar imagem:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleClose = () => {
		setSelectedImage(null);
		setZoom(1);
		setCrop({ x: 0, y: 0 });
		onClose();
	};

	// Determina se deve mostrar a UI de recorte
	const shouldShowCropper =
		selectedImage && !CROP_BYPASS_FORMATS.includes(selectedImage.file.type);

	// Se for um formato que pula o recorte, processa a imagem imediatamente
	if (selectedImage && !shouldShowCropper && !isProcessing) {
		processImage();
	}

	return (
		<Dialog onOpenChange={isProcessing ? undefined : handleClose} open={isOpen}>
			<DialogContent
				className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 shadow-xl sm:max-w-lg"
				preventCloseOnInteractOutside
				preventCloseOnEscape
			>
				<DialogHeader>
					<DialogTitle className="text-center font-bold text-gray-900 text-xl dark:text-white">
						Personalizar Ícone do Link
					</DialogTitle>
					<DialogDescription className="text-center text-gray-600 dark:text-white/80">
						Ajuste a imagem para criar o ícone perfeito.
					</DialogDescription>
				</DialogHeader>
				<div className="mt-4 space-y-4">
					{shouldShowCropper ? (
						<div className="space-y-4">
							<div className="relative h-80 w-full rounded-lg bg-gray-100">
								<Cropper
									aspect={1}
									crop={crop}
									cropShape="rect"
									image={selectedImage.src}
									onCropChange={setCrop}
									onCropComplete={onCropComplete}
									onZoomChange={setZoom}
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
									onClick={() => setSelectedImage(null)}
									variant="white"
								>
									<RotateCcw className="h-4 w-4" />
									Escolher Outra
								</BaseButton>
								<BaseButton
									className="flex w-full items-center justify-center gap-2"
									loading={isProcessing}
									onClick={processImage}
								>
									<Check className="h-4 w-4" />
									Salvar Ícone
								</BaseButton>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{currentImageUrl && (
								<div className="text-center">
									<p className="mb-3 font-medium text-gray-700 text-sm dark:text-white">
										Imagem atual:
									</p>
									<div className="mb-4 flex justify-center">
										<NextImage
											alt="Imagem atual"
											className="h-20 w-20 rounded-lg border object-cover"
											height={100}
											src={currentImageUrl}
											width={100}
										/>
									</div>
									{onImageRemove && (
										<Button
											className="mx-auto mb-4 flex w-min items-center justify-center gap-2 hover:text-red-500"
											onClick={() => {
												onImageRemove();
												onClose();
											}}
											variant="ghost"
										>
											<Trash2 className="h-4 w-4" />
											Remover Imagem
										</Button>
									)}
									<div className="relative">
										<div className="relative mb-2 text-center">
											<div className="absolute inset-0 flex items-center">
												<div className="w-full border-gray-300 border-t" />
											</div>
											<div className="relative flex justify-center text-sm">
												<span className="bg-white px-2 text-gray-500 dark:bg-zinc-950 dark:text-white/80">
													ou escolha uma nova
												</span>
											</div>
										</div>
									</div>
								</div>
							)}
							<div
								className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
									dragActive
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 hover:border-gray-400"
								}`}
								onClick={() =>
									document.getElementById("file-upload-input")?.click()
								}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
								role="none"
							>
								<Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
								<p className="mb-2 font-medium text-gray-700 dark:text-white">
									{currentImageUrl
										? "Escolher nova imagem"
										: "Arraste uma imagem ou clique para selecionar"}
								</p>
								<p className="text-gray-500 text-sm dark:text-white/80">
									Formatos: JPG, PNG, GIF, SVG, WebP, etc.
								</p>
								<input
									accept={ACCEPTED_FORMATS.join(",")}
									className="hidden"
									id="file-upload-input"
									onChange={(e) =>
										e.target.files?.[0] && handleFileSelect(e.target.files[0])
									}
									type="file"
								/>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ImageCropModal;

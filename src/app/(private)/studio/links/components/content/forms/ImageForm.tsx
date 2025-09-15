"use client";

import { Grid3X3, Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
	ContentFormData,
	ImageContentType,
} from "../../../types/content.types";

interface ImageFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const ImageForm = ({ formData, setFormData }: ImageFormProps) => {
	const [dragOver, setDragOver] = useState(false);

	const imageTypes: {
		type: ImageContentType;
		label: string;
		icon: any;
		description: string;
	}[] = [
		{
			type: "individual",
			label: "Individual",
			icon: ImageIcon,
			description: "Uma única imagem",
		},
		{
			type: "carousel",
			label: "Carrossel",
			icon: RotateCcw,
			description: "Múltiplas imagens deslizantes",
		},
		{
			type: "columns",
			label: "Colunas",
			icon: Grid3X3,
			description: "Grade de imagens",
		},
	];

	const handleFileUpload = (files: FileList | null) => {
		if (files) {
			const fileArray = Array.from(files);
			setFormData({
				...formData,
				images: [...(formData.images || []), ...fileArray],
			});
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		handleFileUpload(e.dataTransfer.files);
	};

	return (
		<div className="space-y-6">
			{/* Image Type Selection */}
			<div className="space-y-3">
				<Label>Tipo de Exibição</Label>
				<div className="grid grid-cols-3 gap-3">
					{imageTypes.map(({ type, label, icon: Icon, description }) => (
						<button
							className={cn(
								"rounded-lg border-2 p-4 text-center transition-all",
								formData.imageType === type
									? "border-green-500 bg-green-50 dark:bg-green-950/20"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							)}
							key={type}
							onClick={() => setFormData({ ...formData, imageType: type })}
							type="button"
						>
							<Icon className="mx-auto mb-2 h-6 w-6" />
							<div className="font-medium text-sm">{label}</div>
							<div className="mt-1 text-muted-foreground text-xs">
								{description}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* File Upload */}
			<div className="space-y-3">
				<Label>Imagens</Label>
				<div
					className={cn(
						"rounded-lg border-2 border-dashed p-8 text-center transition-colors",
						dragOver
							? "border-green-500 bg-green-50 dark:bg-green-950/20"
							: "border-gray-300 dark:border-gray-600"
					)}
					onDragLeave={() => setDragOver(false)}
					onDragOver={(e) => {
						e.preventDefault();
						setDragOver(true);
					}}
					onDrop={handleDrop}
					tabIndex={0}
				>
					<Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
					<p className="mb-2 font-medium text-lg">Arraste imagens aqui</p>
					<p className="mb-4 text-muted-foreground text-sm">
						ou clique para selecionar
					</p>
					<input
						accept="image/*"
						className="hidden"
						id="image-upload"
						multiple
						onChange={(e) => handleFileUpload(e.target.files)}
						type="file"
					/>
					<Button asChild variant="outline">
						<label className="cursor-pointer" htmlFor="image-upload">
							Selecionar Imagens
						</label>
					</Button>
				</div>
			</div>

			{/* URL Input */}
			<div className="space-y-3">
				<Label>Ou adicione URLs de imagens</Label>
				<Input
					onKeyPress={(e) => {
						if (e.key === "Enter" && e.currentTarget.value) {
							const url = e.currentTarget.value;
							setFormData({
								...formData,
								imageUrls: [...(formData.imageUrls || []), url],
							});
							e.currentTarget.value = "";
						}
					}}
					placeholder="https://exemplo.com/imagem.jpg"
				/>
			</div>

			{/* Preview */}
			{(formData.images?.length || formData.imageUrls?.length) && (
				<div className="space-y-3">
					<Label>Preview</Label>
					<div className="grid grid-cols-3 gap-3">
						{formData.imageUrls?.map((url, index) => (
							<div
								className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
								key={index}
							>
								<Image
									alt="Preview"
									className="h-full w-full object-cover"
									src={url}
								/>
							</div>
						))}
						{formData.images?.map((file, index) => (
							<div
								className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
								key={index}
							>
								<Image
									alt="Preview"
									className="h-full w-full object-cover"
									src={URL.createObjectURL(file)}
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ImageForm;

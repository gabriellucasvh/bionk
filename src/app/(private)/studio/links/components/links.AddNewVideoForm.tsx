"use client";

import { useState } from "react";
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
import type { SectionItem } from "../types/links.types";

type VideoFormData = {
	title: string;
	description: string;
	url: string;
	type: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch";
	sectionId?: number | null;
};

interface AddNewVideoFormProps {
	formData?: VideoFormData;
	setFormData?: (data: VideoFormData) => void;
	onSave?: () => void;
	onCancel?: () => void;
	isSaveDisabled?: boolean;
	existingSections?: SectionItem[];
	videoManager?: {
		isAddingVideo: boolean;
		videoFormData: VideoFormData;
		setIsAddingVideo: (isAdding: boolean) => void;
		setVideoFormData: (data: VideoFormData) => void;
		existingSections: SectionItem[];
		handleAddNewVideo: () => void;
	};
}

const AddNewVideoForm = (props: AddNewVideoFormProps) => {
	const {
		formData: propFormData,
		setFormData: propSetFormData,
		onSave: propOnSave,
		isSaveDisabled: propIsSaveDisabled,
		existingSections: propExistingSections,
		videoManager,
	} = props;

	const formData = propFormData ||
		videoManager?.videoFormData || {
			title: "",
			description: "",
			url: "",
			type: "direct" as const,
			sectionId: null,
		};

	const setFormData =
		propSetFormData || videoManager?.setVideoFormData || (() => {});
	const onSave = propOnSave || videoManager?.handleAddNewVideo || (() => {});
	const isSaveDisabled = propIsSaveDisabled || !formData.url.trim();
	const existingSections =
		propExistingSections || videoManager?.existingSections || [];

	const [activeSection, setActiveSection] = useState<string>("");

	const handleSectionChange = (value: string) => {
		setActiveSection(value);
		if (value === "none") {
			setFormData({
				...formData,
				sectionId: null,
				type: formData.type || "direct",
			});
		} else {
			const section = existingSections.find((s) => s.id === value);
			setFormData({
				...formData,
				sectionId: section ? section.dbId : null,
				type: formData.type || "direct",
			});
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="url">URL do Vídeo *</Label>
					<Input
						id="url"
						onChange={(e) =>
							setFormData({
								...formData,
								url: e.target.value,
								type: formData.type || "direct",
							})
						}
						placeholder="Cole a URL do vídeo (YouTube, Vimeo, TikTok, Twitch ou arquivo .mp4/.webm/.ogg)"
						type="url"
						value={formData.url}
					/>
					<p className="text-muted-foreground text-xs">
						Suportamos YouTube, Vimeo, TikTok, Twitch e arquivos de vídeo
						diretos
					</p>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="title">Título (opcional)</Label>
					<Input
						id="title"
						maxLength={100}
						onChange={(e) =>
							setFormData({
								...formData,
								title: e.target.value,
								type: formData.type || "direct",
							})
						}
						placeholder="Título do vídeo"
						value={formData.title}
					/>
					<p className="text-muted-foreground text-xs">Máximo 100 caracteres</p>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="description">Descrição (opcional)</Label>
					<Textarea
						className="min-h-[80px] resize-none"
						id="description"
						maxLength={200}
						onChange={(e) =>
							setFormData({
								...formData,
								description: e.target.value,
								type: formData.type || "direct",
							})
						}
						placeholder="Descrição do vídeo"
						value={formData.description}
					/>
					<p className="text-muted-foreground text-xs">Máximo 200 caracteres</p>
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
								{existingSections.map((section, index) => (
									<SelectItem key={index} value={section.id}>
										{section.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<div className="flex gap-3">
				<BaseButton
					className="flex-1"
					disabled={isSaveDisabled}
					onClick={onSave}
					type="button"
				>
					Salvar Vídeo
				</BaseButton>
			</div>
		</div>
	);
};

export default AddNewVideoForm;

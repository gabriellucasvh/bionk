"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TextFormData } from "../hooks/useLinksManager";
import type { SectionItem } from "../types/links.types";

interface AddNewTextFormProps {
	formData?: TextFormData;
	setFormData?: (data: TextFormData) => void;
	onSave?: () => void;
	onCancel?: () => void;
	isSaveDisabled?: boolean;
	existingSections?: SectionItem[];
	textManager?: {
		isAddingText: boolean;
		textFormData: TextFormData;
		setIsAddingText: (isAdding: boolean) => void;
		setTextFormData: (data: TextFormData) => void;
		existingSections: SectionItem[];
		handleAddNewText: () => void;
	};
}

const AddNewTextForm = (props: AddNewTextFormProps) => {
	const {
		formData: propFormData,
		setFormData: propSetFormData,
		onSave: propOnSave,
		isSaveDisabled: propIsSaveDisabled,
		existingSections: propExistingSections,
		textManager,
	} = props;

	const formData = propFormData ||
		textManager?.textFormData || {
			title: "",
			description: "",
			position: "left" as const,
			sectionId: null,
			hasBackground: true,
			isCompact: false,
		};

	const setFormData =
		propSetFormData || textManager?.setTextFormData || (() => {});
	const onSave = propOnSave || textManager?.handleAddNewText || (() => {});
	const isSaveDisabled =
		propIsSaveDisabled ||
		!formData.title.trim() ||
		!formData.description.trim();
	const existingSections =
		propExistingSections || textManager?.existingSections || [];

	const [isLoading, setIsLoading] = useState(false);
	const [activeSection, setActiveSection] = useState<string>("");

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
					<div className="grid gap-2">
						<Label htmlFor="title">Título *</Label>
						<Input
							id="title"
							maxLength={80}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							placeholder="Digite o título do texto"
							value={formData.title}
						/>
						<p className="text-muted-foreground text-xs">
							{formData.title.length}/80 caracteres
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description">Descrição *</Label>
						<Textarea
							className="h-21 resize-none overflow-y-auto"
							id="description"
							maxLength={1500}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Digite o conteúdo do texto"
							value={formData.description}
						/>
						<p className="text-muted-foreground text-xs">
							{formData.description.length}/1500 caracteres
						</p>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="position">Posição do Texto</Label>
						<div className="flex gap-2">
							<BaseButton
								className="rounded-lg"
								onClick={() => setFormData({ ...formData, position: "left" })}
								size="icon"
								type="button"
								variant={formData.position === "left" ? "default" : "white"}
							>
								<AlignLeft className="h-4 w-4" />
							</BaseButton>
							<BaseButton
								className="rounded-lg"
								onClick={() => setFormData({ ...formData, position: "center" })}
								size="icon"
								type="button"
								variant={formData.position === "center" ? "default" : "white"}
							>
								<AlignCenter className="h-4 w-4" />
							</BaseButton>
							<BaseButton
								className="rounded-lg"
								onClick={() => setFormData({ ...formData, position: "right" })}
								size="icon"
								type="button"
								variant={formData.position === "right" ? "default" : "white"}
							>
								<AlignRight className="h-4 w-4" />
							</BaseButton>
						</div>
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

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="hasBackground">Mostrar Background</Label>
								<p className="text-muted-foreground text-sm">
									Exibe o texto com fundo baseado no template escolhido
								</p>
							</div>
							<Switch
								checked={formData.hasBackground}
								id="hasBackground"
								onCheckedChange={(checked) =>
									setFormData({ ...formData, hasBackground: checked })
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="isCompact">Modo Compacto</Label>
								<p className="text-muted-foreground text-sm">
									Exibe apenas o título como link clicável
								</p>
							</div>
							<Switch
								checked={formData.isCompact}
								id="isCompact"
								onCheckedChange={(checked) =>
									setFormData({ ...formData, isCompact: checked })
								}
							/>
						</div>
					</div>
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
						Salvar 
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default AddNewTextForm;

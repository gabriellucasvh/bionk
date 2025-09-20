"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
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

type TextFormData = {
	title: string;
	description: string;
	position: "left" | "center" | "right";
	sectionId?: number | null;
	hasBackground: boolean;
};

interface AddNewTextFormProps {
	formData?: TextFormData;
	setFormData?: (data: TextFormData) => void;
	onSave?: () => void;
	onCancel?: () => void;
	isSaveDisabled?: boolean;
	existingSections?: string[];
	textManager?: {
		isAddingText: boolean;
		textFormData: TextFormData;
		setIsAddingText: (isAdding: boolean) => void;
		setTextFormData: (data: TextFormData) => void;
		existingSections: string[];
		handleAddNewText: () => void;
	};
}

const AddNewTextForm = (props: AddNewTextFormProps) => {
	const {
		formData: propFormData,
		setFormData: propSetFormData,
		onSave: propOnSave,
		onCancel: propOnCancel,
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
		};

	const setFormData =
		propSetFormData || textManager?.setTextFormData || (() => {});
	const onSave = propOnSave || textManager?.handleAddNewText || (() => {});
	const onCancel =
		propOnCancel || (() => textManager?.setIsAddingText(false)) || (() => {});
	const isSaveDisabled =
		propIsSaveDisabled ||
		!formData.title.trim() ||
		!formData.description.trim();
	const existingSections =
		propExistingSections || textManager?.existingSections || [];

	const [activeSection, setActiveSection] = useState<string>("");

	const handleSectionChange = (value: string) => {
		setActiveSection(value);
		if (value === "none") {
			setFormData({ ...formData, sectionId: null });
		} else {
			const sectionIndex = existingSections.indexOf(value);
			setFormData({
				...formData,
				sectionId: sectionIndex >= 0 ? sectionIndex + 1 : null,
			});
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="title">Título *</Label>
					<Input
						id="title"
						maxLength={100}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						placeholder="Digite o título do texto"
						value={formData.title}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="description">Descrição *</Label>
					<Textarea
						id="description"
						maxLength={2000}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
						placeholder="Digite o conteúdo do texto"
						rows={4}
						value={formData.description}
					/>
					<p className="text-muted-foreground text-xs">
						{formData.description.length}/2000 caracteres
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
									<SelectItem key={index} value={section}>
										{section}
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
				</div>
			</div>

			<div className="flex gap-3">
				<BaseButton
					className="flex-1"
					disabled={isSaveDisabled}
					onClick={onSave}
				>
					Salvar Texto
				</BaseButton>
				<BaseButton onClick={onCancel} variant="outline">
					Cancelar
				</BaseButton>
			</div>
		</div>
	);
};

export default AddNewTextForm;

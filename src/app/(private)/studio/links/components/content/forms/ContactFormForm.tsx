"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContentFormData, FormField } from "../../../types/content.types";

interface ContactFormFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const ContactFormForm = ({ formData, setFormData }: ContactFormFormProps) => {
	const fieldTypes = [
		{ value: "text", label: "Texto" },
		{ value: "email", label: "Email" },
		{ value: "phone", label: "Telefone" },
		{ value: "textarea", label: "Texto Longo" },
		{ value: "select", label: "Seleção" },
		{ value: "checkbox", label: "Checkbox" },
	] as const;

	const addField = () => {
		const newField: FormField = {
			id: `field-${Date.now()}`,
			type: "text",
			label: "",
			required: false,
		};

		setFormData({
			...formData,
			formFields: [...(formData.formFields || []), newField],
		});
	};

	const updateField = (index: number, updates: Partial<FormField>) => {
		const fields = [...(formData.formFields || [])];
		fields[index] = { ...fields[index], ...updates };
		setFormData({ ...formData, formFields: fields });
	};

	const removeField = (index: number) => {
		const fields = formData.formFields?.filter((_, i) => i !== index) || [];
		setFormData({ ...formData, formFields: fields });
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="formTitle">Título do Formulário</Label>
					<Input
						autoFocus
						id="formTitle"
						onChange={(e) =>
							setFormData({ ...formData, formTitle: e.target.value })
						}
						placeholder="Ex: Entre em Contato"
						value={formData.formTitle || ""}
					/>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<Label>Campos do Formulário</Label>
					<Button onClick={addField} size="sm" variant="outline">
						<Plus className="mr-2 h-4 w-4" />
						Adicionar Campo
					</Button>
				</div>

				{formData.formFields?.map((field, index) => (
					<div className="space-y-3 rounded-lg border p-4" key={field.id}>
						<div className="flex items-center gap-2">
							<GripVertical className="h-4 w-4 text-gray-400" />
							<Input
								className="flex-1"
								onChange={(e) => updateField(index, { label: e.target.value })}
								placeholder="Nome do campo"
								value={field.label}
							/>
							<select
								className="rounded-md border px-3 py-2"
								onChange={(e) =>
									updateField(index, { type: e.target.value as any })
								}
								value={field.type}
							>
								{fieldTypes.map(({ value, label }) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
							<Button
								className="text-red-500 hover:text-red-700"
								onClick={() => removeField(index)}
								size="sm"
								variant="ghost"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								checked={field.required}
								id={`required-${field.id}`}
								onCheckedChange={(checked) =>
									updateField(index, { required: !!checked })
								}
							/>
							<Label className="text-sm" htmlFor={`required-${field.id}`}>
								Campo obrigatório
							</Label>
						</div>

						{field.type === "select" && (
							<Input
								onChange={(e) =>
									updateField(index, {
										options: e.target.value
											.split(",")
											.map((s) => s.trim())
											.filter(Boolean),
									})
								}
								placeholder="Opções separadas por vírgula"
								value={field.options?.join(", ") || ""}
							/>
						)}
					</div>
				))}

				{(!formData.formFields || formData.formFields.length === 0) && (
					<div className="py-8 text-center text-muted-foreground">
						<p>Nenhum campo adicionado ainda.</p>
						<p className="text-sm">Clique em "Adicionar Campo" para começar.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ContactFormForm;

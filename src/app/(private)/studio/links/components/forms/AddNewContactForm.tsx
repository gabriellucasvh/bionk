"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface AddNewContactFormProps {
	onClose: () => void;
	onCreated: () => void;
	sectionId?: number | null;
	initialData?: any;
}

export default function AddNewContactForm({
	onClose,
	onCreated,
	sectionId,
	initialData,
}: AddNewContactFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		title: initialData?.title || "",
		description: initialData?.description || "",
		imageUrl: initialData?.imageUrl || "",
		successMessage: initialData?.successMessage || "Enviado",
		buttonText: initialData?.buttonText || "Enviar",
		collectName: initialData?.collectName ?? true,
		collectEmail: initialData?.collectEmail ?? true,
		collectPhone: initialData?.collectPhone ?? true,
		isCompact: initialData?.isCompact ?? false,
	});

	useEffect(() => {
		// Pelo menos 1 campo deve ser coletado. Se todos forem false, forçamos collectEmail.
		if (
			!(formData.collectName || formData.collectEmail || formData.collectPhone)
		) {
			setFormData((prev) => ({ ...prev, collectEmail: true }));
		}
	}, [formData.collectName, formData.collectEmail, formData.collectPhone]);

	const handleSave = async () => {
		if (!formData.title.trim()) {
			toast.error("O título é obrigatório");
			return;
		}

		if (
			!(formData.collectName || formData.collectEmail || formData.collectPhone)
		) {
			toast.error("Selecione pelo menos um campo para coletar");
			return;
		}

		setIsLoading(true);

		try {
			const res = await fetch(
				initialData
					? `/api/contact-forms/${initialData.id}`
					: "/api/contact-forms",
				{
					method: initialData ? "PUT" : "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						...formData,
						sectionId: sectionId || null,
					}),
				}
			);

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(
					errorData.error || "Ocorreu um erro ao salvar o formulário."
				);
			}

			toast.success(
				initialData ? "Formulário atualizado!" : "Formulário criado!"
			);
			onCreated();
		} catch (error: any) {
			console.error("Save Contact Form error:", error);
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mb-4 rounded-xl border bg-white p-4 shadow-xs dark:bg-zinc-900">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold">
					{initialData ? "Editar" : "Novo"} Formulário de Contato
				</h3>
			</div>

			<div className="space-y-4">
				<div>
					<label className="mb-1 block font-medium text-sm" htmlFor="title">
						Título
					</label>
					<Input
						id="title"
						maxLength={80}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						placeholder="Ex: Entre em contato"
						value={formData.title}
					/>
				</div>

				<div>
					<label
						className="mb-1 block font-medium text-sm"
						htmlFor="description"
					>
						Descrição (opcional)
					</label>
					<Input
						id="description"
						maxLength={200}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
						placeholder="Ex: Preencha os dados abaixo"
						value={formData.description}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							className="mb-1 block font-medium text-sm"
							htmlFor="buttonText"
						>
							Texto do Botão
						</label>
						<Input
							id="buttonText"
							maxLength={20}
							onChange={(e) =>
								setFormData({ ...formData, buttonText: e.target.value })
							}
							placeholder="Enviar"
							value={formData.buttonText}
						/>
					</div>
					<div>
						<label
							className="mb-1 block font-medium text-sm"
							htmlFor="successMessage"
						>
							Mensagem de Sucesso
						</label>
						<Input
							id="successMessage"
							maxLength={20}
							onChange={(e) =>
								setFormData({ ...formData, successMessage: e.target.value })
							}
							placeholder="Enviado com sucesso!"
							value={formData.successMessage}
						/>
					</div>
				</div>

				<div>
					<label className="mb-1 block font-medium text-sm" htmlFor="imageUrl">
						URL da Imagem (opcional)
					</label>
					<Input
						id="imageUrl"
						onChange={(e) =>
							setFormData({ ...formData, imageUrl: e.target.value })
						}
						placeholder="Ex: https://.../imagem.png"
						value={formData.imageUrl}
					/>
				</div>

				<div className="space-y-3 pt-2">
					<p className="font-medium text-muted-foreground text-sm">
						Campos a coletar:
					</p>

					<div className="flex items-center space-x-2">
						<Checkbox
							checked={formData.collectName}
							id="collectName"
							onCheckedChange={(checked) =>
								setFormData({ ...formData, collectName: checked as boolean })
							}
						/>
						<label
							className="font-medium text-sm leading-none"
							htmlFor="collectName"
						>
							Nome
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							checked={formData.collectEmail}
							id="collectEmail"
							onCheckedChange={(checked) =>
								setFormData({ ...formData, collectEmail: checked as boolean })
							}
						/>
						<label
							className="font-medium text-sm leading-none"
							htmlFor="collectEmail"
						>
							E-mail
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							checked={formData.collectPhone}
							id="collectPhone"
							onCheckedChange={(checked) =>
								setFormData({ ...formData, collectPhone: checked as boolean })
							}
						/>
						<label
							className="font-medium text-sm leading-none"
							htmlFor="collectPhone"
						>
							Telefone / WhatsApp
						</label>
					</div>
				</div>

				<div className="flex items-center space-x-2 pt-2">
					<Checkbox
						checked={formData.isCompact}
						id="isCompact"
						onCheckedChange={(checked) =>
							setFormData({ ...formData, isCompact: checked as boolean })
						}
					/>
					<label
						className="font-medium text-sm leading-none"
						htmlFor="isCompact"
					>
						Formato Compacto
					</label>
				</div>
			</div>

			<div className="flex-shrink-0 pt-6">
				<div className="flex items-center justify-end gap-3">
					<BaseButton
						className="px-4"
						onClick={onClose}
						type="button"
						variant="outline"
					>
						Cancelar
					</BaseButton>
					<BaseButton
						className="px-4"
						disabled={isLoading}
						onClick={handleSave}
						type="button"
					>
						{isLoading ? "Salvando..." : "Salvar"}
					</BaseButton>
				</div>
			</div>
		</div>
	);
}

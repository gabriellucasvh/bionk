"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Archive as ArchiveBox,
	DotsSix,
	DotsThreeVertical,
	EnvelopeSimple,
	PencilSimple,
	Trash,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { toast } from "sonner";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import AddNewContactForm from "../forms/AddNewContactForm";

interface ContactFormCardProps {
	contactForm: any;
	isDragging: boolean;
	listeners: any;
	setActivatorNodeRef: any;
	onToggleActive: (id: number, type: string, currentStatus: boolean) => void;
	onDeleteContactForm?: (id: number) => void;
}

import { useSWRConfig } from "swr";

const ContactFormCard = ({
	contactForm,
	isDragging,
	listeners,
	setActivatorNodeRef,
	onToggleActive,
	onDeleteContactForm,
}: ContactFormCardProps) => {
	const {
		transform,
		transition,
		isDragging: sortableIsDragging,
	} = useSortable({
		id: `contactForm-${contactForm.id}`,
	});
	const { mutate } = useSWRConfig();

	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging || sortableIsDragging ? 50 : 1,
		opacity: isDragging || sortableIsDragging ? 0.5 : 1,
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(`/api/contact-forms/${contactForm.id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Erro ao excluir");
			toast.success("Formulário de contato excluído");
			if (onDeleteContactForm) onDeleteContactForm(contactForm.id);
			mutate("/api/contact-forms");
			window.dispatchEvent(new CustomEvent("reloadIframePreview"));
		} catch (error) {
			toast.error("Erro ao excluir formulário");
			setIsDeleting(false);
		}
	};

	const handleToggleActive = async (checked: boolean) => {
		onToggleActive(contactForm.id, "contactForm", !checked);
		try {
			await fetch(`/api/contact-forms/${contactForm.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: checked }),
			});
			window.dispatchEvent(new CustomEvent("reloadIframePreview"));
		} catch (error) {
			toast.error("Erro ao alterar status do formulário");
			// revert UI state automatically if we relied on state, but onToggleActive usually handles optimistic update
		}
	};

	if (isEditing) {
		return (
			<div style={style}>
				<AddNewContactForm
					initialData={contactForm}
					onClose={() => setIsEditing(false)}
					onCreated={() => {
						setIsEditing(false);
						mutate("/api/contact-forms");
						window.dispatchEvent(new CustomEvent("reloadIframePreview"));
					}}
				/>
			</div>
		);
	}

	return (
		<article
			className={cn(
				"relative flex flex-col gap-3 rounded-3xl border bg-white p-3 transition-all sm:p-4 dark:bg-zinc-900",
				(isDeleting || contactForm.archived) && "pointer-events-none opacity-50"
			)}
			style={style}
		>
			<div className="flex items-start gap-2 sm:gap-4">
				<div
					ref={setActivatorNodeRef}
					{...listeners}
					className="cursor-grab touch-none pt-1"
				>
					<DotsSix className="h-5 w-5 text-muted-foreground" weight="regular" />
				</div>
				<div className="flex-1 space-y-2">
					<header className="flex items-center gap-3">
						<div className="flex items-center justify-center rounded-md bg-purple-600 p-1.5">
							<EnvelopeSimple className="h-4 w-4 text-white" weight="regular" />
						</div>
						<span className="font-medium text-purple-600 text-sm uppercase tracking-wider">
							Formulário de Contato
						</span>
					</header>

					<div className="flex flex-wrap items-center gap-2">
						<h3 className="truncate font-medium text-sm sm:text-base">
							{contactForm.title || "Entre em contato"}
						</h3>
					</div>

					<p className="mt-1 truncate text-sm text-zinc-500">
						{contactForm.description || "Descrição padrão"}
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4 text-muted-foreground text-sm">
					<div
						className="flex items-center gap-1.5"
						title="Respostas do formulário"
					>
						<EnvelopeSimple className="h-4 w-4" weight="regular" />
						<span>{contactForm._count?.submissions || 0}</span>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 sm:gap-4">
					<div className="flex items-center space-x-2">
						<Switch
							checked={contactForm.active ?? true}
							id={`switch-${contactForm.id}`}
							onCheckedChange={handleToggleActive}
						/>
						<Label
							className="cursor-pointer text-sm"
							htmlFor={`switch-${contactForm.id}`}
						>
							{contactForm.active ? "Ativo" : "Inativo"}
						</Label>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 w-8 flex-shrink-0"
								size="icon"
								variant="ghost"
							>
								<DotsThreeVertical className="h-4 w-4" weight="regular" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsEditing(true)}>
								<PencilSimple className="mr-2 h-4 w-4" weight="regular" />{" "}
								Editar
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={async () => {
									try {
										await fetch(`/api/contact-forms/${contactForm.id}`, {
											method: "PUT",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ archived: true }),
										});
										mutate("/api/contact-forms");
										window.dispatchEvent(
											new CustomEvent("reloadIframePreview")
										);
										toast.success("Formulário arquivado com sucesso!");
									} catch (e) {
										toast.error("Erro ao arquivar formulário");
									}
								}}
							>
								<ArchiveBox className="mr-2 h-4 w-4" weight="regular" />{" "}
								Arquivar
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								disabled={isDeleting}
								onClick={handleDelete}
							>
								<Trash className="mr-2 h-4 w-4" weight="regular" /> Deletar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</article>
	);
};

export default ContactFormCard;

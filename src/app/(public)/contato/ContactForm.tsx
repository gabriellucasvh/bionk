"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";

// Componente Alert simples inline
const Alert = ({
	variant,
	children,
	className,
}: {
	variant?: "destructive";
	children: React.ReactNode;
	className?: string;
}) => (
	<div
		className={`rounded-lg border p-4 ${variant === "destructive" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800"} ${className || ""}`}
	>
		{children}
	</div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
	<div className="text-sm">{children}</div>
);

import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

// Schema de validação (mesmo da API)
const contactSchema = z.object({
	fullName: z
		.string()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100, "Nome muito longo"),
	email: z.string().email("Email inválido").max(255, "Email muito longo"),
	subject: z.enum(
		[
			"suporte-tecnico",
			"planos-assinaturas",
			"parcerias-colaboracoes",
			"feedback-sugestoes",
			"reportar-problema",
			"outros",
		],
		{
			errorMap: () => ({ message: "Selecione um assunto válido" }),
		}
	),
	message: z
		.string()
		.min(10, "Mensagem deve ter pelo menos 10 caracteres")
		.max(2000, "Mensagem muito longa"),
	// Honeypot field
	website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Componente de estado de sucesso
interface SuccessStateProps {
	fullName: string;
	dict: ContatoDict;
}

function SuccessState({ fullName, dict }: SuccessStateProps) {
	return (
		<div className="py-8 text-center">
			<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
				<CheckCircle className="h-8 w-8 text-green-600" />
			</div>
			<h3 className="mb-4 font-semibold text-2xl text-gray-900">
				{dict.successTitle}
			</h3>
			<p className="mb-6 text-gray-600">
				{dict.successThanks.replace("{name}", fullName)}
			</p>
			<div>
				<p className="text-green-800 text-sm">
					<strong>{dict.tip}</strong> {dict.tipText}
				</p>
			</div>
		</div>
	);
}

type ContatoDict = {
	fullName: string;
	fullNamePlaceholder: string;
	email: string;
	emailPlaceholder: string;
	subject: string;
	subjectPlaceholder: string;
	subjectOptions: {
		suporte: string;
		planos: string;
		parcerias: string;
		feedback: string;
		reportar: string;
		outros: string;
	};
	message: string;
	messagePlaceholder: string;
	detailsHint: string;
	disclaimerPrefix: string;
	terms: string;
	privacy: string;
	send: string;
	sending: string;
	successTitle: string;
	successThanks: string;
	tip: string;
	tipText: string;
};

export default function ContactForm({
	dict,
}: {
	dict: ContatoDict;
	locale: "pt-br" | "en" | "es";
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [submittedName, setSubmittedName] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<ContactFormData>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			website: "", // Honeypot field
		},
	});

	const onSubmit = async (data: ContactFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Erro ao enviar mensagem");
			}

			setSubmittedName(data.fullName);
			setIsSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro inesperado");
		} finally {
			setIsLoading(false);
		}
	};

	// Opções de assunto
	const subjectOptions = [
		{
			value: "suporte-tecnico",
			label: dict.subjectOptions.suporte,
		},
		{
			value: "planos-assinaturas",
			label: dict.subjectOptions.planos,
		},
		{ value: "parcerias-colaboracoes", label: dict.subjectOptions.parcerias },
		{ value: "feedback-sugestoes", label: dict.subjectOptions.feedback },
		{
			value: "reportar-problema",
			label: dict.subjectOptions.reportar,
		},
		{ value: "outros", label: dict.subjectOptions.outros },
	];

	if (isSuccess) {
		return <SuccessState dict={dict} fullName={submittedName} />;
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Honeypot field - campo oculto para detectar bots */}
			<input
				{...register("website")}
				autoComplete="off"
				style={{ display: "none" }}
				tabIndex={-1}
			/>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Nome Completo */}
				<div className="space-y-2">
					<Label className="text-green-800" htmlFor="fullName">
						{dict.fullName}
					</Label>
					<Input
						id="fullName"
						{...register("fullName")}
						className={errors.fullName ? "border-red-500" : ""}
						placeholder={dict.fullNamePlaceholder}
					/>
					{errors.fullName && (
						<p className="text-red-600 text-sm">{errors.fullName.message}</p>
					)}
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label className="text-green-800" htmlFor="email">
						{dict.email}
					</Label>
					<Input
						id="email"
						type="email"
						{...register("email")}
						className={errors.email ? "border-red-500" : ""}
						placeholder={dict.emailPlaceholder}
					/>
					{errors.email && (
						<p className="text-red-600 text-sm">{errors.email.message}</p>
					)}
				</div>
			</div>

			{/* Assunto */}
			<div className="space-y-2">
				<Label className="text-green-800" htmlFor="subject">
					{dict.subject}
				</Label>
				<Select onValueChange={(value) => setValue("subject", value as any)}>
					<SelectTrigger className={errors.subject ? "border-red-500" : ""}>
						<SelectValue placeholder={dict.subjectPlaceholder} />
					</SelectTrigger>
					<SelectContent>
						{subjectOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors.subject && (
					<p className="text-red-600 text-sm">{errors.subject.message}</p>
				)}
			</div>

			{/* Mensagem */}
			<div className="space-y-2">
				<Label className="text-green-800" htmlFor="message">
					{dict.message}
				</Label>
				<Textarea
					id="message"
					{...register("message")}
					className={errors.message ? "border-red-500" : ""}
					placeholder={dict.messagePlaceholder}
					rows={6}
				/>
				{errors.message && (
					<p className="text-red-600 text-sm">{errors.message.message}</p>
				)}
				<p className="text-gray-500 text-sm">{dict.detailsHint}</p>
			</div>

			{/* Disclaimer */}
			<p className="text-start text-gray-500 text-sm">
				{dict.disclaimerPrefix}
				<Link
					className="text-blue-600 hover:underline"
					href={"/termos"}
					rel="noopener noreferrer"
					target="_blank"
				>
					{dict.terms}
				</Link>{" "}
				e{" "}
				<Link
					className="text-blue-600 hover:underline"
					href={"/privacidade"}
					rel="noopener noreferrer"
					target="_blank"
				>
					{dict.privacy}
				</Link>
				.
			</p>
			{/* Botão de envio */}
			<Button
				className="w-min bg-green-600 py-3 font-medium text-lg text-white hover:bg-green-700"
				disabled={isLoading}
				type="submit"
			>
				{isLoading ? <span>{dict.sending}</span> : <span>{dict.send}</span>}
			</Button>
		</form>
	);
}

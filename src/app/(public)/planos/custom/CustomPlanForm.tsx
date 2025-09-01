"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

// Regex patterns defined at top level for performance
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

// Schema de validação
const customPlanSchema = z.object({
	fullName: z
		.string()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100, "Nome muito longo"),
	email: z.string().email("Email inválido").max(255, "Email muito longo"),
	bionkUsername: z
		.string()
		.optional()
		.refine((val) => {
			if (!val) {
				return true;
			}
			return USERNAME_REGEX.test(val);
		}, "Username deve conter apenas letras, números, _ ou - e ter entre 3-30 caracteres"),
	companyName: z
		.string()
		.min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
		.max(100, "Nome da empresa muito longo"),
	companySize: z.enum(["1", "2-10", "11-50", "51-100", "101+"], {
		errorMap: () => ({ message: "Selecione o tamanho da empresa" }),
	}),
	helpDescription: z
		.string()
		.min(10, "Descrição deve ter pelo menos 10 caracteres")
		.max(1000, "Descrição muito longa"),
	// Honeypot field (campo oculto para detectar bots)
	website: z.string().optional(),
});

type FormData = z.infer<typeof customPlanSchema>;

function SuccessState() {
	return (
		<Card className="border-none shadow-none">
			<CardContent className="pt-8">
				<div className="space-y-6 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-8 w-8 text-green-600" />
					</div>

					<div className="space-y-4">
						<h3 className="font-bold text-2xl text-green-800">
							Solicitação Enviada com Sucesso!
						</h3>
						<p className="text-gray-600 text-lg">
							Recebemos sua solicitação para o Plano Customizado e nossa equipe
							entrará em contato em breve para entender melhor suas necessidades
							e apresentar a melhor solução para sua marca.
						</p>

						<div className="space-y-3 text-black">
							<div className=" bg-white p-4">
								<ul className="space-y-1 text-left text-normal">
									<li>• Nossa equipe analisará sua solicitação</li>
									<li>• Entraremos em contato em até 2 dias úteis</li>
									<li>• Criaremos uma proposta personalizada para você</li>
									<li>
										• Agendaremos uma demonstração{" "}
										<span className="font-black">se necessário</span>
									</li>
								</ul>
							</div>

							<p className="text-gray-600 text-sm">
								Você receberá um email de confirmação em breve.
							</p>
						</div>
						<Link
							className="text-black underline decoration-lime-500"
							href="/planos"
						>
							Voltar para Planos
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function CustomPlanForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormData>({
		resolver: zodResolver(customPlanSchema),
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/custom-plan", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Erro ao enviar formulário");
			}

			setIsSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro inesperado");
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return <SuccessState />;
	}

	return (
		<Card className="mx-auto max-w-2xl border-none shadow-none">
			<CardContent className="px-0 pt-6">
				{error && (
					<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				)}

				<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
					{/* Honeypot field - hidden from users */}
					<input
						type="text"
						{...register("website")}
						autoComplete="off"
						style={{ display: "none" }}
						tabIndex={-1}
					/>

					{/* Nome Completo */}
					<div className="space-y-2">
						<Label className="font-medium text-green-800" htmlFor="fullName">
							Nome Completo *
						</Label>
						<Input
							id="fullName"
							{...register("fullName")}
							placeholder="Digite seu nome completo"
						/>
						{errors.fullName && (
							<p className="text-red-500 text-sm">{errors.fullName.message}</p>
						)}
					</div>

					{/* Email */}
					<div className="space-y-2">
						<Label className="font-medium text-green-800" htmlFor="email">
							Email *
						</Label>
						<Input
							id="email"
							type="email"
							{...register("email")}
							placeholder="seu@email.com"
						/>
						{errors.email && (
							<p className="text-red-500 text-sm">{errors.email.message}</p>
						)}
					</div>

					{/* Nome de usuário Bionk */}
					<div className="space-y-2">
						<Label
							className="font-medium text-green-800"
							htmlFor="bionkUsername"
						>
							Nome de usuário Bionk
						</Label>
						<Input
							id="bionkUsername"
							{...register("bionkUsername")}
							placeholder="seu_usuario"
						/>
						{errors.bionkUsername && (
							<p className="text-red-500 text-sm">
								{errors.bionkUsername.message}
							</p>
						)}
						<p className="text-gray-500 text-xs">
							Se você já possui uma conta Bionk, informe seu nome de usuário
						</p>
					</div>

					{/* Nome da empresa */}
					<div className="space-y-2">
						<Label className="font-medium text-green-800" htmlFor="companyName">
							Nome da sua empresa *
						</Label>
						<Input
							id="companyName"
							{...register("companyName")}
							placeholder="Nome da sua empresa"
						/>
						{errors.companyName && (
							<p className="text-red-500 text-sm">
								{errors.companyName.message}
							</p>
						)}
					</div>

					{/* Tamanho da empresa */}
					<div className="space-y-2">
						<Label className="font-medium text-green-800" htmlFor="companySize">
							Quantas pessoas fazem parte da sua empresa atualmente? *
						</Label>
						<Select
							onValueChange={(value) => setValue("companySize", value as any)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecione o tamanho da empresa" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">
									1 (Sou individual/empreendedor)
								</SelectItem>
								<SelectItem value="2-10">2-10 pessoas</SelectItem>
								<SelectItem value="11-50">11-50 pessoas</SelectItem>
								<SelectItem value="51-100">51-100 pessoas</SelectItem>
								<SelectItem value="101+">101+ pessoas</SelectItem>
							</SelectContent>
						</Select>
						{errors.companySize && (
							<p className="text-red-500 text-sm">
								{errors.companySize.message}
							</p>
						)}
					</div>

					{/* Como podemos ajudar */}
					<div className="space-y-2">
						<Label
							className="font-medium text-green-800"
							htmlFor="helpDescription"
						>
							Como podemos ajudar você? *
						</Label>
						<Textarea
							id="helpDescription"
							{...register("helpDescription")}
							className="min-h-[120px] "
							placeholder="Descreva suas necessidades, objetivos e como podemos criar um plano personalizado para você..."
						/>
						{errors.helpDescription && (
							<p className="text-red-500 text-sm">
								{errors.helpDescription.message}
							</p>
						)}
					</div>

					<p className="text-start text-gray-500 text-sm">
						Ao enviar este formulário, você concorda que nossa equipe entre em
						contato para discutir sua solicitação e aceita nossos{" "}
						<Link
							className="text-blue-600 underline"
							href={"/termos"}
							rel="noopener noreferrer"
							target="_blank"
						>
							Termos de Uso
						</Link>{" "}
						e{" "}
						<Link
							className="text-blue-600 underline"
							href={"/privacidade"}
							rel="noopener noreferrer"
							target="_blank"
						>
							Política de Privacidade
						</Link>
					</p>
					<Button
						className="w-min bg-green-600 py-3 font-medium text-lg text-white hover:bg-green-700"
						disabled={isLoading}
						type="submit"
					>
						{isLoading ? <span>Enviando...</span> : <span>Enviar</span>}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

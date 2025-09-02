"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFormData {
	email: string;
	username: string;
}

interface EmailFormProps {
	form: UseFormReturn<EmailFormData>;
	onSubmit: (data: EmailFormData) => void;
	loading: boolean;
}

export function EmailForm({ form, onSubmit, loading }: EmailFormProps) {
	const [usernameStatus, setUsernameStatus] = useState<{
		type: "idle" | "checking" | "available" | "taken" | "error";
		message?: string;
	}>({ type: "idle" });

	const [usernameCheckTimeout, setUsernameCheckTimeout] =
		useState<NodeJS.Timeout | null>(null);

	const [isTyping, setIsTyping] = useState(false);

	// Função para verificar se o formulário pode ser submetido
	const canSubmit = () => {
		const { username, email } = form.getValues();
		const hasErrors = Object.keys(form.formState.errors).length > 0;

		return (
			!hasErrors &&
			username &&
			email &&
			usernameStatus.type === "available" &&
			!loading &&
			!isTyping
		);
	};

	const checkUsernameAvailability = async (username: string) => {
		if (!username || username.length < 3) {
			setUsernameStatus({ type: "idle" });
			return;
		}

		setUsernameStatus({ type: "checking" });

		try {
			const response = await axios.get(
				`/api/auth/check-username?username=${encodeURIComponent(username)}`
			);
			if (response.data.available) {
				setUsernameStatus({
					type: "available",
					message: "Username disponível!",
				});
			} else {
				setUsernameStatus({
					type: "taken",
					message: "Username indisponível",
				});
			}
		} catch {
			setUsernameStatus({
				type: "error",
				message: "Erro ao verificar username",
			});
		}
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
		form.setValue("username", value, { shouldValidate: true });

		// Marcar como digitando e limpar mensagens
		setIsTyping(true);
		setUsernameStatus({ type: "idle" });

		if (usernameCheckTimeout) {
			clearTimeout(usernameCheckTimeout);
		}

		const timeout = setTimeout(() => {
			setIsTyping(false);
			checkUsernameAvailability(value);
		}, 1500);

		setUsernameCheckTimeout(timeout);
	};

	useEffect(() => {
		return () => {
			if (usernameCheckTimeout) {
				clearTimeout(usernameCheckTimeout);
			}
		};
	}, [usernameCheckTimeout]);
	let statusMessage = "";
	let statusClass = "";

	if (usernameStatus.type === "checking") {
		statusMessage = "Verificando...";
		statusClass = "text-gray-600";
	} else if (usernameStatus.message) {
		statusMessage = usernameStatus.message;
		statusClass =
			usernameStatus.type === "available" ? "text-green-600" : "text-red-600";
	}
	return (
		<form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
			<div>
				<Label className="mb-2 block font-semibold text-base text-black">
					Escolha seu username
				</Label>
				<div className="relative w-full">
					<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 text-gray-500">
						bionk.me/
					</span>
					<Input
						className={`w-full border px-4 py-4 pl-[100px] text-base transition-colors duration-400 focus-visible:border-lime-500 ${(() => {
							if (usernameStatus.type === "available") {
								return "border-green-500";
							}
							if (
								usernameStatus.type === "taken" ||
								usernameStatus.type === "error"
							) {
								return "border-red-500";
							}
							return "";
						})()} `}
						disabled={loading}
						maxLength={30}
						onChange={handleUsernameChange}
						placeholder="seuUsername"
						type="text"
						value={form.watch("username") || ""}
					/>
				</div>

				{/* Espaço reservado para mensagem de status do username */}
				<div className="mt-1 flex h-5 items-center">
					{!isTyping && form.formState.errors.username && (
						<p className="text-red-600 text-sm transition-opacity duration-200">
							{form.formState.errors.username.message}
						</p>
					)}

					{!(isTyping || form.formState.errors.username) && statusMessage && (
						<p
							className={`text-sm transition-opacity duration-200 ${statusClass}`}
						>
							{statusMessage}
						</p>
					)}
				</div>
			</div>
			<div>
				<Label className="mb-2 block font-semibold text-base text-black">
					Seu email
				</Label>
				<Input
					className="w-full rounded-md border px-4 py-4 text-base transition-colors duration-400 focus-visible:border-lime-500"
					placeholder="Digite seu e-mail"
					type="email"
					{...form.register("email")}
					disabled={loading}
				/>
				{/* Espaço reservado para mensagem de erro do email */}
				<div className="mt-2 flex h-2 items-center">
					{form.formState.errors.email && (
						<p className="text-red-600 text-sm transition-opacity duration-200">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>
			</div>

			<div>
				<p className="text-center text-gray-500 text-sm">
					Ao continuar, você aceita os nossos{" "}
					<Link className="underline hover:text-gray-700" href="/termos">
						Termos e Condições
					</Link>{" "}
					e a nossa{" "}
					<Link className="underline hover:text-gray-700" href="/privacidade">
						Política de Privacidade
					</Link>
					.
				</p>
			</div>
			<BaseButton
				className="mt-2 w-full py-4 text-base"
				disabled={!canSubmit()}
				loading={loading}
				type="submit"
			>
				Continuar
			</BaseButton>
		</form>
	);
}

"use client";

import { type FormEvent, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UserLink } from "@/types/user-profile";
import { detectTrafficSource } from "@/utils/traffic-source";

export default function PasswordProtectedLink({
	link,
	children,
}: {
	link: UserLink;
	children: React.ReactNode;
}) {
	const [passwordInput, setPasswordInput] = useState("");
	const [error, setError] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);

	const sendClickData = () => {
		const url = "/api/link-click";
		const trafficSource = detectTrafficSource();
		const data = JSON.stringify({ linkId: link.id, trafficSource });

		if (navigator.sendBeacon) {
			navigator.sendBeacon(url, data);
		} else {
			fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: data,
				keepalive: true,
			});
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		// Evitar submit se input estiver vazio ou bloqueado
		if (!passwordInput.trim() || isBlocked) {
			return;
		}

		try {
			const response = await fetch("/api/link-password-check", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ linkId: link.id, password: passwordInput }),
			});
			const data = await response.json();

			if (response.ok && data?.success) {
				// Registrar clique somente após senha correta
				sendClickData();
				if (link.url) {
					window.open(link.url, "_blank", "noopener,noreferrer");
				}
				setIsOpen(false);
				setPasswordInput("");
				setError("");
				setIsBlocked(false);
				return;
			}

			if (response.status === 401) {
				const remaining =
					typeof data?.remainingAttempts === "number"
						? data.remainingAttempts
						: null;
				setError(
					remaining !== null
						? `Senha incorreta. Tentativas restantes: ${remaining}`
						: "Senha incorreta"
				);
				return;
			}

			if (response.status === 429) {
				setError("Muitas tentativas. Tente novamente mais tarde.");
				setIsBlocked(true);
				return;
			}

			setError(data?.error || "Erro ao verificar senha");
		} catch {
			setError("Erro de conexão ao verificar senha");
		}
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				setIsOpen(open);
				// Ao fechar, limpar input, erro e estado de bloqueio
				if (!open) {
					setPasswordInput("");
					setError("");
					setIsBlocked(false);
				}
			}}
			open={isOpen}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Link protegido por senha</DialogTitle>
					<DialogDescription>
						Este link requer uma senha para ser acessado.
					</DialogDescription>
				</DialogHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<Input
							maxLength={20}
							onChange={(e) => setPasswordInput(e.target.value)}
							placeholder="Digite a senha"
							type="password"
							value={passwordInput}
						/>
						{error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
					</div>
					<div className="flex justify-end space-x-2">
						<BaseButton
							onClick={() => {
								setIsOpen(false);
								setPasswordInput("");
								setError("");
								setIsBlocked(false);
							}}
							type="button"
							variant="outline"
						>
							Cancelar
						</BaseButton>
						<BaseButton
							disabled={isBlocked || passwordInput.trim() === ""}
							type="submit"
						>
							Acessar
						</BaseButton>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

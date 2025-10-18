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

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (passwordInput === link.password) {
			if (link.url) {
				window.open(link.url, "_blank", "noopener,noreferrer");
			}
			setIsOpen(false);
			setPasswordInput("");
			setError("");
		} else {
			setError("Senha incorreta");
		}
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
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
							onChange={(e) => setPasswordInput(e.target.value)}
							placeholder="Digite a senha"
							type="password"
							value={passwordInput}
						/>
						{error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
					</div>
					<div className="flex justify-end space-x-2">
						<BaseButton
							onClick={() => setIsOpen(false)}
							type="button"
							variant="outline"
						>
							Cancelar
						</BaseButton>
						<BaseButton type="submit">Acessar</BaseButton>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

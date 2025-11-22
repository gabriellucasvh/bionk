"use client";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeLocale } from "@/lib/i18n";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;

export default function EsqueciSenhaClient({
	locale,
}: {
	locale: "pt-br" | "en" | "es";
}) {
	const router = useRouter();
	const dict = require(
		`@/dictionaries/public/${normalizeLocale(locale)}/esqueci-senha.ts`
	).default;
	const [login, setLogin] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const isValidEmail = emailRegex.test(login);
	const isValidUsername = usernameRegex.test(login);
	const canSubmit = isValidEmail || isValidUsername;

	async function handleSubmit() {
		if (!canSubmit) {
			return;
		}
		setLoading(true);
		setMessage("");
		try {
			const res = await fetch("/api/auth/forgot-password/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ login }),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage(dict.sentMessage);
				router.push(
					`/esqueci-senha/verificar?login=${encodeURIComponent(login)}`
				);
			} else {
				setMessage(
					typeof data.error === "string"
						? data.error
						: "Erro ao enviar solicitação."
				);
			}
		} catch {
			setMessage("Erro interno. Tente novamente mais tarde.");
		} finally {
			setLoading(false);
		}
	}

	function goBack() {
		router.push("/login");
	}

	return (
		<div className="mx-auto flex h-dvh w-full max-w-lg flex-col items-center justify-center px-4 text-center">
			<h1 className="font-semibold text-2xl">{dict.title}</h1>
			<p className="mt-2 text-muted-foreground text-sm">{dict.subtitle}</p>
			<div className="mt-6 w-full space-y-2">
				<Label htmlFor="login">{dict.loginLabel}</Label>
				<Input
					aria-invalid={!canSubmit && login.length > 0}
					id="login"
					onChange={(e) => setLogin(e.target.value.trim())}
					placeholder={dict.loginPlaceholder}
					type="text"
					value={login}
				/>
			</div>
			{message && <p className="mt-4 text-sm">{message}</p>}
			<div className="mt-6 flex w-full max-w-lg flex-col justify-center gap-3">
				<BaseButton
					disabled={!(isValidEmail || isValidUsername) || loading}
					fullWidth
					onClick={handleSubmit}
				>
					{loading ? dict.sending : dict.send}
				</BaseButton>
				<Button className="mx-auto w-min" onClick={goBack} variant="ghost">
					<ChevronLeftIcon className="h-4 w-4" /> {dict.back}
				</Button>
			</div>
		</div>
	);
}

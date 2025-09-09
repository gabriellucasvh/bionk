"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [message, setMessage] = useState<string>("Verificando seu e-mail...");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!token) {
			setError("Token de verificação não encontrado na URL.");
			setIsLoading(false);
			return;
		}

		const verifyToken = async () => {
			try {
				const res = await fetch(`/api/auth/verify-email?token=${token}`);
				const data = await res.json();

				if (res.ok) {
					setMessage(data.message || "E-mail verificado com sucesso!");
					// Redirecionar para a página de login após um pequeno atraso
					setTimeout(() => {
						router.push("/login");
					}, 3000);
				} else {
					setError(data.error || "Falha ao verificar o e-mail.");
				}
			} catch (e) {
				console.error("Erro na verificação:", e);
				setError("Ocorreu um erro ao tentar verificar seu e-mail.");
			}
			setIsLoading(false);
		};

		verifyToken();
	}, [token, router]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-neutral-900">
			<div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-neutral-800">
				<h1 className="text-center font-bold text-2xl text-gray-900 dark:text-white">
					Verificação de E-mail
				</h1>
				{isLoading && (
					<div className="flex items-center justify-center space-x-2">
						<div className="h-4 w-4 animate-bounce rounded-full bg-blue-600" />
						<div className="h-4 w-4 animate-bounce rounded-full bg-blue-600 [animation-delay:-.3s]" />
						<div className="h-4 w-4 animate-bounce rounded-full bg-blue-600 [animation-delay:-.5s]" />
						<p className="text-gray-700 dark:text-gray-300">{message}</p>
					</div>
				)}
				{!isLoading && error && (
					<div
						className="rounded-lg bg-red-100 p-4 text-red-700 text-sm dark:bg-red-200 dark:text-red-800"
						role="alert"
					>
						<span className="font-medium">Erro!</span> {error}
					</div>
				)}
				{!(isLoading || error) && (
					<div
						className="rounded-lg bg-green-100 p-4 text-green-700 text-sm dark:bg-green-200 dark:text-green-800"
						role="alert"
					>
						<span className="font-medium">Sucesso!</span> {message}
					</div>
				)}
				{!isLoading && (
					<div className="text-center">
						<Link
							className="font-medium text-blue-600 text-sm hover:underline dark:text-blue-500"
							href="/login"
						>
							Ir para o Login
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div>Carregando...</div>}>
			<VerifyEmailContent />
		</Suspense>
	);
}

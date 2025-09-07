"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingPage from "@/components/layout/LoadingPage";
import { PasswordForm } from "../components/PasswordForm";

const passwordSchema = z
	.object({
		name: z
			.string()
			.min(1, "Nome é obrigatório")
			.min(2, "Nome deve ter pelo menos 2 caracteres")
			.max(50, "Nome deve ter no máximo 50 caracteres")
			.regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
		password: z
			.string()
			.min(8, "A senha deve ter pelo menos 8 caracteres")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
				"A senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

type PasswordFormData = z.infer<typeof passwordSchema>;

function PasswordRegistrationPageContent() {
	const [loading, setLoading] = useState(false);
	const [validatingToken, setValidatingToken] = useState(true);
	const [tokenValid, setTokenValid] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const { data: _session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router]);

	// Validar token ao carregar a página
	useEffect(() => {
		const validateToken = async () => {
			if (!token) {
				router.replace("/registro");
				return;
			}

			try {
				const response = await axios.post("/api/auth/validate-password-token", {
					token,
				});
				setTokenValid(true);
				setUserEmail(response.data.email);
			} catch (error) {
				if (error instanceof AxiosError) {
					setMessage({
						type: "error",
						text: error.response?.data?.error || "Token inválido ou expirado.",
					});
				}
				setTimeout(() => {
					router.replace("/registro");
				}, 3000);
			} finally {
				setValidatingToken(false);
			}
		};

		validateToken();
	}, [token, router]);

	const passwordForm = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
	});

	const handlePasswordSubmit: SubmitHandler<PasswordFormData> = async (
		data
	) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				token,
				name: data.name,
				password: data.password,
				stage: "create-user",
			});
			setMessage({
				type: "success",
				text: "Conta criada com sucesso! Redirecionando...",
			});
			setTimeout(() => {
				router.push("/studio");
			}, 2000);
		} catch (error) {
			if (error instanceof AxiosError) {
				setMessage({
					type: "error",
					text: error.response?.data?.error || "Erro ao criar conta.",
				});
			} else {
				setMessage({ type: "error", text: "Erro ao criar conta." });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleBackToOtp = () => {
		router.push(`/registro/otp?email=${encodeURIComponent(userEmail || "")}`);
	};

	if (status === "loading" || validatingToken) {
		return <LoadingPage />;
	}

	if (!tokenValid) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl text-red-600">
						Acesso Negado
					</h1>
					<p className="mb-4 text-gray-600">
						{message?.text || "Token inválido ou expirado."}
					</p>
					<p className="text-gray-500 text-sm">
						Redirecionando para o início do registro...
					</p>
				</div>
			</div>
		);
	}

	if (!userEmail) {
		return null; // Será redirecionado pelo useEffect
	}

	return (
		<div className="flex min-h-screen">
			{/* Lado esquerdo - Formulário */}
			<div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-lg">
					<div className="space-y-8">
						<div className="space-y-4 text-center">
							<h1 className="font-bold text-4xl text-black">Crie sua Senha</h1>
							<p className="text-lg text-muted-foreground">
								E-mail verificado com sucesso! Agora crie uma senha segura para
								sua conta.
							</p>
							{message && (
								<p
									className={`text-sm ${
										message.type === "error" ? "text-red-600" : "text-green-600"
									}`}
								>
									{message.text}
								</p>
							)}
						</div>

						<div className="space-y-6">
							<PasswordForm
								form={passwordForm}
								loading={loading}
								onBackToOtp={handleBackToOtp}
								onSubmit={handlePasswordSubmit}
							/>

							<div className="text-center">
								<span className="text-gray-600">
									Já possui uma conta?{" "}
									<Link
										className="font-medium text-blue-500 hover:underline"
										href="/login"
									>
										Faça login
									</Link>
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Lado direito - Imagem */}
			<div className="relative hidden flex-1 bg-black lg:flex">
				<div className="absolute inset-0 bg-black/20" />
				<Image
					alt="Cosmic Background"
					className="object-cover"
					fill
					priority
					src="/abstract-wave-image.png"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
						<Image
							alt="Bionk Logo"
							className="object-contain"
							height={200}
							priority
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755640991/bionk-logo-white_ld4dzs.svg"
							width={200}
						/>
						<p className="max-w-md text-lg opacity-90">
							Sua plataforma completa para gerenciar e personalizar seus links,
							criar páginas exclusivas, destacar o essencial e aumentar sua
							presença digital de forma profissional.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function PasswordRegistrationPage() {
	return (
		<Suspense fallback={<LoadingPage />}>
			<PasswordRegistrationPageContent />
		</Suspense>
	);
}

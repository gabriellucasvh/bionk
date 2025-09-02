"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingPage from "@/components/layout/LoadingPage";
import { PasswordForm } from "../components/PasswordForm";

const passwordSchema = z
	.object({
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

export default function PasswordRegistrationPage() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const { data: _session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email");

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router]);

	// Redirecionar se não houver email
	useEffect(() => {
		if (!email) {
			router.replace("/registro/email");
		}
	}, [email, router]);

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
				email,
				password: data.password,
				stage: "create-user",
			});
			setMessage({
				type: "success",
				text: "Conta criada com sucesso! Redirecionando...",
			});
			setTimeout(() => {
				router.push("/login");
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
		router.push(`/registro/otp?email=${encodeURIComponent(email || "")}`);
	};

	if (status === "loading") {
		return <LoadingPage />;
	}

	if (!email) {
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
									Já tem uma conta?{" "}
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
			<div className="relative hidden flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 lg:flex">
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

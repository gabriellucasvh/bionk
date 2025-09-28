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
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { EmailForm } from "./EmailForm";

const emailSchema = z.object({
	email: z.string().email("E-mail inválido"),
	username: z
		.string()
		.min(3, "Username deve ter pelo menos 3 caracteres")
		.max(30, "Username deve ter no máximo 30 caracteres")
		.regex(
			/^[a-z0-9._-]+$/,
			"Username deve conter apenas letras minúsculas, números, pontos, hífens e underscores"
		),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function PageRegistro() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const { data: _session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router]);

	const emailForm = useForm<EmailFormData>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: searchParams.get("email") || "",
			username: "",
		},
	});

	const handleEmailSubmit: SubmitHandler<EmailFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			const response = await axios.post("/api/auth/register", {
				email: data.email,
				username: data.username,
				stage: "request-otp",
			});
			// Redirecionar para a página de OTP com o token temporário
			const { otpToken } = response.data;
			router.push(`/registro/otp?token=${otpToken}`);
		} catch (error) {
			if (error instanceof AxiosError) {
				setMessage({
					type: "error",
					text: error.response?.data?.error || "Erro ao solicitar código.",
				});
			} else {
				setMessage({ type: "error", text: "Erro ao solicitar código." });
			}
		} finally {
			setLoading(false);
		}
	};

	if (status === "loading") {
		return <LoadingPage />;
	}

	return (
		<div className="flex min-h-dvh">
			{/* Lado esquerdo - Formulário */}
			<div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-lg">
					<div className="space-y-8">
						<div className="space-y-4 text-center">
							<h1 className="font-bold text-3xl text-black">
								Crie sua conta Bionk
							</h1>
							<p className="text-base text-muted-foreground">
								Comece grátis e personalize seus links em segundos.
							</p>
							{message && (
								<p className=" text-red-600 text-sm">{message.text}</p>
							)}
						</div>

						<div className="space-y-4">
							<EmailForm
								form={emailForm}
								loading={loading}
								onSubmit={handleEmailSubmit}
							/>

							<div className="flex items-center justify-center space-x-4">
								<div className="h-px flex-1 bg-gray-300" />
								<span className="text-gray-500 text-sm">ou</span>
								<div className="h-px flex-1 bg-gray-300" />
							</div>

							<div>
								<GoogleBtn />
							</div>

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

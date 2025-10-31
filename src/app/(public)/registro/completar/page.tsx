"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingPage from "@/components/layout/LoadingPage";
import { CompletionForm } from "../components/CompletionForm";

const REJEX_REPEAT = /([A-Za-z0-9])\1{3,}/;

const isObviousSequence = (pwd: string) => {
	const seqs = [
		"123456",
		"234567",
		"345678",
		"456789",
		"012345",
		"abcdef",
		"bcdefg",
		"cdefgh",
		"defghi",
		"uvwxyz",
		"qwerty",
		"asdfgh",
		"zxcvbn",
	];
	const lower = pwd.toLowerCase();
	return seqs.some((s) => lower.includes(s));
};

const hasExcessiveRepeat = (pwd: string) => REJEX_REPEAT.test(pwd);

const completionSchema = z.object({
	username: z
		.string()
		.min(3, "Username deve ter pelo menos 3 caracteres")
		.max(30, "Username deve ter no máximo 30 caracteres")
		.regex(
			/^[a-z0-9._-]+$/,
			"Username deve conter apenas letras minúsculas, números, pontos, hífens e underscores"
		),
	password: z
		.string()
		.min(9, "A senha deve ter pelo menos 9 caracteres")
		.max(64, "A senha deve ter no máximo 64 caracteres")
		.regex(/(?=.*[a-z])/, "Inclua pelo menos 1 letra minúscula")
		.regex(/(?=.*[A-Z])/, "Inclua pelo menos 1 letra maiúscula")
		.regex(/(?=.*\d)/, "Inclua pelo menos 1 número")
		.refine((pwd) => !isObviousSequence(pwd), {
			message: "Evite sequências óbvias (ex.: 123456, abcdef)",
		})
		.refine((pwd) => !hasExcessiveRepeat(pwd), {
			message: "Evite repetição excessiva de caracteres",
		}),
});

type CompletionFormData = z.infer<typeof completionSchema>;

function CompletionRegistrationPageContent() {
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
	const sig = searchParams.get("sig");

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
					const email = error.response?.data?.email || "";
					const emailParam = email ? `?email=${encodeURIComponent(email)}` : "";
					router.replace(`/registro/erro${emailParam}`);
				} else {
					router.replace("/registro/erro");
				}
			} finally {
				setValidatingToken(false);
			}
		};

		validateToken();
	}, [token, router]);

	const completionForm = useForm<CompletionFormData>({
		resolver: zodResolver(completionSchema),
	});

	const handleCompletionSubmit: SubmitHandler<CompletionFormData> = async (
		data
	) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				token,
				username: data.username,
				password: data.password,
				stage: "create-user",
				signature: sig || undefined,
			});
			// Login automático
			const result = await signIn("credentials", {
				email: userEmail as string,
				password: data.password,
				redirect: false,
			});
			if (result && !result.error) {
				setMessage({ type: "success", text: "Conta criada e login efetuado!" });
				router.replace("/studio/onboarding");
			} else {
				setMessage({ type: "success", text: "Conta criada! Faça login." });
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				const text = error.response?.data?.error || "Erro ao criar conta.";
				const l = text.toLowerCase();
				if (
					l.includes("assinatura inválida") ||
					l.includes("csrf inválido") ||
					l.includes("csrf expirado")
				) {
					const emailParam = userEmail
						? `?email=${encodeURIComponent(userEmail)}`
						: "";
					router.replace(`/registro/erro${emailParam}`);
					return;
				}
				setMessage({ type: "error", text });
			} else {
				setMessage({ type: "error", text: "Erro ao criar conta." });
			}
		} finally {
			setLoading(false);
		}
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
							<h1 className="font-bold text-4xl text-black">
								Complete seu Cadastro
							</h1>
							<p className="text-lg text-muted-foreground">
								E-mail verificado com sucesso! Escolha seu username e defina uma
								senha.
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
							<CompletionForm
								form={completionForm}
								loading={loading}
								onSubmit={handleCompletionSubmit}
							/>
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

export default function CompletionRegistrationPage() {
	return (
		<Suspense fallback={<LoadingPage />}>
			<CompletionRegistrationPageContent />
		</Suspense>
	);
}

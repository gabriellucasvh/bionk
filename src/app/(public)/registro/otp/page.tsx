"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingPage from "@/components/layout/LoadingPage";
import { OtpForm } from "../components/OtpForm";

const otpSchema = z.object({
	otp: z
		.string()
		.length(6, "O código deve ter 6 dígitos")
		.regex(/^\d{6}$/, "Código inválido, use apenas números"),
});

type OtpFormData = z.infer<typeof otpSchema>;

const OTP_EXPIRY_MINUTES = 2;
const OTP_COOLDOWN_MINUTES = 1;
const MINUTES_REGEX = /(\d+) minutos/;

export default function OtpRegistrationPage() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [otpTimer, setOtpTimer] = useState<number>(OTP_EXPIRY_MINUTES * 60);
	const [otpCooldownTimer, setOtpCooldownTimer] = useState<number>(0);
	const [isOtpInputDisabled, setIsOtpInputDisabled] = useState<boolean>(false);
	const [remainingAttempts, setRemainingAttempts] = useState<
		number | undefined
	>(undefined);

	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const cooldownTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
			return;
		}

		// Buscar status do OTP e sincronizar timers
		fetchOtpStatus();

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
			if (cooldownTimerIntervalRef.current) {
				clearInterval(cooldownTimerIntervalRef.current);
			}
		};
	}, [email, router]);

	const otpForm = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
	});

	const fetchOtpStatus = async () => {
		if (!email) return;

		try {
			const response = await axios.get(
				`/api/auth/otp-status?email=${encodeURIComponent(email)}`
			);
			const data = response.data;

			setRemainingAttempts(data.remainingAttempts);

			if (data.isBlocked) {
				// Usuário está bloqueado
				setIsOtpInputDisabled(true);
				setOtpTimer(0);
				setMessage({
					type: "error",
					text: `Muitas tentativas incorretas. Tente novamente em ${data.blockTimeRemaining} minutos.`,
				});
			} else if (data.isOtpExpired) {
				// OTP expirado
				setIsOtpInputDisabled(true);
				setOtpTimer(0);
				setMessage({
					type: "error",
					text: "Código OTP expirado. Solicite um novo código.",
				});
			} else {
				// OTP ainda válido
				setIsOtpInputDisabled(false);
				startOtpTimer(data.otpTimeRemaining);
			}
		} catch (error) {
			console.error("Erro ao buscar status do OTP:", error);
			// Em caso de erro, usar comportamento padrão
			startOtpTimer(OTP_EXPIRY_MINUTES * 60);
		}
	};

	// Iniciar timer do OTP
	const startOtpTimer = (initialTime?: number) => {
		const timeInSeconds = initialTime ?? OTP_EXPIRY_MINUTES * 60;
		setOtpTimer(timeInSeconds);
		setIsOtpInputDisabled(false);

		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
		}

		timerIntervalRef.current = setInterval(() => {
			setOtpTimer((prev) => {
				if (prev <= 1) {
					setIsOtpInputDisabled(true);
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Iniciar timer de cooldown
	const startOtpCooldownTimer = (minutes: number) => {
		if (cooldownTimerIntervalRef.current) {
			clearInterval(cooldownTimerIntervalRef.current);
		}
		setOtpCooldownTimer(minutes * 60);
		setIsOtpInputDisabled(true);
		cooldownTimerIntervalRef.current = setInterval(() => {
			setOtpCooldownTimer((prev) => {
				if (prev <= 1) {
					if (cooldownTimerIntervalRef.current) {
						clearInterval(cooldownTimerIntervalRef.current);
						cooldownTimerIntervalRef.current = null;
					}
					setIsOtpInputDisabled(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const handleOtpSubmit: SubmitHandler<OtpFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				email,
				otp: data.otp,
				stage: "verify-otp",
			});
			// Redirecionar para a página de senha
			router.push(`/registro/senha?email=${encodeURIComponent(email!)}`);
		} catch (error) {
			if (error instanceof AxiosError) {
				const errorText =
					error.response?.data?.error || "Erro ao verificar código.";
				setMessage({ type: "error", text: errorText });

				// Extrair tentativas restantes da mensagem de erro
				const attemptsMatch = errorText.match(/(\d+) tentativas? restantes?/);
				if (attemptsMatch) {
					setRemainingAttempts(Number.parseInt(attemptsMatch[1], 10));
				}

				if (error.response?.status === 429) {
					const match = errorText.match(MINUTES_REGEX);
					const cooldownMinutes = match
						? Number.parseInt(match[1], 10)
						: OTP_COOLDOWN_MINUTES;
					startOtpCooldownTimer(cooldownMinutes);
					setRemainingAttempts(0); // Sem tentativas restantes quando bloqueado
				}
			} else {
				setMessage({ type: "error", text: "Erro ao verificar código." });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		if (email) {
			setLoading(true);
			setMessage(null);
			otpForm.reset();
			try {
				await axios.post("/api/auth/register", {
					email,
					stage: "request-otp",
				});
				startOtpTimer(OTP_EXPIRY_MINUTES * 60);
				setOtpCooldownTimer(0);
				setIsOtpInputDisabled(false);
				setRemainingAttempts(undefined); // Reset tentativas restantes
				setMessage({
					type: "success",
					text: "Novo código enviado com sucesso!",
				});
			} catch (error) {
				if (error instanceof AxiosError) {
					setMessage({
						type: "error",
						text: error.response?.data?.error || "Erro ao reenviar código.",
					});
				} else {
					setMessage({ type: "error", text: "Erro ao reenviar código." });
				}
			} finally {
				setLoading(false);
			}
		}
	};

	const handleBackToEmail = () => {
		router.push(`/registro/email?email=${encodeURIComponent(email || "")}`);
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
							<h1 className="font-bold text-4xl text-black">
								Verifique seu E-mail
							</h1>
							<p className="text-lg text-muted-foreground">
								Enviamos um código de 6 dígitos para {email}. Verifique sua
								caixa de entrada (e spam).
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
							<OtpForm
								form={otpForm}
								isOtpInputDisabled={isOtpInputDisabled}
								loading={loading}
								onBackToEmail={handleBackToEmail}
								onResendOtp={handleResendOtp}
								onSubmit={handleOtpSubmit}
								otpCooldownTimer={otpCooldownTimer}
								otpTimer={otpTimer}
								remainingAttempts={remainingAttempts}
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

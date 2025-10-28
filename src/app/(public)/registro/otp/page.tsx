"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
// Cooldown de reenvio reduzido para 30s
const OTP_COOLDOWN_MINUTES = 0.5;
const MINUTES_REGEX = /(\d+) minutos/;
const ATTEMPTS_REGEX = /(\d+) tentativas? restantes?/;

function OtpRegistrationPageContent() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [restartRequired, setRestartRequired] = useState(false);
	const [otpTimer, setOtpTimer] = useState<number>(OTP_EXPIRY_MINUTES * 60);
	const [otpCooldownTimer, setOtpCooldownTimer] = useState<number>(0);
	const [isOtpInputDisabled, setIsOtpInputDisabled] = useState<boolean>(false);
	const [remainingAttempts, setRemainingAttempts] = useState<
		number | undefined
	>(undefined);
	const [validatingToken, setValidatingToken] = useState(true);
	const [tokenValid, setTokenValid] = useState(false);
	const [userEmail, setUserEmail] = useState<string>("");

	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const cooldownTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const { data: _session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router]);

	const validateToken = useCallback(async () => {
		if (!token) {
			return;
		}

		try {
			const response = await axios.post("/api/auth/validate-otp-token", {
				token,
			});
			setUserEmail(response.data.userEmail);
			setTokenValid(true);
		} catch {
			setTokenValid(false);
		} finally {
			setValidatingToken(false);
		}
	}, [token, router]);

	// Iniciar timer do OTP
	const startOtpTimer = useCallback((initialTime?: number) => {
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
	}, []);

	const fetchOtpStatus = useCallback(async () => {
		if (!userEmail) {
			return;
		}

		try {
			const response = await axios.get(
				`/api/auth/otp-status?email=${encodeURIComponent(userEmail)}`
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
		} catch {
			// Em caso de erro, usar comportamento padrão
			startOtpTimer(OTP_EXPIRY_MINUTES * 60);
		}
	}, [userEmail, startOtpTimer]);

	// Validar token ao carregar a página
	useEffect(() => {
		if (!token) {
			router.replace("/registro");
			return;
		}

		validateToken();

		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
			}
			if (cooldownTimerIntervalRef.current) {
				clearInterval(cooldownTimerIntervalRef.current);
			}
		};
	}, [token, router, validateToken]);

	// Buscar status do OTP após validar o token
	useEffect(() => {
		if (tokenValid && userEmail) {
			fetchOtpStatus();
		}
	}, [tokenValid, userEmail, fetchOtpStatus]);

	const otpForm = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
	});

	// Iniciar timer de cooldown (opcionalmente desabilitando o input)
	const startOtpCooldownTimer = (
		minutes: number,
		options?: { disableInput?: boolean }
	) => {
		if (cooldownTimerIntervalRef.current) {
			clearInterval(cooldownTimerIntervalRef.current);
		}
		setOtpCooldownTimer(minutes * 60);
		if (options?.disableInput) {
			setIsOtpInputDisabled(true);
		}
		cooldownTimerIntervalRef.current = setInterval(() => {
			setOtpCooldownTimer((prev) => {
				if (prev <= 1) {
					if (cooldownTimerIntervalRef.current) {
						clearInterval(cooldownTimerIntervalRef.current);
						cooldownTimerIntervalRef.current = null;
					}
					if (options?.disableInput) {
						setIsOtpInputDisabled(false);
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Função auxiliar para extrair tentativas restantes
	const extractRemainingAttempts = (errorText: string) => {
		const attemptsMatch = errorText.match(ATTEMPTS_REGEX);
		if (attemptsMatch) {
			setRemainingAttempts(Number.parseInt(attemptsMatch[1], 10));
		}
	};

	// Função auxiliar para lidar com erro de rate limit
	const handleRateLimitError = (errorText: string) => {
		const match = errorText.match(MINUTES_REGEX);
		const cooldownMinutes = match
			? Number.parseInt(match[1], 10)
			: OTP_COOLDOWN_MINUTES;
		// Em caso de rate limit, desabilitar o input durante o cooldown
		startOtpCooldownTimer(cooldownMinutes, { disableInput: true });
		setRemainingAttempts(0);
	};

	// Função auxiliar para lidar com erros de OTP
	const handleOtpError = (error: unknown) => {
		if (error instanceof AxiosError) {
			const errorText =
				error.response?.data?.error || "Erro ao verificar código.";
			setMessage({ type: "error", text: errorText });
			extractRemainingAttempts(errorText);

			if (error.response?.status === 429) {
				handleRateLimitError(errorText);
			}
		} else {
			setMessage({ type: "error", text: "Erro ao verificar código." });
		}
	};

	const handleOtpSubmit: SubmitHandler<OtpFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			const response = await axios.post("/api/auth/register", {
				email: userEmail,
				otp: data.otp,
				stage: "verify-otp",
			});
			// Redirecionar para a página de senha com o token temporário
			const { passwordSetupToken } = response.data;
			router.push(`/registro/senha?token=${passwordSetupToken}`);
		} catch (error) {
			handleOtpError(error);
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		if (userEmail) {
			setLoading(true);
			setMessage(null);
			otpForm.reset();
			try {
				await axios.post("/api/auth/register", {
					email: userEmail,
					stage: "request-otp",
				});
				startOtpTimer(OTP_EXPIRY_MINUTES * 60);
				// Iniciar cooldown de 30s após reenvio sem bloquear o input
				startOtpCooldownTimer(OTP_COOLDOWN_MINUTES, { disableInput: false });
				setRemainingAttempts(undefined); // Reset tentativas restantes
				setMessage({
					type: "success",
					text: "Novo código enviado com sucesso!",
				});
			} catch (error) {
				if (error instanceof AxiosError) {
					const text =
						error.response?.data?.error || "Erro ao reenviar código.";
					setMessage({ type: "error", text });
					if (error.response?.data?.code === "restart-required") {
						setRestartRequired(true);
					}
				} else {
					setMessage({ type: "error", text: "Erro ao reenviar código." });
				}
			} finally {
				setLoading(false);
			}
		}
	};

	const handleBackToEmail = () => {
		router.push(`/registro?email=${encodeURIComponent(userEmail || "")}`);
	};

	if (status === "loading" || validatingToken) {
		return <LoadingPage />;
	}

	if (!tokenValid) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="font-bold text-2xl text-red-600">Acesso Negado</h1>
					<p className="mt-2 text-gray-600">Token inválido ou expirado.</p>
					<div className="mt-6">
						<Link
							className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							href="/registro"
						>
							Iniciar novo registro
						</Link>
					</div>
				</div>
			</div>
		);
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
							<p className="text-base text-muted-foreground">
								Enviamos um código de 6 dígitos para {userEmail}. Verifique sua
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
							{restartRequired && (
								<div className="mt-4">
									<Link
										className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
										href="/registro"
									>
										Iniciar novo registro
									</Link>
								</div>
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

export default function OtpRegistrationPage() {
	return (
		<Suspense fallback={<LoadingPage />}>
			<OtpRegistrationPageContent />
		</Suspense>
	);
}

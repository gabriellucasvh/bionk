"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { EmailForm } from "./components/EmailForm";
import { OtpForm } from "./components/OtpForm";
import { PasswordForm } from "./components/PasswordForm";

const emailSchema = z.object({
	email: z.string().email("E-mail inválido"),
});

const otpSchema = z.object({
	otp: z
		.string()
		.length(6, "O código deve ter 6 dígitos")
		.regex(/^\d{6}$/, "Código inválido, use apenas números"),
});

const passwordSchema = z.object({
	username: z
		.string()
		.min(3, "Username deve ter pelo menos 3 caracteres")
		.max(30, "Username deve ter no máximo 30 caracteres")
		.regex(
			/^[a-z0-9._]{3,30}$/i,
			"Use apenas letras minúsculas, números, pontos(.) e underscores(_)"
		),
	password: z.string().min(9, "A senha deve ter pelo menos 9 caracteres"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type Stage = "email" | "otp" | "password" | "success";

const OTP_EXPIRY_MINUTES = 2;
// Cooldown de reenvio reduzido para 30 segundos
const OTP_COOLDOWN_MINUTES = 0.5;
const MINUTES_REGEX = /(\d+) minutos/;

// Funções utilitárias extraídas para reduzir complexidade cognitiva
const useTimerManagement = () => {
	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const cooldownTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const clearTimers = () => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}
		if (cooldownTimerIntervalRef.current) {
			clearInterval(cooldownTimerIntervalRef.current);
			cooldownTimerIntervalRef.current = null;
		}
	};

	return { timerIntervalRef, cooldownTimerIntervalRef, clearTimers };
};

const getStageTitle = (stage: Stage) => {
	switch (stage) {
		case "email":
			return "Crie sua conta Bionk";
		case "otp":
			return "Verifique seu E-mail";
		case "password":
			return "Defina sua Senha";
		case "success":
			return "Registro Concluído!";
		default:
			return "";
	}
};

const getStageDescription = (stage: Stage) => {
	switch (stage) {
		case "email":
			return "Comece grátis e crie seus links em segundos.";
		case "otp":
			return (
				<p>
					Enviamos um código de 6 dígitos para seu e-mail. Verifique sua caixa
					de entrada (e spam).
				</p>
			);
		case "password":
			return "Defina seu username e sua senha.";
		case "success":
			return "Você será redirecionado para a página de login em breve.";
		default:
			return "";
	}
};

function Register() {
	const [stage, setStage] = useState<Stage>("email");
	const [email, setEmail] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const [otpTimer, setOtpTimer] = useState<number>(OTP_EXPIRY_MINUTES * 60);
	const [otpCooldownTimer, setOtpCooldownTimer] = useState<number>(0);
	const [isOtpInputDisabled, setIsOtpInputDisabled] = useState<boolean>(false);

	const { timerIntervalRef, cooldownTimerIntervalRef, clearTimers } =
		useTimerManagement();

	const { data: _session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router]);

	const emailForm = useForm<EmailFormData>({
		resolver: zodResolver(emailSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
		},
	});

	const otpForm = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
	});

	const passwordForm = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	useEffect(() => {
		return () => {
			clearTimers();
		};
	}, [clearTimers]);

	const startOtpTimer = () => {
		clearTimers();
		setOtpTimer(OTP_EXPIRY_MINUTES * 60);
		setIsOtpInputDisabled(false);
		timerIntervalRef.current = setInterval(() => {
			setOtpTimer((prev) => {
				if (prev <= 1) {
					if (timerIntervalRef.current) {
						clearInterval(timerIntervalRef.current);
						timerIntervalRef.current = null;
					}
					setMessage({
						type: "error",
						text: "Tempo esgotado. Solicite um novo código.",
					});
					setIsOtpInputDisabled(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const startOtpCooldownTimer = (durationMinutes: number) => {
		if (cooldownTimerIntervalRef.current) {
			clearInterval(cooldownTimerIntervalRef.current);
		}
		setOtpCooldownTimer(durationMinutes * 60);
		cooldownTimerIntervalRef.current = setInterval(() => {
			setOtpCooldownTimer((prevCooldown) => {
				if (prevCooldown <= 1) {
					if (cooldownTimerIntervalRef.current) {
						clearInterval(cooldownTimerIntervalRef.current);
						cooldownTimerIntervalRef.current = null;
					}
					setMessage(null);
					return 0;
				}
				return prevCooldown - 1;
			});
		}, 1000);
	};

	const _submitEmailLogic = async (data: EmailFormData, _isResend = false) => {
		setLoading(true);
		setMessage(null);
		clearTimers();
		otpForm.reset();
		try {
			await axios.post("/api/auth/register", {
				email: data.email,
				stage: "request-otp",
			});
			setEmail(data.email);
			setStage("otp");
			startOtpTimer();
			// Iniciar cooldown de 30s para reenvio
			startOtpCooldownTimer(OTP_COOLDOWN_MINUTES);
			setIsOtpInputDisabled(false);
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

	const handleEmailSubmit: SubmitHandler<EmailFormData> = async (data) => {
		await _submitEmailLogic(data, false);
	};

	const handleResendOtp = async () => {
		if (email) {
			await _submitEmailLogic({ email }, true);
		}
	};

	const [passwordSetupToken, setPasswordSetupToken] = useState<string>("");
	const [tokenSignature, setTokenSignature] = useState<string>("");

	const handleOtpSubmit: SubmitHandler<OtpFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			const res = await axios.post("/api/auth/register", {
				email,
				otp: data.otp,
				stage: "verify-otp",
			});
			const { passwordSetupToken: _token, signature } = res.data || {};
			if (_token) {
				setPasswordSetupToken(_token);
			}
			if (signature) {
				setTokenSignature(signature);
			}
			setStage("password");
			setMessage({
				type: "success",
				text: "Código verificado com sucesso! Defina sua senha.",
			});
		} catch (error) {
			if (error instanceof AxiosError) {
				const errorText =
					error.response?.data?.error || "Erro ao verificar código.";
				setMessage({ type: "error", text: errorText });
				if (error.response?.status === 429) {
					const match = errorText.match(MINUTES_REGEX);
					const cooldownMinutes = match
						? Number.parseInt(match[1], 10)
						: OTP_COOLDOWN_MINUTES;
					startOtpCooldownTimer(cooldownMinutes);
				}
			} else {
				setMessage({ type: "error", text: "Erro ao verificar código." });
			}
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit: SubmitHandler<PasswordFormData> = async (
		data
	) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				token: passwordSetupToken,
				username: data.username,
				password: data.password,
				signature: tokenSignature,
				stage: "create-user",
			});
			// Tentar login automático com credenciais
			const result = await signIn("credentials", {
				email,
				password: data.password,
				redirect: false,
			});

			setStage("success");
			if (result && !result.error) {
				setMessage({
					type: "success",
					text: "Conta criada e login efetuado! Redirecionando...",
				});
				router.replace("/studio/perfil");
			} else {
				setMessage({
					type: "success",
					text: "Conta criada com sucesso! Faça login manualmente se não ocorrer automaticamente.",
				});
			}
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

	if (status === "loading") {
		return <LoadingPage />;
	}

	return (
		<div className="flex min-h-dvh">
			{/* Lado esquerdo - Formulário */}
			<div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-lg">
					<div className="mb-2 space-y-4 text-center">
						<h1 className="font-bold text-4xl text-black">
							{getStageTitle(stage)}
						</h1>
						<div className="text-base text-muted-foreground">
							{getStageDescription(stage)}
						</div>
					</div>

					{message && (
						<div
							className={`mb-4 text-center text-sm ${message.type === "success" ? " text-green-500" : " text-red-500"}`}
						>
							{message.text}
						</div>
					)}

					{stage === "email" && (
						<EmailForm
							form={emailForm}
							loading={loading}
							onSubmit={handleEmailSubmit}
						/>
					)}

					{stage === "otp" && (
						<OtpForm
							form={otpForm}
							isOtpInputDisabled={isOtpInputDisabled}
							loading={loading}
							onBackToEmail={() => {
								setStage("email");
								setMessage(null);
								emailForm.reset();
								clearTimers();
								setOtpTimer(0);
								setOtpCooldownTimer(0);
								setIsOtpInputDisabled(false);
							}}
							onResendOtp={handleResendOtp}
							onSubmit={handleOtpSubmit}
							otpCooldownTimer={otpCooldownTimer}
							otpTimer={otpTimer}
						/>
					)}

					{stage === "password" && (
						<PasswordForm
							form={passwordForm}
							loading={loading}
							onSubmit={handlePasswordSubmit}
						/>
					)}

					{stage !== "success" && (
						<>
							<div className="mt-8 flex items-center justify-center space-x-4">
								<div className="h-px flex-1 bg-gray-300" />
								<span className="text-gray-500 text-sm">ou</span>
								<div className="h-px flex-1 bg-gray-300" />
							</div>
							<div className="mt-6">
								<GoogleBtn />
							</div>
							<div className="mt-8 text-center">
								<span className="text-gray-600">
									Já possui uma conta?{" "}
									<Link
										className="font-medium text-blue-500 hover:underline"
										href={"/login"}
										onClick={() => setMessage(null)}
									>
										Faça o Login
									</Link>
								</span>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Lado direito - Imagem */}
			<div className="relative hidden flex-1 bg-black lg:flex">
				<div className="absolute inset-0 bg-black/20" />
				<Image
					alt="Abstract Wave Background"
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

export default Register;

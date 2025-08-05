"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BaseButton } from "@/components/buttons/BaseButton";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.object({
	email: z.string().email("E-mail inválido"),
});

const otpSchema = z.object({
	otp: z
		.string()
		.length(6, "O código deve ter 6 dígitos")
		.regex(/^\d{6}$/, "Código inválido, use apenas números"),
});

const passwordSchema = z
	.object({
		password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type Stage = "email" | "otp" | "password" | "success";

const OTP_EXPIRY_MINUTES = 5;
const OTP_COOLDOWN_MINUTES = 1;

function Register() {
	const [stage, setStage] = useState<Stage>("email");
	const [email, setEmail] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [otpTimer, setOtpTimer] = useState<number>(OTP_EXPIRY_MINUTES * 60);
	const [otpCooldownTimer, setOtpCooldownTimer] = useState<number>(0);
	const [isOtpInputDisabled, setIsOtpInputDisabled] = useState<boolean>(false);

	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const cooldownTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/dashboard");
		}
	}, [status, router]);

	const emailForm = useForm<EmailFormData>({
		resolver: zodResolver(emailSchema),
	});

	const otpForm = useForm<OtpFormData>({
		resolver: zodResolver(otpSchema),
	});

	const passwordForm = useForm<PasswordFormData>({
		resolver: zodResolver(passwordSchema),
	});

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

	useEffect(() => {
		return () => {
			clearTimers();
		};
	}, []);

	const startOtpTimer = () => {
		clearTimers();
		setOtpTimer(OTP_EXPIRY_MINUTES * 60);
		setIsOtpInputDisabled(false);
		timerIntervalRef.current = setInterval(() => {
			setOtpTimer((prev) => {
				if (prev <= 1) {
					clearInterval(timerIntervalRef.current!);
					timerIntervalRef.current = null;
					setMessage({
						type: "error",
						text: `Tempo esgotado. Solicite um novo código.`,
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
					clearInterval(cooldownTimerIntervalRef.current!);
					cooldownTimerIntervalRef.current = null;
					setMessage(null);
					return 0;
				}
				return prevCooldown - 1;
			});
		}, 1000);
	};

	const _submitEmailLogic = async (
		data: EmailFormData,
		_isResend: boolean = false,
	) => {
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
			setMessage({
				type: "success",
				text: "Código de verificação enviado para o seu e-mail.",
			});
			startOtpTimer();
			setOtpCooldownTimer(0);
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

	const handleOtpSubmit: SubmitHandler<OtpFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				email,
				otp: data.otp,
				stage: "verify-otp",
			});
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
					const match = errorText.match(/(\d+) minutos/);
					const cooldownMinutes = match
						? parseInt(match[1], 10)
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
		data,
	) => {
		setLoading(true);
		setMessage(null);
		try {
			await axios.post("/api/auth/register", {
				email,
				password: data.password,
				stage: "create-user",
			});
			setStage("success");
			setMessage({
				type: "success",
				text: "Conta criada com sucesso! Você será redirecionado para o login.",
			});
			setTimeout(() => router.push("/login"), 3000);
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
		<main className="min-h-screen flex flex-col items-center justify-center">
			<section className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
				<article className="bg-white p-8 rounded-lg w-full max-w-md md:border border-lime-500">
					<div className="text-center mb-6 space-y-2">
						<h2 className="text-2xl font-bold text-center text-black">
							{stage === "email" && "Crie sua conta Bionk"}
							{stage === "otp" && "Verifique seu E-mail"}
							{stage === "password" && "Defina sua Senha"}
							{stage === "success" && "Registro Concluído!"}
						</h2>
						<div className="text-muted-foreground">
							{stage === "email" && "Comece personalizando seus links."}
							{stage === "otp" && (
								<p className="flex flex-col ">
									Enviamos um código de 6 dígitos para {email}. Verifique sua
									caixa de entrada (e spam).
									<br />
									{otpTimer > 0 && (
										<span className="text-xs">
											Você tem {Math.floor(otpTimer / 60)}:
											{(otpTimer % 60).toString().padStart(2, "0")} para inserir
											o código.
										</span>
									)}
								</p>
							)}
							{stage === "password" &&
								"Escolha uma senha segura para sua conta."}
							{stage === "success" &&
								"Você será redirecionado para a página de login em breve."}
						</div>
					</div>

					{message && (
						<div
							className={`mb-4 p-3 rounded-md text-sm text-center ${message.type === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
						>
							{message.text}
						</div>
					)}

					{stage === "email" && (
						<form
							onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
							className="space-y-4"
						>
							<div>
								<Label className="block text-base font-semibold text-black">
									Seu email
								</Label>
								<Input
									className="w-full px-4 py-3 border mt-1 mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
									placeholder="Digite seu e-mail"
									type="email"
									{...emailForm.register("email")}
									disabled={loading}
								/>
								{emailForm.formState.errors.email && (
									<p className="text-red-600 text-sm">
										{emailForm.formState.errors.email.message}
									</p>
								)}
							</div>
							<BaseButton type="submit" loading={loading} className="w-full">
								Continuar
							</BaseButton>
						</form>
					)}

					{stage === "otp" && (
						<form
							onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
							className="space-y-4"
						>
							<div>
								<Label className="block text-base font-semibold text-black">
									Código de Verificação
								</Label>
								<input
									className="w-full px-4 py-10 border mt-1 mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400 tracking-[0.3em] text-center text-xl md:text-5xl"
									placeholder="------"
									type="text"
									maxLength={6}
									{...otpForm.register("otp")}
									disabled={
										loading ||
										isOtpInputDisabled ||
										otpTimer === 0 ||
										otpCooldownTimer > 0
									}
								/>
								{otpForm.formState.errors.otp && (
									<p className="text-red-600 text-sm">
										{otpForm.formState.errors.otp.message}
									</p>
								)}
								{otpCooldownTimer > 0 && (
									<span className="text-xs text-gray-500">
										Muitas tentativas. Tente novamente em{" "}
										{Math.floor(otpCooldownTimer / 60)}:
										{(otpCooldownTimer % 60).toString().padStart(2, "0")}.
									</span>
								)}
							</div>
							<BaseButton
								type="submit"
								loading={
									loading ||
									isOtpInputDisabled ||
									otpTimer === 0 ||
									otpCooldownTimer > 0
								}
								className="w-full"
							>
								Verificar Código
							</BaseButton>
							<div className="flex justify-between items-center">
								<BaseButton
									type="button"
									variant="white"
									className="px-4 py-2 rounded-md"
									onClick={() => {
										setStage("email");
										setMessage(null);
										emailForm.reset();
										clearTimers();
										setOtpTimer(0);
										setOtpCooldownTimer(0);
										setIsOtpInputDisabled(false);
									}}
									loading={loading}
								>
									Usar outro e-mail
								</BaseButton>
								{(otpTimer === 0 ||
									otpCooldownTimer > 0 ||
									isOtpInputDisabled) && (
									<BaseButton
										type="button"
										variant="white"
										className="px-4 py-2 rounded-md"
										onClick={handleResendOtp}
										loading={loading || (otpCooldownTimer > 0 && otpTimer > 0)}
									>
										Solicitar novo código
									</BaseButton>
								)}
							</div>
						</form>
					)}

					{stage === "password" && (
						<form
							onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
							className="space-y-4"
						>
							<div>
								<Label className="block text-base font-semibold text-black">
									Sua senha
								</Label>
								<div className="relative mt-1">
									<Input
										className="w-full px-4 py-3 border mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
										placeholder="Digite sua senha"
										type={showPassword ? "text" : "password"}
										{...passwordForm.register("password")}
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
										disabled={loading}
									>
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
								{passwordForm.formState.errors.password && (
									<p className="text-red-600 text-sm">
										{passwordForm.formState.errors.password.message}
									</p>
								)}
							</div>
							<div>
								<Label className="block text-base font-semibold text-black">
									Confirmar senha
								</Label>
								<div className="relative mt-1">
									<Input
										className="w-full px-4 py-3 border mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
										placeholder="Confirme sua senha"
										type={showConfirmPassword ? "text" : "password"}
										{...passwordForm.register("confirmPassword")}
										disabled={loading}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
										disabled={loading}
									>
										{showConfirmPassword ? (
											<EyeOff size={20} />
										) : (
											<Eye size={20} />
										)}
									</button>
								</div>
								{passwordForm.formState.errors.confirmPassword && (
									<p className="text-red-600 text-sm">
										{passwordForm.formState.errors.confirmPassword.message}
									</p>
								)}
							</div>
							<BaseButton type="submit" loading={loading} className="w-full">
								Criar Conta
							</BaseButton>
						</form>
					)}

					{stage !== "success" && (
						<>
							<div className="flex flex-col items-center justify-center space-y-4 mt-6">
								<span className="w-full flex items-center justify-center h-px bg-gray-300">
									<span className="px-4 bg-white text-muted-foreground">
										ou
									</span>
								</span>
								<GoogleBtn />
							</div>
							<div className="mt-6 text-center">
								<span className="text-sm text-muted-foreground">
									Já possui uma conta?{" "}
									<Link
										className="text-blue-500 hover:underline"
										href={"/login"}
										onClick={() => setMessage(null)}
									>
										Faça o Login
									</Link>
								</span>
							</div>
						</>
					)}
					{stage === "email" && (
						<div className="mt-4">
							<p className="text-xs text-muted-foreground text-center">
								Ao continuar, você aceita os nossos{" "}
								<Link className="underline" href="/termos">
									Termos e Condições
								</Link>{" "}
								e a nossa{" "}
								<Link className="underline" href="/privacidade">
									Política de Privacidade
								</Link>
								.
							</p>
						</div>
					)}
				</article>
			</section>
		</main>
	);
}

export default Register;

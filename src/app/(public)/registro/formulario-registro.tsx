"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

	const { data: _session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.replace("/studio");
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
					clearInterval(cooldownTimerIntervalRef.current!);
					cooldownTimerIntervalRef.current = null;
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
		<main className="flex min-h-screen flex-col items-center justify-center">
			<section className="flex min-h-screen w-full items-center justify-center px-4 sm:px-6 lg:px-8">
				<article className="w-full max-w-md rounded-lg border-lime-500 bg-white p-8 md:border">
					<div className="mb-6 space-y-2 text-center">
						<h2 className="text-center font-bold text-2xl text-black">
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
							className={`mb-4 rounded-md p-3 text-center text-sm ${message.type === "success" ? "border border-green-400 bg-green-100 text-green-700" : "border border-red-400 bg-red-100 text-red-700"}`}
						>
							{message.text}
						</div>
					)}

					{stage === "email" && (
						<form
							className="space-y-4"
							onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
						>
							<div>
								<Label className="block font-semibold text-base text-black">
									Seu email
								</Label>
								<Input
									className="mt-1 mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
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
							<BaseButton className="w-full" loading={loading} type="submit">
								Continuar
							</BaseButton>
						</form>
					)}

					{stage === "otp" && (
						<form
							className="space-y-4"
							onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
						>
							<div>
								<Label className="block font-semibold text-base text-black">
									Código de Verificação
								</Label>
								<input
									className="mt-1 mb-1 w-full rounded-md border px-4 py-10 text-center text-xl tracking-[0.3em] transition-colors duration-400 focus-visible:border-lime-500 md:text-5xl"
									maxLength={6}
									placeholder="------"
									type="text"
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
									<span className="text-gray-500 text-xs">
										Muitas tentativas. Tente novamente em{" "}
										{Math.floor(otpCooldownTimer / 60)}:
										{(otpCooldownTimer % 60).toString().padStart(2, "0")}.
									</span>
								)}
							</div>
							<BaseButton
								className="w-full"
								loading={
									loading ||
									isOtpInputDisabled ||
									otpTimer === 0 ||
									otpCooldownTimer > 0
								}
								type="submit"
							>
								Verificar Código
							</BaseButton>
							<div className="flex items-center justify-between">
								<BaseButton
									className="rounded-md px-4 py-2"
									loading={loading}
									onClick={() => {
										setStage("email");
										setMessage(null);
										emailForm.reset();
										clearTimers();
										setOtpTimer(0);
										setOtpCooldownTimer(0);
										setIsOtpInputDisabled(false);
									}}
									type="button"
									variant="white"
								>
									Usar outro e-mail
								</BaseButton>
								{(otpTimer === 0 ||
									otpCooldownTimer > 0 ||
									isOtpInputDisabled) && (
									<BaseButton
										className="rounded-md px-4 py-2"
										loading={loading || (otpCooldownTimer > 0 && otpTimer > 0)}
										onClick={handleResendOtp}
										type="button"
										variant="white"
									>
										Solicitar novo código
									</BaseButton>
								)}
							</div>
						</form>
					)}

					{stage === "password" && (
						<form
							className="space-y-4"
							onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
						>
							<div>
								<Label className="block font-semibold text-base text-black">
									Sua senha
								</Label>
								<div className="relative mt-1">
									<Input
										className="mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
										placeholder="Digite sua senha"
										type={showPassword ? "text" : "password"}
										{...passwordForm.register("password")}
										disabled={loading}
									/>
									<button
										className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
										disabled={loading}
										onClick={() => setShowPassword(!showPassword)}
										type="button"
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
								<Label className="block font-semibold text-base text-black">
									Confirmar senha
								</Label>
								<div className="relative mt-1">
									<Input
										className="mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
										placeholder="Confirme sua senha"
										type={showConfirmPassword ? "text" : "password"}
										{...passwordForm.register("confirmPassword")}
										disabled={loading}
									/>
									<button
										className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
										disabled={loading}
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										type="button"
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
							<BaseButton className="w-full" loading={loading} type="submit">
								Criar Conta
							</BaseButton>
						</form>
					)}

					{stage !== "success" && (
						<>
							<div className="mt-6 flex flex-col items-center justify-center space-y-4">
								<span className="flex h-px w-full items-center justify-center bg-gray-300">
									<span className="bg-white px-4 text-muted-foreground">
										ou
									</span>
								</span>
								<GoogleBtn />
							</div>
							<div className="mt-6 text-center">
								<span className="text-muted-foreground text-sm">
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
							<p className="text-center text-muted-foreground text-xs">
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BaseButton } from "@/components/buttons/BaseButton";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
	login: z.string().min(3, "Informe email ou username"),
	password: z.string().min(9, "A senha deve ter pelo menos 9 caracteres"),
});

type FormData = z.infer<typeof schema>;

function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const searchParams = useSearchParams();
	const [showPassword, setShowPassword] = useState(false);

	const [widgetId, setWidgetId] = useState<string | null>(null);
	const [_captchaToken, setCaptchaToken] = useState<string | null>(null);
	const widgetRef = useRef<HTMLDivElement | null>(null);
	const tokenResolverRef = useRef<((t: string) => void) | null>(null);

	const { data: session, status } = useSession();
	useEffect(() => {
		if (session) {
			// Lógica que não expõe os dados da sessão
		}
	}, [session]);
	const router = useRouter();

	useEffect(() => {
		const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		if (!siteKey) {
			return;
		}
		const existing = document.querySelector("script[data-turnstile]");
		if (existing) {
			return;
		}
		const s = document.createElement("script");
		s.src =
			"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
		s.async = true;
		s.defer = true;
		s.setAttribute("data-turnstile", "true");
		document.head.appendChild(s);
	}, []);

	useEffect(() => {
		const error = searchParams.get("error");
		if (error === "OAuthAccountNotLinked") {
			setMessage(
				"Este e-mail já está cadastrado. Faça login com o método original ou use outro e-mail para o Google."
			);
		} else if (error) {
			// Handle other potential errors from URL if necessary
			setMessage("Ocorreu um erro. Tente novamente.");
		}

		if (status === "authenticated") {
			router.replace("/studio");
		}
	}, [status, router, searchParams]);

	if (status === "loading") {
		return <LoadingPage />;
	}

	const waitForTurnstile = () => {
		return new Promise<void>((resolve) => {
			const w = window as unknown as { turnstile?: any };
			if (w.turnstile) {
				resolve();
				return;
			}
			const i = setInterval(() => {
				if (w.turnstile) {
					clearInterval(i);
					resolve();
				}
			}, 50);
		});
	};

	const renderTurnstile = async () => {
		const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		if (!siteKey) {
			return null;
		}
		await waitForTurnstile();
		const w = window as unknown as { turnstile?: any };
		if (!widgetRef.current) {
			return null;
		}
		if (widgetId) {
			return widgetId;
		}
		const id = w.turnstile.render(widgetRef.current, {
			sitekey: siteKey,
			size: "invisible",
			callback: (token: string) => {
				setCaptchaToken(token);
				if (tokenResolverRef.current) {
					tokenResolverRef.current(token);
					tokenResolverRef.current = null;
				}
			},
		});
		setWidgetId(id);
		return id;
	};

	const getCaptchaToken = async (): Promise<string | null> => {
		const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		if (!siteKey) {
			return null;
		}
		const w = window as unknown as { turnstile?: any };
		const id = widgetId || (await renderTurnstile());
		if (!id) {
			return null;
		}
		const existing = w.turnstile.getResponse(id);
		if (existing) {
			return existing;
		}
		const p = new Promise<string>((resolve) => {
			tokenResolverRef.current = resolve;
		});
		w.turnstile.execute(id);
		const t = await p;
		return t;
	};

	const onSubmit = async (data: FormData) => {
		setLoading(true);
		setMessage("");

		try {
			const token = await getCaptchaToken();
			const payload: Record<string, string> = {
				login: data.login,
				password: data.password,
			};
			if (token) {
				payload.captchaToken = token;
			}
			const result = await signIn("credentials", {
				...payload,
				redirect: false,
			});

			if (result?.error) {
				setMessage("Credenciais inválidas. Tente novamente.");
			} else {
				router.replace("/studio/perfil");
			}
		} catch {
			setMessage("Ocorreu um erro durante o login");
		} finally {
			setLoading(false);
		}
	};

	const canSubmit = () => {
		const loginVal = watch("login") ?? "";
		const passVal = watch("password") ?? "";
		return loginVal.length >= 3 && passVal.length >= 9 && !loading;
	};

	return (
		<div className="flex min-h-dvh">
			{/* Lado esquerdo - Formulário */}
			<div className="flex flex-1 items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-lg">
					<form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
						<div className="hidden" ref={widgetRef} />
						<div className="space-y-4 text-center">
							<h1 className="font-bold text-3xl text-black">
								Bem-vindo de volta!
							</h1>
							<p className="text-base text-muted-foreground">
								Acesse sua conta na Bionk.
							</p>
							{message && (
								<p className="rounded-md bg-red-50 p-3 text-red-600 text-sm">
									{message}
								</p>
							)}
						</div>

						<div className="space-y-5">
							<div>
								<Label className="mb-2 block text-base text-black">
									Email ou username
								</Label>
								<Input
									className="w-full rounded-md px-4 py-4 text-base focus-visible:border-lime-500"
									placeholder="Digite seu e-mail ou username"
									type="text"
									{...register("login")}
								/>
								{/* Espaço reservado para mensagem de erro do email */}
								<div className="mt-2 flex h-2 items-center">
									{errors.login && (
										<p className="text-red-600 text-sm transition-opacity duration-200">
											{errors.login.message}
										</p>
									)}
								</div>
							</div>

							<div>
								<Label className="mb-2 block text-base text-black">
									Sua senha
								</Label>
								<div className="relative">
									<Input
										className="w-full rounded-md px-4 py-4 text-base focus-visible:border-lime-500"
										placeholder="Digite sua senha"
										type={showPassword ? "text" : "password"}
										{...register("password")}
									/>
									<button
										className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-gray-700"
										onClick={() => setShowPassword(!showPassword)}
										type="button"
									>
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
								{/* Espaço reservado para mensagem de erro da senha */}
								<div className="-mb-4 mt-2 flex h-5 items-center">
									{errors.password && (
										<p className="text-red-600 text-sm transition-opacity duration-200">
											{errors.password.message}
										</p>
									)}
								</div>
							</div>

							<div className="text-left">
								<Link
									className="h-auto p-0 text-blue-500 text-sm hover:underline"
									href="/esqueci-senha"
								>
									Esqueceu a senha?
								</Link>
							</div>

							<div className="space-y-4">
								<BaseButton
									className="py-4 text-base"
									disabled={!canSubmit()}
									fullWidth
									loading={loading}
									type="submit"
								>
									Entrar
								</BaseButton>
							</div>

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
									Não possui uma conta?{" "}
									<Link
										className="font-medium text-blue-500 hover:underline"
										href={"/registro"}
									>
										Crie gratuitamente!
									</Link>
								</span>
							</div>
						</div>
					</form>
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
					src="/images/image-login.png"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex flex-col items-center justify-center gap-4 p-8 text-center text-white">
						<Image
							alt="Cosmic Background"
							className="object-contain"
							height={200}
							priority
							src="/images/bionk-name-white-logo.svg"
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

export default Login;

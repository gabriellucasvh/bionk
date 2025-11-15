"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { EmailForm } from "./EmailForm";

const emailSchema = z.object({
	email: z.string().email("E-mail inválido"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function PageRegistro() {
	const [loading, setLoading] = useState(false);
	const [captchaToken, setCaptchaToken] = useState<string | null>(null);
	const widgetRef = useRef<HTMLDivElement | null>(null);
	const [widgetId, setWidgetId] = useState<string | null>(null);
	const pendingTokenResolver = useRef<((t: string) => void) | null>(null);
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
		},
	});

	useEffect(() => {}, [widgetId]);

	const renderTurnstile = (): string | null => {
		const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		const w = window as unknown as { turnstile?: any };

		if (!siteKey) {
			return null;
		}
		if (!w.turnstile) {
			return null;
		}
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
				if (pendingTokenResolver.current) {
					pendingTokenResolver.current(token);
					pendingTokenResolver.current = null;
				}
			},
		});
		setWidgetId(id);
		return id;
	};

	const getCaptchaToken = async (): Promise<string | null> => {
		const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
		if (!siteKey) {
			return captchaToken;
		}
		const ready = await waitForTurnstile();
		if (!ready) {
			return null;
		}
		const w = window as unknown as { turnstile?: any };
		const id = widgetId ?? renderTurnstile();
		if (!id) {
			return null;
		}
		const existing = w.turnstile.getResponse(id);
		if (existing) {
			setCaptchaToken(existing);
			return existing;
		}
		return await new Promise<string | null>((resolve) => {
			pendingTokenResolver.current = (t: string) => resolve(t);
			w.turnstile.execute(id);
		});
	};

	const handleEmailSubmit: SubmitHandler<EmailFormData> = async (data) => {
		setLoading(true);
		setMessage(null);
		try {
			const tokenToSend = await getCaptchaToken();

			const payload: any = {
				email: data.email,
				stage: "request-otp",
			};

			if (tokenToSend) {
				payload.captchaToken = tokenToSend;
			}
			const response = await axios.post("/api/auth/register", payload);
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
			<Script
				async
				defer
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			/>
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
							<div className="hidden" ref={widgetRef} />
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
							alt="Bionk Logo"
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
const waitForTurnstile = async (timeout = 8000): Promise<boolean> => {
	return await new Promise((resolve) => {
		const start = Date.now();
		const timer = setInterval(() => {
			const w = window as unknown as { turnstile?: any };
			if (w.turnstile) {
				clearInterval(timer);
				resolve(true);
			} else if (Date.now() - start >= timeout) {
				clearInterval(timer);
				resolve(false);
			}
		}, 50);
	});
};

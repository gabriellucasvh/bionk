// src/app/(public)/reset-password/[token]/formulario-reset.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeLocale } from "@/lib/i18n";

// Define the form schema
const schema = z
	.object({
		password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"], // Apply error to confirmPassword field
	});

// Infer the TypeScript type from the schema
type FormData = z.infer<typeof schema>;

interface ResetPasswordFormProps {
	token: string;
	locale: "pt-br" | "en" | "es";
}

export default function ResetPasswordForm({
	token,
	locale,
}: ResetPasswordFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({ resolver: zodResolver(schema) });

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();

	const dict = require(
		`@/dictionaries/public/${normalizeLocale(locale)}/reset-token.ts`
	).default;

	const onSubmit = async (data: FormData) => {
		setLoading(true);
		setMessage("");
		setIsSuccess(false);

		try {
			const response = await axios.post("/api/auth/reset-password", {
				token,
				password: data.password,
			});
			setMessage(response.data.message || "Senha redefinida com sucesso!");
			setIsSuccess(true);
			// Redirect to login after a short delay
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (error) {
			setIsSuccess(false);
			if (error instanceof AxiosError) {
				setMessage(error.response?.data?.error || "Erro ao redefinir a senha.");
			} else {
				setMessage("Ocorreu um erro inesperado.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<article className="w-full max-w-md rounded-lg border-lime-500 bg-white p-8 md:border">
			<div className="mb-6 space-y-2 text-center">
				<h2 className="text-center font-bold text-2xl text-black">
					{dict.title}
				</h2>
				<p className="text-muted-foreground">{dict.subtitle}</p>
			</div>
			<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
				<div>
					<Label className="block font-semibold text-base text-black">
						{dict.newPassword}
					</Label>
					<div className="relative">
						<Input
							className="w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
							placeholder={dict.newPasswordPlaceholder}
							type={showPassword ? "text" : "password"}
							{...register("password")}
							disabled={loading || isSuccess}
						/>
						<button
							className="absolute inset-y-0 right-0 px-4 text-gray-500"
							disabled={loading || isSuccess}
							onClick={() => setShowPassword(!showPassword)}
							type="button"
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{errors.password && (
						<p className="mt-1 text-red-600 text-sm">
							{errors.password.message}
						</p>
					)}
				</div>

				<div>
					<Label className="block font-semibold text-base text-black">
						{dict.confirmNew}
					</Label>
					<div className="relative">
						<Input
							className="w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
							placeholder={dict.confirmNewPlaceholder}
							type={showConfirmPassword ? "text" : "password"}
							{...register("confirmPassword")}
							disabled={loading || isSuccess}
						/>
						<button
							className="absolute inset-y-0 right-0 px-4 text-gray-500"
							disabled={loading || isSuccess}
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							type="button"
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{errors.confirmPassword && (
						<p className="mt-1 text-red-600 text-sm">
							{errors.confirmPassword.message}
						</p>
					)}
				</div>

				<Button
					className="w-full rounded-md bg-green-500 px-6 py-3 font-bold text-lg text-white transition-colors duration-300 hover:bg-green-600 disabled:opacity-50"
					disabled={loading || isSuccess}
					type="submit"
				>
					{loading ? dict.redefining : dict.submit}
				</Button>

				{message && (
					<div
						className={`mt-4 rounded-md p-3 text-center font-medium text-sm ${isSuccess ? "border border-green-400 bg-green-100 text-green-800" : "border border-red-400 bg-red-100 text-red-800"}`}
					>
						{message}
						{isSuccess && (
							<p className="mt-1 text-xs">{dict.successRedirect}</p>
						)}
					</div>
				)}
			</form>
		</article>
	);
}

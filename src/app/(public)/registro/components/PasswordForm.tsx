"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFormData {
	name: string;
	password: string;
	confirmPassword: string;
}

interface PasswordFormProps {
	form: UseFormReturn<PasswordFormData>;
	onSubmit: (data: PasswordFormData) => void;
	loading: boolean;
	onBackToOtp?: () => void;
}

export function PasswordForm({ form, onSubmit, loading }: PasswordFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<form
			className="space-y-4"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<div>
				<Label className="block font-semibold text-base text-black">
					Seu nome
				</Label>
				<div className="mt-1">
					<Input
						className="mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
						placeholder="Digite seu nome de exibição"
						type="text"
						{...form.register("name")}
						disabled={loading}
					/>
				</div>
				{form.formState.errors.name && (
					<p className="text-red-600 text-sm">
						{form.formState.errors.name.message}
					</p>
				)}
			</div>
			<div>
				<Label className="block font-semibold text-base text-black">
					Sua senha
				</Label>
				<div className="relative mt-1">
					<Input
						className="mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
						placeholder="Digite sua senha"
						type={showPassword ? "text" : "password"}
						{...form.register("password")}
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
				{form.formState.errors.password && (
					<p className="text-red-600 text-sm">
						{form.formState.errors.password.message}
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
						{...form.register("confirmPassword")}
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
				{form.formState.errors.confirmPassword && (
					<p className="text-red-600 text-sm">
						{form.formState.errors.confirmPassword.message}
					</p>
				)}
			</div>
			<BaseButton className="w-full" loading={loading} type="submit">
				Criar Conta
			</BaseButton>
		</form>
	);
}

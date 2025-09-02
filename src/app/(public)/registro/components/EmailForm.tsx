"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFormData {
	email: string;
}

interface EmailFormProps {
	form: UseFormReturn<EmailFormData>;
	onSubmit: (data: EmailFormData) => void;
	loading: boolean;
}

export function EmailForm({ form, onSubmit, loading }: EmailFormProps) {
	return (
		<form
			className="space-y-6"
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<div>
				<Label className="mb-2 block font-semibold text-base text-black">
					Seu email
				</Label>
				<Input
					className="w-full rounded-md border px-4 py-4 text-base transition-colors duration-400 focus-visible:border-lime-500"
					placeholder="Digite seu e-mail"
					type="email"
					{...form.register("email")}
					disabled={loading}
				/>
				{form.formState.errors.email && (
					<p className="mt-2 text-red-600 text-sm">
						{form.formState.errors.email.message}
					</p>
				)}
			</div>
			<div className="mt-6">
				<p className="text-center text-gray-500 text-sm">
					Ao continuar, você aceita os nossos{" "}
					<Link
						className="underline hover:text-gray-700"
						href="/termos"
					>
						Termos e Condições
					</Link>{" "}
					e a nossa{" "}
					<Link
						className="underline hover:text-gray-700"
						href="/privacidade"
					>
						Política de Privacidade
					</Link>
					.
				</p>
			</div>
			<BaseButton
				className="w-full py-4 text-base"
				loading={loading}
				type="submit"
			>
				Continuar
			</BaseButton>
		</form>
	);
}
"use client";

import type { UseFormReturn } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Label } from "@/components/ui/label";

interface OtpFormData {
	otp: string;
}

interface OtpFormProps {
	form: UseFormReturn<OtpFormData>;
	onSubmit: (data: OtpFormData) => void;
	onResendOtp: () => void;
	onBackToEmail: () => void;
	loading: boolean;
	otpTimer: number;
	otpCooldownTimer: number;
	isOtpInputDisabled: boolean;
	remainingAttempts?: number;
}

export function OtpForm({
	form,
	onSubmit,
	onResendOtp,
	onBackToEmail,
	loading,
	otpTimer,
	otpCooldownTimer,
	isOtpInputDisabled,
	remainingAttempts,
}: OtpFormProps) {
	return (
		<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
			<div>
				<Label className="mb-2 block font-semibold text-base text-black">
					Código de Verificação
					{otpTimer > 0 && (
						<span className="ml-2 font-normal text-gray-600 text-sm">
							({Math.floor(otpTimer / 60)}:
							{(otpTimer % 60).toString().padStart(2, "0")})
						</span>
					)}
				</Label>
				<input
					className="w-full rounded-md border px-4 py-10 text-center text-xl tracking-[0.3em] transition-colors duration-400 focus-visible:border-lime-500 md:text-5xl"
					maxLength={6}
					placeholder="------"
					type="text"
					{...form.register("otp")}
					disabled={
						loading ||
						isOtpInputDisabled ||
						otpTimer === 0 ||
						otpCooldownTimer > 0
					}
				/>
				{form.formState.errors.otp && (
					<p className="mt-2 text-red-600 text-sm">
						{form.formState.errors.otp.message}
					</p>
				)}

				{/* Feedback de tentativas restantes */}
				{remainingAttempts !== undefined &&
					remainingAttempts < 5 &&
					remainingAttempts > 0 && (
						<div className="mt-2 ">
							<p className="text-sm text-yellow-600">
								Código incorreto. Você tem {remainingAttempts} tentativa
								{remainingAttempts !== 1 ? "s" : ""} restante
								{remainingAttempts !== 1 ? "s" : ""}.
							</p>
						</div>
					)}

				{/* Feedback de bloqueio */}
				{otpCooldownTimer > 0 && (
					<div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
						<p className="text-red-700 text-sm">
							🚫 Muitas tentativas incorretas. Aguarde{" "}
							{Math.floor(otpCooldownTimer / 60)}:
							{(otpCooldownTimer % 60).toString().padStart(2, "0")} para tentar
							novamente.
						</p>
					</div>
				)}

				{/* Feedback de expiração */}
				{otpTimer === 0 && otpCooldownTimer === 0 && (
					<div className="mt-2">
						<p className="text-gray-700 text-sm">
							Código expirado. Solicite um novo código para continuar.
						</p>
					</div>
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
					onClick={onBackToEmail}
					type="button"
					variant="white"
				>
					Usar outro e-mail
				</BaseButton>
				{(otpTimer === 0 || otpCooldownTimer > 0 || isOtpInputDisabled) && (
					<BaseButton
						className="rounded-md px-4 py-2"
						loading={loading || (otpCooldownTimer > 0 && otpTimer > 0)}
						onClick={onResendOtp}
						type="button"
						variant="white"
					>
						Solicitar novo código
					</BaseButton>
				)}
			</div>
		</form>
	);
}

"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Label } from "@/components/ui/label";
import OTPInputCustom from "@/components/ui/otp-input-custom";

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
	const otpValue = (useWatch({ control: form.control, name: "otp" }) ??
		"") as string;
	const isOtpEmpty = otpValue.replace(/\D/g, "").length === 0;
	return (
		<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
			<div>
				<Label className="mb-2 block font-semibold text-base text-black">
					Código de Verificação
				</Label>
				<div className="flex justify-center">
					<OTPInputCustom
						aria-label="Código de verificação"
						autoFocus={!(loading || isOtpInputDisabled) && otpTimer > 0}
						disabled={loading || isOtpInputDisabled || otpTimer === 0}
						onChange={(value) =>
							form.setValue("otp", value, {
								shouldValidate: true,
								shouldDirty: true,
							})
						}
						value={otpValue}
					/>
				</div>
				{/* Mensagem de erro removida conforme solicitado */}

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

				{/* Removido: mensagem de bloqueio global. Contagem agora vai no botão de reenvio */}

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
				disabled={
					loading ||
					isOtpInputDisabled ||
					otpTimer === 0 ||
					otpCooldownTimer > 0 ||
					isOtpEmpty
				}
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
				<BaseButton
					className="rounded-md px-4 py-2"
					disabled={loading || otpCooldownTimer > 0}
					loading={loading}
					onClick={onResendOtp}
					type="button"
					variant="white"
				>
					{otpCooldownTimer > 0
						? `Reenviar código em ${otpCooldownTimer}s`
						: "Reenviar código"}
				</BaseButton>
			</div>
		</form>
	);
}

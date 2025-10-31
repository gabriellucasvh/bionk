"use client";

import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REJEX_UPPERCASE = /[A-Z]/;
const REJEX_LOWERCASE = /[a-z]/;
const REJEX_DIGIT = /\d/;
const REJEX_SEQ = /(123456|abcdef|qwerty|zxcvbn|012345)/i;
const REJEX_REPEAT = /(.)\1{3,}/;
const REJEX_SPECIAL_RECOMMENDED = /[^A-Za-z0-9]/;

interface CompletionFormData {
	username: string;
	password: string;
}

interface CompletionFormProps {
	form: UseFormReturn<CompletionFormData>;
	onSubmit: (data: CompletionFormData) => void;
	loading: boolean;
	onBackToOtp?: () => void;
}

export function CompletionForm({
	form,
	onSubmit,
	loading,
}: CompletionFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const [usernameStatus, setUsernameStatus] = useState<{
		type: "idle" | "checking" | "available" | "taken" | "error";
		message?: string;
	}>({ type: "idle" });
	const [isTyping, setIsTyping] = useState(false);
	const [usernameCheckTimeout, setUsernameCheckTimeout] =
		useState<NodeJS.Timeout | null>(null);
	const [lastCheckedUsername, setLastCheckedUsername] = useState<string>("");

	const checkUsernameAvailability = async (username: string) => {
		if (!username || username.length < 3) {
			setUsernameStatus({ type: "idle" });
			return;
		}
		if (
			username === lastCheckedUsername &&
			(usernameStatus.type === "available" || usernameStatus.type === "taken")
		) {
			return;
		}
		setUsernameStatus({ type: "checking" });
		try {
			const response = await axios.get(
				`/api/auth/check-username?username=${encodeURIComponent(username)}`
			);
			if (response.data.available) {
				setUsernameStatus({
					type: "available",
					message: "Username disponível!",
				});
			} else {
				setUsernameStatus({ type: "taken", message: "Username indisponível" });
			}
			setLastCheckedUsername(username);
		} catch {
			setUsernameStatus({
				type: "error",
				message: "Erro ao verificar username",
			});
		}
	};

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
		form.setValue("username", value, { shouldValidate: true });
		setIsTyping(true);
		setUsernameStatus({ type: "idle" });
		if (usernameCheckTimeout) {
			clearTimeout(usernameCheckTimeout);
		}
		const timeout = setTimeout(() => {
			setIsTyping(false);
			checkUsernameAvailability(value);
		}, 600);
		setUsernameCheckTimeout(timeout);
	};

	const handleUsernameBlur = () => {
		const value = (form.getValues().username || "").toLowerCase().trim();
		if (!value) {
			return;
		}
		if (usernameCheckTimeout) {
			clearTimeout(usernameCheckTimeout);
			setUsernameCheckTimeout(null);
		}
		setIsTyping(false);
		checkUsernameAvailability(value);
	};

	const canSubmit = () => {
		const hasErrors = Object.keys(form.formState.errors).length > 0;
		const usernamePresent = !!form.watch("username");
		const usernameOk = usernameStatus.type === "available";
		const pwd = form.watch("password") || "";
		const pwdOk =
			pwd.length >= 9 &&
			pwd.length <= 64 &&
			REJEX_UPPERCASE.test(pwd) &&
			REJEX_LOWERCASE.test(pwd) &&
			REJEX_DIGIT.test(pwd) &&
			!REJEX_SEQ.test(pwd) &&
			!REJEX_REPEAT.test(pwd);
		return (
			!hasErrors &&
			usernamePresent &&
			usernameOk &&
			pwdOk &&
			!loading &&
			!isTyping
		);
	};

	const passwordStrength = (() => {
		const pwd = form.watch("password") || "";
		const required = [
			pwd.length >= 9,
			REJEX_UPPERCASE.test(pwd),
			REJEX_LOWERCASE.test(pwd),
			REJEX_DIGIT.test(pwd),
		];
		const met = required.filter(Boolean).length;
		const value = Math.round((met / 4) * 100);
		const label = met <= 1 ? "Fraca" : met <= 3 ? "Média" : "Forte";
		const color =
			met <= 1 ? "bg-red-500" : met <= 3 ? "bg-yellow-500" : "bg-green-500";
		return { value, label, color };
	})();

	const pwd = form.watch("password") || "";
	const reqs = {
		lenMin: pwd.length >= 9,
		lenMax: pwd.length <= 64 || pwd.length === 0,
		upper: REJEX_UPPERCASE.test(pwd),
		lower: REJEX_LOWERCASE.test(pwd),
		digit: REJEX_DIGIT.test(pwd),
		seq: !REJEX_SEQ.test(pwd),
		repeat: !REJEX_REPEAT.test(pwd),
		specialRecommended: REJEX_SPECIAL_RECOMMENDED.test(pwd),
	};

	return (
		<form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
			<div>
				<Label className="block font-semibold text-base text-black">
					Escolha seu username
				</Label>
				<div className="relative w-full">
					<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 text-gray-500">
						bionk.me/
					</span>
					<Input
						className={`w-full border px-4 py-3 pl-[100px] transition-colors duration-400 focus-visible:border-lime-500 ${(() => {
							if (usernameStatus.type === "available") {
								return "border-green-500";
							}
							if (
								usernameStatus.type === "taken" ||
								usernameStatus.type === "error"
							) {
								return "border-red-500";
							}
							return "";
						})()} `}
						disabled={loading}
						maxLength={30}
						onBlur={handleUsernameBlur}
						onChange={handleUsernameChange}
						placeholder="seuUsername"
						type="text"
						value={form.watch("username") || ""}
					/>
				</div>
				<div className="mt-1 flex h-5 items-center">
					{!isTyping && form.formState.errors.username && (
						<p className="text-red-600 text-sm">
							{form.formState.errors.username.message}
						</p>
					)}
					{!(isTyping || form.formState.errors.username) &&
						usernameStatus.message && (
							<p
								className={`text-sm ${usernameStatus.type === "available" ? "text-green-600" : "text-red-600"}`}
							>
								{usernameStatus.message}
							</p>
						)}
				</div>
			</div>

			<div>
				<Label className="block font-semibold text-base text-black">
					Sua senha
				</Label>
				<div className="relative mt-1">
					<Input
						className="mb-1 w-full rounded-md border px-4 py-3 transition-colors duration-400 focus-visible:border-lime-500"
						maxLength={64}
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
						{showPassword ? (
							<EyeOff className="h-5 w-5" />
						) : (
							<Eye className="h-5 w-5" />
						)}
					</button>
				</div>
				<div className="mt-2 flex items-center gap-3">
					<div className="relative h-2 w-full overflow-hidden rounded bg-gray-200">
						<div
							className={`h-2 ${passwordStrength.color}`}
							style={{ width: `${passwordStrength.value}%` }}
						/>
					</div>
					<span className="text-gray-600 text-sm">
						{passwordStrength.label}
					</span>
				</div>
				<ul className="mt-2 space-y-1 text-xs">
					<li className={reqs.lenMin ? "text-green-600" : "text-red-600"}>
						Mínimo 9 caracteres
					</li>
					<li className={reqs.upper ? "text-green-600" : "text-red-600"}>
						Pelo menos 1 letra maiúscula
					</li>
					<li className={reqs.lower ? "text-green-600" : "text-red-600"}>
						Pelo menos 1 letra minúscula
					</li>
					<li className={reqs.digit ? "text-green-600" : "text-red-600"}>
						Pelo menos 1 número
					</li>
				</ul>
				{form.formState.errors.password && (
					<p className="text-red-600 text-sm">
						{form.formState.errors.password.message}
					</p>
				)}
			</div>

			<div className="flex items-center justify-between">
				<div />
				<div className="flex w-full gap-2">
					<BaseButton
						className="py-3"
						disabled={!canSubmit()}
						fullWidth
						loading={loading}
						type="submit"
					>
						Concluir
					</BaseButton>
				</div>
			</div>
		</form>
	);
}

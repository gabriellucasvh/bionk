"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";

import CustomLinksForm from "./components/CustomLinksForm";
import SocialLinksSelector from "./components/SocialLinksSelector";
import TemplateSelector from "./components/TemplateSelector";
import UserTypeSelector from "./components/UserTypeSelector";

const REGEX_USERNAME = /^[a-z0-9._]{3,30}$/;

interface OnboardingPageProps {
	onComplete: (data: OnboardingData) => void;
	user?: {
		id: string;
		username?: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		isCredentialsUser?: boolean;
		googleId?: string;
		onboardingCompleted?: boolean;
		provider?: string;
		status?: string;
	};
	initialData?: {
		name?: string;
		username?: string;
		image?: string;
	};
	loading?: boolean;
	error?: string | null;
	isLoading?: boolean;
}

export interface OnboardingData {
	userType: string;
	socialLinks: { platform: string; username: string }[];
	customLinks: { title: string; url: string }[];
	name: string;
	username: string;
	bio: string;
	profileImage?: File;
	template: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
	{
		id: 1,
		title: "Tipo de Usuário",
		description: "Selecione como você pretende usar a plataforma",
	},
	{
		id: 2,
		title: "Templates",
		description: "Selecione um visual para sua página",
	},
	{
		id: 3,
		title: "Redes Sociais",
		description: "Adicione suas redes com usuário",
	},
	{
		id: 4,
		title: "Links Personalizados",
		description: "Adicione links com título e URL",
	},
	{
		id: 5,
		title: "Perfil",
		description: "Adicione foto, nome e bio",
	},
	{
		id: 6,
		title: "Finalização",
		description: "Tudo pronto. Revise e conclua",
	},
];

export default function OnboardingPageComponent({
	onComplete,
	initialData,
	user,
	loading = false,
}: OnboardingPageProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [currentStep, setCurrentStep] = useState<Step>(1);
	const [data, setData] = useState({
		userType: "",
		socialLinks: [] as { platform: string; username: string }[],
		customLinks: [] as { title: string; url: string }[],
		name: initialData?.name || "",
		username: initialData?.username?.startsWith("temp_")
			? ""
			: initialData?.username || "",
		bio: "",
		template: "",
	});
	const [profilePreview, setProfilePreview] = useState<string>(
		"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		null
	);
	const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
	const [usernameValidation, setUsernameValidation] = useState({
		isValid: true,
		message: "",
		isChecking: false,
	});
	const isGoogleUser =
		user?.provider === "google" ||
		Boolean(user?.googleId) ||
		user?.status === "pending" ||
		user?.isCredentialsUser === false ||
		(user?.username?.startsWith("temp_") ?? false) ||
		(initialData?.username?.startsWith("temp_") ?? false);

	// Configurar imagem inicial
	useEffect(() => {
		setProfilePreview(
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
		);
	}, []);

	// Debounce timer ref and abort controller for API requests
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const usernameInputRef = useRef<HTMLInputElement | null>(null);

	// Cleanup timer and abort controller on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	useEffect(() => {
		if (
			isGoogleUser &&
			currentStep === 5 &&
			(!data.username || data.username.startsWith("temp_")) &&
			usernameInputRef.current
		) {
			usernameInputRef.current.focus();
		}
	}, [isGoogleUser, currentStep, data.username]);

	const validateUsername = useCallback((username: string) => {
		// Clear previous timer and abort any ongoing request
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		if (!username.trim()) {
			setUsernameValidation({
				isValid: true,
				message: "",
				isChecking: false,
			});
			return;
		}

		// Check blacklist first - this has priority over everything
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			setUsernameValidation({
				isValid: false,
				message: "Este nome de usuário não está disponível",
				isChecking: false,
			});
			return;
		}

		// Validate allowed characters and length (3-30)
		const pattern = REGEX_USERNAME;
		if (!pattern.test(username)) {
			setUsernameValidation({
				isValid: false,
				message:
					"Nome de usuário deve conter apenas letras minúsculas, números, pontos(.) e underscores(_)",
				isChecking: false,
			});
			return;
		}

		// Set checking state immediately for valid input
		setUsernameValidation({ isValid: true, message: "", isChecking: true });

		// Debounce API call
		debounceTimerRef.current = setTimeout(async () => {
			// Create new abort controller for this request
			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				// Double-check blacklist before making API call (race condition protection)
				if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
					setUsernameValidation({
						isValid: false,
						message: "Este nome de usuário não está disponível",
						isChecking: false,
					});
					return;
				}

				const response = await fetch(
					`/api/auth/check-username?username=${encodeURIComponent(username)}`,
					{ signal: controller.signal }
				);
				const result = await response.json();

				// Final blacklist check before setting result (ultimate protection)
				if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
					setUsernameValidation({
						isValid: false,
						message: "Este nome de usuário não está disponível",
						isChecking: false,
					});
					return;
				}

				if (result.available) {
					setUsernameValidation({
						isValid: true,
						message: "Nome de usuário disponível",
						isChecking: false,
					});
				} else {
					setUsernameValidation({
						isValid: false,
						message: "Nome de usuário indisponível",
						isChecking: false,
					});
				}
			} catch (error) {
				// Don't show error if request was aborted (user typed something else)
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}
				setUsernameValidation({
					isValid: false,
					message: "Erro ao verificar disponibilidade",
					isChecking: false,
				});
			}
		}, 500);
	}, []);

	const handleUsernameChange = (value: string) => {
		const sanitized = value.replace(/[^a-zA-Z0-9._]/g, "").toLowerCase();
		if (sanitized === data.username) {
			return;
		}
		setData({ ...data, username: sanitized });
		if (sanitized) {
			validateUsername(sanitized);
		} else {
			setUsernameValidation({ isValid: false, message: "", isChecking: false });
		}
	};

	const handleProfileImageSave = (imageFile: File) => {
		const previewUrl = URL.createObjectURL(imageFile);
		setProfilePreview(previewUrl);
		setSelectedProfileFile(imageFile);
	};

	const canProceedToNext = () => {
		switch (currentStep) {
			case 1: {
				return data.userType.trim().length > 0;
			}
			case 2: {
				return true;
			}
			case 3: {
				return true;
			}
			case 4: {
				return true;
			}
			case 5: {
				const hasName = data.name.trim().length > 0;
				if (!isGoogleUser) {
					return hasName;
				}
				const hasValidUsername =
					data.username.trim().length > 0 &&
					usernameValidation.isValid &&
					!usernameValidation.isChecking;
				return hasName && hasValidUsername;
			}
			case 6: {
				return true;
			}
			default: {
				return false;
			}
		}
	};

	const handleNext = () => {
		if (currentStep < (STEPS.length as Step)) {
			setCurrentStep((prev) => (prev + 1) as Step);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as Step);
		}
	};

	const handleComplete = () => {
		if (isSubmitting) {
			return;
		}
		setIsSubmitting(true);
		onComplete({
			...data,
			profileImage: selectedProfileFile || undefined,
		});
		// Fallback: if parent doesn't toggle loading, re-enable after a delay
		setTimeout(() => setIsSubmitting(false), 5000);
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step1"
						transition={{ duration: 0.3 }}
					>
						<UserTypeSelector
							onSelect={(v) => setData({ ...data, userType: v })}
							selected={data.userType}
						/>
					</motion.div>
				);

			case 2:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step2"
						transition={{ duration: 0.3 }}
					>
						<Label>Templates</Label>

						<TemplateSelector
							onSelect={(id) => setData({ ...data, template: id })}
							selectedTemplateId={data.template}
						/>
						<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20">
							<div className="bg-gradient-to-t from-white/90 to-white/0 px-4 py-3 dark:from-gray-900/90 dark:to-gray-900/0">
								<div className="pointer-events-auto mx-auto flex w-full justify-between lg:max-w-1/2">
									<BaseButton onClick={handlePrevious} variant="white">
										Voltar
									</BaseButton>
									<BaseButton onClick={handleNext}>Continuar</BaseButton>
								</div>
							</div>
						</div>
					</motion.div>
				);

			case 3:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step3"
						transition={{ duration: 0.3 }}
					>
						<SocialLinksSelector
							onChange={(v) => setData({ ...data, socialLinks: v })}
							value={data.socialLinks}
						/>
					</motion.div>
				);

			case 4:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step4"
						transition={{ duration: 0.3 }}
					>
						<CustomLinksForm
							onChange={(v) => setData({ ...data, customLinks: v })}
							value={data.customLinks}
						/>
					</motion.div>
				);

			case 5:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-6"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step5"
						transition={{ duration: 0.3 }}
					>
						<div className="flex flex-col items-center space-y-2">
							<div className="relative">
								<div className="h-24 w-24 overflow-hidden rounded-full bg-muted shadow-lg">
									<Image
										alt="Foto de perfil"
										className="h-full w-full object-cover"
										height={160}
										key={profilePreview}
										priority
										quality={95}
										src={profilePreview}
										width={160}
									/>
								</div>
								<BaseButton
									className="absolute right-0 bottom-0 rounded-full"
									onClick={() => setIsImageCropModalOpen(true)}
									size="icon"
									variant="white"
								>
									<Edit className="h-4 w-4" />
								</BaseButton>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Nome de exibição *</Label>
							<Input
								className="py-3"
								id="name"
								maxLength={44}
								onChange={(e) => setData({ ...data, name: e.target.value })}
								placeholder="Seu nome"
								value={data.name}
							/>
							<p className="text-muted-foreground text-xs">
								{data.name.length}/44 caracteres
							</p>
						</div>
						{isGoogleUser && (
							<div className="space-y-2">
								<Label htmlFor="username">Nome de usuário *</Label>
								<div className="relative flex items-center space-x-2">
									<span className="text-muted-foreground text-sm">
										bionk.me/
									</span>
									<div className="relative flex-1">
										<Input
											className={`flex-1 py-3 pr-8 ring ring-zinc-400 ${usernameValidation.isValid ? "" : "border-red-500"}`}
											id="username"
											maxLength={30}
											onChange={(e) => handleUsernameChange(e.target.value)}
											placeholder="seuusername"
											ref={usernameInputRef}
											value={data.username}
										/>
										{usernameValidation.isChecking && (
											<span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-2">
												<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<p
										className={`text-xs ${usernameValidation.isValid ? "text-green-600" : "text-red-500"}`}
									>
										{usernameValidation.message}
									</p>
									<p className="text-muted-foreground text-xs">
										{data.username.length}/30 caracteres
									</p>
								</div>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="bio">Biografia</Label>
							<Textarea
								className="resize-none text-base"
								id="bio"
								maxLength={150}
								onChange={(e) => setData({ ...data, bio: e.target.value })}
								placeholder="Conte um pouco sobre você..."
								rows={4}
								value={data.bio}
							/>
							<p className="text-muted-foreground text-xs">
								{data.bio.length}/150 caracteres
							</p>
						</div>
					</motion.div>
				);

			case 6:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="space-y-4"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step6"
						transition={{ duration: 0.3 }}
					>
						<div className="text-center">
							<Image
								alt="Bionk Logo"
								className="mx-auto mb-5 h-14 w-auto"
								height={28}
								priority
								src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
								width={110}
							/>
							<h2 className="mb-2 font-bold text-2xl">Tudo pronto!</h2>
							<p className="mx-auto max-w-md text-muted-foreground">
								Cadastro concluído com sucesso! Que bom ter você aqui. Estamos
								animados para acompanhar o que você vai criar a partir de agora.
							</p>
						</div>
					</motion.div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center bg-white p-6 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full md:max-w-3xl">
				{currentStep === 1 && (
					<div className="mb-8 text-center">
						<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
							Bem-vindo ao Bionk!
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							Vamos configurar seu perfil em alguns passos
						</p>
					</div>
				)}

				{currentStep !== 6 && (
					<div className="mb-8">
						<div className="mb-2 flex items-center justify-between">
							<span className="font-medium text-gray-700 text-sm dark:text-gray-300">
								{STEPS[currentStep - 1].title}
							</span>
						</div>
						<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div
								className="h-2 rounded-full bg-lime-400 transition-all duration-300"
								style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
							/>
						</div>
						<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
							{STEPS[currentStep - 1].description}
						</p>
					</div>
				)}

				{/* Content */}
				<div className="mb-6 bg-white py-4 dark:bg-gray-800">
					<AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
				</div>

				{/* Navigation */}
				{currentStep !== 2 && (
					<div className="flex items-center justify-between">
						{currentStep > 1 ? (
							<BaseButton
								className="flex items-center gap-2"
								onClick={handlePrevious}
								variant="white"
							>
								Voltar
							</BaseButton>
						) : (
							<div />
						)}

						{currentStep < STEPS.length ? (
							<BaseButton
								className="flex items-center gap-2"
								disabled={!canProceedToNext()}
								onClick={handleNext}
							>
								Continuar
							</BaseButton>
						) : (
							<BaseButton
								className="flex items-center gap-2"
								disabled={loading || isSubmitting || !canProceedToNext()}
								onClick={handleComplete}
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Check className="h-4 w-4" />
								)}
								Concluir e ir para o Studio
							</BaseButton>
						)}
					</div>
				)}
			</div>

			{/* Image Crop Modal */}
			<ProfileImageCropModal
				isOpen={isImageCropModalOpen}
				onClose={() => setIsImageCropModalOpen(false)}
				onImageSave={handleProfileImageSave}
			/>
		</div>
	);
}

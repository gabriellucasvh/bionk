"use client";

import {
	Check,
	PencilSimple,
	SpinnerGap,
} from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import {
	getUsernameFormatError,
	isValidUsernameFormat,
	normalizeUsernameForLookup,
	sanitizeUsername,
} from "@/utils/username";
import CustomLinksForm from "./components/CustomLinksForm";
import SocialLinksSelector from "./components/SocialLinksSelector";
import TemplateSelector from "./components/TemplateSelector";
import UserTypeSelector from "./components/UserTypeSelector";

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
	requireUsername?: boolean;
	hideStep6?: boolean;
	onCancel?: () => void;
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
		title: "Qual o seu objetivo?",
		description: "Nos conte como vai usar o Bionk para personalizarmos sua jornada.",
	},
	{
		id: 2,
		title: "Escolha seu estilo",
		description: "Qual visual tem mais a sua cara? Não se preocupe, você pode mudar depois.",
	},
	{
		id: 3,
		title: "Sua presença digital",
		description: "Selecione as redes sociais onde o seu público pode te encontrar.",
	},
	{
		id: 4,
		title: "Conecte seus links",
		description: "Adicione os links mais importantes e centralize tudo em um só lugar.",
	},
	{
		id: 5,
		title: "Quase lá! Seu perfil",
		description: "Mostre ao mundo quem você é com uma foto legal e uma bio que marque.",
	},
	{
		id: 6,
		title: "Tudo pronto!",
		description: "Estamos preparando o seu espaço exclusivo.",
	},
];

export default function OnboardingPageComponent({
	onComplete,
	initialData,
	user,
	loading = false,
	requireUsername = false,
	hideStep6 = false,
	onCancel,
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
	const [isTypingUsername, setIsTypingUsername] = useState(false);
	const isGoogleUser =
		requireUsername ||
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
	const lastUsernameRequestedRef = useRef<string>("");

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
			setIsTypingUsername(false);
			return;
		}

		// Check blacklist first - this has priority over everything
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			setUsernameValidation({
				isValid: false,
				message: "Este nome de usuário não está disponível",
				isChecking: false,
			});
			setIsTypingUsername(false);
			return;
		}

		const formatErr = getUsernameFormatError(username);
		if (formatErr) {
			setUsernameValidation({
				isValid: false,
				message: formatErr,
				isChecking: false,
			});
			setIsTypingUsername(false);
			return;
		}

		// Set checking state immediately for valid input
		setUsernameValidation({ isValid: true, message: "", isChecking: true });

		// Debounce API call
		debounceTimerRef.current = setTimeout(async () => {
			// Create new abort controller for this request
			const controller = new AbortController();
			abortControllerRef.current = controller;
			lastUsernameRequestedRef.current = username;

			try {
				// Double-check blacklist before making API call (race condition protection)
				if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
					setUsernameValidation({
						isValid: false,
						message: "Este nome de usuário não está disponível",
						isChecking: false,
					});
					setIsTypingUsername(false);
					return;
				}

				const response = await fetch(
					`/api/auth/check-username?username=${encodeURIComponent(normalizeUsernameForLookup(username))}`,
					{ signal: controller.signal }
				);

				if (!response.ok) {
					if (response.status === 429) {
						setUsernameValidation({
							isValid: false,
							message: "Muitas tentativas. Aguarde um momento.",
							isChecking: false,
						});
					} else {
						setUsernameValidation({
							isValid: false,
							message: "Erro ao verificar disponibilidade",
							isChecking: false,
						});
					}
					setIsTypingUsername(false);
					return;
				}

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

				if (lastUsernameRequestedRef.current !== username) {
					setIsTypingUsername(false);
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
				setIsTypingUsername(false);
			} catch (error: any) {
				// Don't show error if request was aborted (user typed something else)
				if (
					error?.name === "AbortError" ||
					error?.message?.includes("aborted")
				) {
					// We don't set isTypingUsername to false here because a new request might have started
					return;
				}
				setUsernameValidation({
					isValid: false,
					message: "Erro ao verificar disponibilidade",
					isChecking: false,
				});
				setIsTypingUsername(false);
			}
		}, 550);
	}, []);

	const handleUsernameChange = (value: string) => {
		const sanitized = sanitizeUsername(value);
		if (sanitized === data.username) {
			return;
		}
		setData({ ...data, username: sanitized });
		setIsTypingUsername(true);
		if (sanitized) {
			validateUsername(sanitized);
		} else {
			setUsernameValidation({ isValid: false, message: "", isChecking: false });
			setIsTypingUsername(false);
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
				const hasAllSocialUsernames = data.socialLinks.every(
					(link) => link.username.trim().length > 0
				);
				return hasAllSocialUsernames;
			}
			case 5: {
				const hasName = data.name.trim().length > 0;
				if (!isGoogleUser) {
					return hasName;
				}
				const hasValidUsername =
					data.username.trim().length > 0 &&
					isValidUsernameFormat(data.username) &&
					usernameValidation.isValid &&
					!usernameValidation.isChecking &&
					!isTypingUsername;
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

		const validCustomLinks = data.customLinks
			.filter((link) => link.title.trim() && link.url.trim())
			.map((link) => {
				let u = link.url.trim();
				if (!/^https?:\/\//i.test(u)) {
					u = `https://${u}`;
				}
				return { title: link.title.trim(), url: u };
			});

		onComplete({
			...data,
			customLinks: validCustomLinks,
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

						<TemplateSelector
							onSelect={(id) => setData({ ...data, template: id })}
							selectedTemplateId={data.template}
						/>
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
						className="space-y-6"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step4"
						transition={{ duration: 0.3 }}
					>
						{data.socialLinks.length > 0 && (
							<div className="space-y-4">
								<Label>Seus usuários nas redes sociais</Label>
								<div className="grid gap-3">
									{data.socialLinks.map((social, index) => {
										const cfg = SOCIAL_PLATFORMS.find(
											(p) => p.key === social.platform
										);
										return (
											<div
												className="flex items-center gap-3"
												key={social.platform}
											>
												<div
													className="h-6 w-6 shrink-0"
													style={{
														backgroundColor: cfg?.color,
														maskImage: cfg ? `url(${cfg.icon})` : undefined,
														maskSize: "contain",
														maskRepeat: "no-repeat",
														maskPosition: "center",
													}}
												/>
												<Input
													className="flex-1"
													maxLength={50}
													onChange={(e) => {
														const newSocials = [...data.socialLinks];
														newSocials[index].username = e.target.value;
														setData({ ...data, socialLinks: newSocials });
													}}
													placeholder={cfg?.placeholder || "usuario"}
													value={social.username}
												/>
											</div>
										);
									})}
								</div>
							</div>
						)}

						<div className="space-y-4">
							<CustomLinksForm
								onChange={(v) => setData({ ...data, customLinks: v })}
								value={data.customLinks}
							/>
						</div>
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
									<PencilSimple className="h-4 w-4" weight="regular" />
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
												<SpinnerGap
													className="h-4 w-4 animate-spin text-muted-foreground"
													weight="regular"
												/>
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
								src="/images/bionk-icon-black.svg"
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
		<div className="flex min-h-dvh items-start justify-center bg-white p-6 pt-16 dark:from-gray-900 dark:to-gray-800">
			{currentStep !== 6 && (
				<div className="-translate-x-1/2 fixed top-6 left-1/2 z-50 h-1.5 w-1/12 max-w-md overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
					<div
						className="h-full rounded-full bg-sky-500 transition-all duration-300 ease-out"
						style={{
							width: `${(currentStep / (hideStep6 ? 5 : STEPS.length)) * 100}%`,
						}}
					/>
				</div>
			)}
			<div className="mx-auto w-full max-w-lg">
				{currentStep !== 6 && (
					<div className="mb-8 text-center">
						<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
							{STEPS[currentStep - 1].title}
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							{STEPS[currentStep - 1].description}
						</p>
					</div>
				)}
				{/* Content */}
				<div className="mb-6 bg-white py-4 pb-32 dark:bg-gray-800">
					<AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
				</div>

				{/* Navigation */}
				<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-20 pt-12 pb-6">
					<div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-gray-900 dark:via-gray-900/90 dark:to-transparent" />
					<div className="pointer-events-auto relative mx-auto flex w-full max-w-lg flex-col items-center gap-3 px-6">
						{currentStep < (hideStep6 ? 5 : STEPS.length) ? (
							<BaseButton
								className="!bg-sky-500 !text-white hover:!bg-sky-600 w-full justify-center border-transparent"
								disabled={!canProceedToNext()}
								onClick={handleNext}
							>
								Continuar
							</BaseButton>
						) : (
							<BaseButton
								className="!bg-sky-500 !text-white hover:!bg-sky-600 w-full justify-center border-transparent"
								disabled={loading || isSubmitting || !canProceedToNext()}
								onClick={handleComplete}
							>
								{loading || isSubmitting ? (
									<SpinnerGap
										className="h-4 w-4 animate-spin"
										weight="regular"
									/>
								) : (
									<Check className="h-4 w-4" weight="regular" />
								)}
								<span className="ml-2">
									{hideStep6 ? "Criar Perfil" : "Concluir e ir para o Studio"}
								</span>
							</BaseButton>
						)}

						<div className="flex h-6 items-center gap-4">
							{currentStep > 1 && (
								<button
									className="font-medium text-gray-500 text-sm transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									onClick={handlePrevious}
									type="button"
								>
									Voltar
								</button>
							)}
							{onCancel && currentStep === 1 && (
								<button
									className="font-medium text-gray-500 text-sm transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									onClick={onCancel}
									type="button"
								>
									Cancelar
								</button>
							)}
						</div>
					</div>
				</div>
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

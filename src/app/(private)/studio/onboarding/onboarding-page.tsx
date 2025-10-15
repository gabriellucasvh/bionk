"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";

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
	name: string;
	username: string;
	bio: string;
	profileImage?: File;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
	{
		id: 1,
		title: "Foto de Perfil",
		description: "Adicione uma foto para seu perfil",
	},
	{
		id: 2,
		title: "Nome de exibição",
		description: "Como você gostaria de ser chamado?",
	},
	{
		id: 3,
		title: "Nome de Usuário",
		description: "Escolha seu nome de usuário único",
	},
	{
		id: 4,
		title: "Biografia",
		description: "Conte um pouco sobre você",
	},
];

export default function OnboardingPageComponent({
    onComplete,
    initialData,
    loading = false,
}: OnboardingPageProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [data, setData] = useState({
        name: initialData?.name || "",
        username: initialData?.username || "",
        bio: "",
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

	// Configurar imagem inicial
	useEffect(() => {
		setProfilePreview(
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
		);
	}, []);

	// Debounce timer ref
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const validateUsername = useCallback((username: string) => {
		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		if (!username.trim()) {
			setUsernameValidation({
				isValid: true,
				message: "",
				isChecking: false,
			});
			return;
		}

		if (username.length > 30) {
			setUsernameValidation({
				isValid: false,
				message: "Nome de usuário deve ter no máximo 30 caracteres",
				isChecking: false,
			});
			return;
		}

		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			setUsernameValidation({
				isValid: false,
				message: "Este nome de usuário não está disponível",
				isChecking: false,
			});
			return;
		}

		// Set checking state immediately for valid input
		setUsernameValidation({ isValid: true, message: "", isChecking: true });

		// Debounce API call
		debounceTimerRef.current = setTimeout(async () => {
			try {
				const response = await fetch(
					`/api/auth/check-username?username=${encodeURIComponent(username)}`
				);
				const result = await response.json();

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
			} catch {
				setUsernameValidation({
					isValid: false,
					message: "Erro ao verificar disponibilidade",
					isChecking: false,
				});
			}
		}, 500); // 500ms debounce
	}, []);

	const handleUsernameChange = (value: string) => {
		const sanitized = value.replace(/[^a-zA-Z0-9_.]/g, "").toLowerCase();
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
			case 1:
				return true; // Foto é opcional
			case 2:
				return data.name.trim().length > 0;
			case 3:
				return (
					data.username.trim().length > 0 &&
					usernameValidation.isValid &&
					!usernameValidation.isChecking
				);
			case 4:
				return true; // Bio é opcional
			default:
				return false;
		}
	};

	const handleNext = () => {
		if (currentStep < 4) {
			setCurrentStep((prev) => (prev + 1) as Step);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as Step);
		}
	};

    const handleComplete = () => {
        if (isSubmitting) return;
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
						className="flex flex-col items-center space-y-2"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step1"
						transition={{ duration: 0.3 }}
					>
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
						<p className="max-w-sm text-center text-muted-foreground text-sm">
							Adicione uma foto para que as pessoas possam te reconhecer
							<br />
							<span className="text-xs">(Opcional)</span>
						</p>
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
						<div className="space-y-2">
							<Label htmlFor="username">Nome de usuário *</Label>
							<div className="flex items-center space-x-2">
								<span className="text-muted-foreground text-sm">bionk.me/</span>
								<Input
									className={`flex-1 py-3 ${
										usernameValidation.isValid ? "" : "border-red-500"
									}`}
									id="username"
									maxLength={30}
									onChange={(e) => handleUsernameChange(e.target.value)}
									placeholder="seuusername"
									value={data.username}
								/>
								{usernameValidation.isChecking && (
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								)}
							</div>
							<div className="flex items-center justify-between">
								<p
									className={`text-xs ${
										usernameValidation.isValid
											? "text-green-600"
											: "text-red-500"
									}`}
								>
									{usernameValidation.message}
								</p>
								<p className="text-muted-foreground text-xs">
									{data.username.length}/30 caracteres
								</p>
							</div>
						</div>
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

			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center bg-white p-4 dark:from-gray-900 dark:to-gray-800">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl text-gray-900 dark:text-white">
						Bem-vindo ao Bionk!
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Vamos configurar seu perfil em alguns passos
					</p>
				</div>

				{/* Progress */}
				<div className="mb-8">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-medium text-gray-700 text-sm dark:text-gray-300">
							{STEPS[currentStep - 1].title}
						</span>
						<span className="text-gray-500 text-sm dark:text-gray-400">
							{currentStep} de {STEPS.length}
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

				{/* Content */}
				<div className="mb-6 bg-white p-6 dark:bg-gray-800">
					<AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
				</div>

				{/* Navigation */}
				<div className="flex items-center justify-between">
					{currentStep > 1 ? (
						<BaseButton
							className="flex items-center gap-2"
							onClick={handlePrevious}
							variant="white"
						>
							<ArrowLeft className="h-4 w-4" />
							Voltar
						</BaseButton>
					) : (
						<div />
					)}

					{currentStep < 4 ? (
						<BaseButton
							className="flex items-center gap-2"
							disabled={!canProceedToNext()}
							onClick={handleNext}
						>
							Próximo
							<ArrowRight className="h-4 w-4" />
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
                            Concluir
                        </BaseButton>
					)}
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

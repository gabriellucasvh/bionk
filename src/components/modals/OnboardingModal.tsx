"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";

interface OnboardingModalProps {
	isOpen: boolean;
	onClose: () => void;
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
		title: "Seu Nome",
		description: "Como você gostaria de ser chamado?",
	},
	{
		id: 3,
		title: "Nome de Usuário",
		description: "Escolha seu nome único na plataforma",
	},
	{ id: 4, title: "Biografia", description: "Conte um pouco sobre você" },
];

const OnboardingModal = ({
	isOpen,
	onComplete,
	user,
	initialData,
	loading = false,
}: OnboardingModalProps) => {
	const [currentStep, setCurrentStep] = useState<Step>(1);
	const [data, setData] = useState<OnboardingData>({
		name: initialData?.name || "",
		username: initialData?.username || "",
		bio: "",
	});
	const [profilePreview, setProfilePreview] = useState<string>(() => {
		// Priorizar imagem do Google se existir e não for nula/vazia
		const googleImage =
			user?.image && user.image.trim() !== "" ? user.image : null;
		const finalImage =
			googleImage ||
			initialData?.image ||
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";

		return finalImage;
	});
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		null
	);
	const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
	const [usernameValidation, setUsernameValidation] = useState<{
		isValid: boolean;
		message: string;
		isChecking: boolean;
	}>({ isValid: true, message: "", isChecking: false });

	// Reset quando o modal abre
	useEffect(() => {
		if (isOpen) {
			setCurrentStep(1);
			setData({
				name: initialData?.name || "",
				username: initialData?.username || "",
				bio: "",
			});
			// Priorizar imagem do Google se existir e não for nula/vazia
			const googleImage =
				user?.image && user.image.trim() !== "" ? user.image : null;
			const finalImage =
				googleImage ||
				initialData?.image ||
				"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
			setProfilePreview(finalImage);
			setSelectedProfileFile(null);
			setUsernameValidation({ isValid: true, message: "", isChecking: false });
		}
	}, [isOpen, initialData, user?.image]);

	const validateUsername = useCallback(async (username: string) => {
		if (!username.trim()) {
			setUsernameValidation({
				isValid: false,
				message: "O nome de usuário é obrigatório",
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

		setUsernameValidation({ isValid: true, message: "", isChecking: true });

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
					message: "Nome de usuário já está em uso",
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
				return data.name.trim().length > 0 && data.name.length <= 44;
			case 3:
				return (
					usernameValidation.isValid &&
					!usernameValidation.isChecking &&
					data.username.trim().length > 0
				);
			case 4:
				return true; // Bio é opcional
			default:
				return false;
		}
	};

	const handleNext = () => {
		if (currentStep < 4 && canProceedToNext()) {
			setCurrentStep((prev) => (prev + 1) as Step);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as Step);
		}
	};

	const handleComplete = () => {
		if (canProceedToNext()) {
			onComplete({
				...data,
				profileImage: selectedProfileFile || undefined,
			});
		}
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="flex flex-col items-center space-y-6"
						exit={{ opacity: 0, x: -20 }}
						initial={{ opacity: 0, x: 20 }}
						key="step1"
						transition={{ duration: 0.3 }}
					>
						<div className="relative">
							<div className="h-32 w-32 overflow-hidden rounded-full bg-muted shadow-lg">
								<Image
									alt="Foto de perfil"
									className="h-full w-full object-cover"
									height={128}
									key={profilePreview}
									src={profilePreview}
									width={128}
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
						<p className="text-center text-muted-foreground text-sm">
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
							<Label htmlFor="name">Nome completo *</Label>
							<Input
								id="name"
								maxLength={44}
								onChange={(e) => setData({ ...data, name: e.target.value })}
								placeholder="Digite seu nome completo"
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
									className={`flex-1 ${
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
								className="min-h-32 text-neutral-700 dark:bg-neutral-700 dark:text-white"
								id="bio"
								maxLength={300}
								onChange={(e) => setData({ ...data, bio: e.target.value })}
								placeholder="Fale um pouco sobre você"
								value={data.bio}
							/>
							<p className="text-muted-foreground text-sm">
								{data.bio.length}/300 caracteres (Opcional)
							</p>
						</div>
					</motion.div>
				);

			default:
				return null;
		}
	};

	return (
		<>
			<Dialog onOpenChange={() => {}} open={isOpen}>
				<DialogContent className="max-w-md p-0" showCloseButton={false}>
					<div className="relative overflow-hidden rounded-lg bg-white">
						{/* Header */}
						<div className="border-b bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-white">
							<div className="flex items-center justify-between">
								<DialogTitle>
									<div>
										<h2 className="font-semibold text-lg">
											{STEPS[currentStep - 1].title}
										</h2>
										<p className="text-blue-100 text-sm">
											{STEPS[currentStep - 1].description}
										</p>
									</div>
								</DialogTitle>
							</div>

							{/* Progress bar */}
							<div className="mt-3 flex space-x-1">
								{STEPS.map((step) => (
									<div
										className={`h-1 flex-1 rounded-full transition-all duration-300 ${
											step.id <= currentStep ? "bg-white" : "bg-white/30"
										}`}
										key={step.id}
									/>
								))}
							</div>
						</div>

						{/* Content */}
						<div className="p-6">
							<AnimatePresence mode="wait">
								{renderStepContent()}
							</AnimatePresence>
						</div>

						{/* Footer */}
						<div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
							<Button
								disabled={currentStep === 1}
								onClick={handlePrevious}
								variant="outline"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Voltar
							</Button>

							<div className="text-muted-foreground text-sm">
								{currentStep} de {STEPS.length}
							</div>

							{currentStep < 4 ? (
								<Button disabled={!canProceedToNext()} onClick={handleNext}>
									Próximo
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							) : (
								<BaseButton
									disabled={!canProceedToNext() || loading}
									loading={loading}
									onClick={handleComplete}
								>
									<Check className="mr-2 h-4 w-4" />
									Concluir
								</BaseButton>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<ProfileImageCropModal
				currentImageUrl={profilePreview}
				isOpen={isImageCropModalOpen}
				onClose={() => setIsImageCropModalOpen(false)}
				onImageSave={handleProfileImageSave}
			/>
		</>
	);
};

export default OnboardingModal;

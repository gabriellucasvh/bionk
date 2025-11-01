"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ALargeSmall, Check, Edit, Link2, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";

const REJEX_URL = /^https?:\/\//i;

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
		description: "Adicione foto, nome e bio; username apenas para Google",
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
		username: initialData?.username || "",
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
	const isGoogleUser = user?.provider === "google" || Boolean(user?.googleId);

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
								<div className="pointer-events-auto mx-auto flex w-full max-w-1/2 justify-between">
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
								<div className="flex items-center space-x-2">
									<span className="text-muted-foreground text-sm">
										bionk.me/
									</span>
									<Input
										className={`flex-1 py-3 ${usernameValidation.isValid ? "" : "border-red-500"}`}
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
							<h2 className="mb-2 font-bold text-2xl">Tudo pronto!</h2>
							<p className="text-muted-foreground">
								Obrigado por se cadastrar.
							</p>
						</div>
						<div>
							<Label className="mb-2 block">Compartilhe seu cadastro</Label>
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
								{SHARING_PLATFORMS.map((sp) => {
									const origin =
										typeof window !== "undefined" ? window.location.origin : "";
									const profileUrl = data.username
										? `${origin}/${data.username}`
										: origin;
									const shareUrl = sp.urlTemplate
										.replace(
											"{title}",
											encodeURIComponent("Meu perfil no Bionk")
										)
										.replace("{url}", encodeURIComponent(profileUrl));
									return (
										<a
											className={`flex items-center justify-center rounded-md px-3 py-2 text-sm text-white ${sp.color}`}
											href={shareUrl}
											key={sp.key}
											rel="noopener noreferrer"
											target="_blank"
										>
											{sp.name}
										</a>
									);
								})}
							</div>
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
								Concluir
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

// Auxiliar de seleção de template para o onboarding
import { ALL_TEMPLATES } from "@/app/(public)/templates/templates.constants";
import { SHARING_PLATFORMS } from "@/config/sharing-platforms";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";

function TemplateSelector({
	selectedTemplateId,
	onSelect,
}: {
	selectedTemplateId: string;
	onSelect: (templateId: string) => void;
}) {
	return (
		<div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{ALL_TEMPLATES.map((tpl) => {
					const isActive = tpl.id === selectedTemplateId;
					return (
						<button
							className={`group relative overflow-hidden rounded-lg border text-left transition ${
								isActive
									? "border-lime-500 ring-2 ring-lime-400"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							}`}
							key={tpl.id}
							onClick={() => onSelect(tpl.id)}
							type="button"
						>
							<div className="aspect-[9/16] w-full bg-gray-100 dark:bg-gray-800">
								<Image
									alt={tpl.name}
									className="h-full w-full object-cover"
									height={320}
									src={tpl.image}
									width={180}
								/>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function UserTypeSelector({
	selected,
	onSelect,
}: {
	selected: string;
	onSelect: (value: string) => void;
}) {
	const options = [
		{
			key: "creator",
			title: "Criador",
			description:
				"Mostre seu trabalho, compartilhe conteúdo e conecte-se com seu público.",
			image: "/images/criador.png",
		},
		{
			key: "enterprise",
			title: "Empresa",
			description:
				"Divulgue sua marca, apresente produtos e destaque suas campanhas.",
			image: "/images/empresa.png",
		},
		{
			key: "personal",
			title: "Pessoal",
			description:
				"Crie um espaço só seu para reunir links, projetos e redes sociais.",
			image: "/images/pessoal.png",
		},
	];
	return (
		<div>
			<Label className="mb-2 block">Selecione o tipo de usuário</Label>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{options.map((opt) => {
					const active = selected === opt.key;
					return (
						<button
							className={`rounded-xl border p-0 text-left transition ${active ? "border-lime-400 ring-2 ring-lime-400" : "border-gray-200 hover:border-gray-300 dark:border-gray-700"}`}
							key={opt.key}
							onClick={() => onSelect(opt.key)}
							type="button"
						>
							<div className="aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-800">
								<Image
									alt={opt.title}
									className="h-full w-full object-cover"
									height={240}
									src={opt.image}
									width={320}
								/>
							</div>
							<div className="p-4">
								<p className="font-semibold">{opt.title}</p>
								<p className="text-muted-foreground text-sm">
									{opt.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function SocialLinksSelector({
	value,
	onChange,
}: {
	value: { platform: string; username: string }[];
	onChange: (v: { platform: string; username: string }[]) => void;
}) {
	const [selectedPlatform, setSelectedPlatform] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [editingPlatform, setEditingPlatform] = useState<string>("");
	const [editingUsername, setEditingUsername] = useState<string>("");
	const addLink = () => {
		if (!(selectedPlatform && username.trim())) {
			return;
		}
		const next = value.filter((v) => v.platform !== selectedPlatform);
		next.push({ platform: selectedPlatform, username: username.trim() });
		onChange(next);
		setUsername("");
		setSelectedPlatform("");
	};
	const saveEdit = () => {
		if (!(editingPlatform && editingUsername.trim())) {
			return;
		}
		const next = value.map((i) =>
			i.platform === editingPlatform
				? { platform: i.platform, username: editingUsername.trim() }
				: i
		);
		onChange(next);
		setEditingPlatform("");
		setEditingUsername("");
	};
	const platforms = SOCIAL_PLATFORMS;
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
				{platforms.map((p) =>
					(() => {
						const isEditing = !!editingPlatform;
						const isAdded = value.some((v) => v.platform === p.key);
						const isDisabled =
							isEditing || (isAdded && selectedPlatform !== p.key);
						return (
							<button
								className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-2 transition ${selectedPlatform === p.key ? "border-lime-500" : "border-gray-200 hover:border-gray-300 dark:border-gray-700"} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
								disabled={isDisabled}
								key={p.key}
								onClick={() => {
									if (isDisabled) {
										return;
									}
									setSelectedPlatform(p.key);
								}}
								title={p.name}
								type="button"
							>
								<div
									className="mb-1 h-7 w-7"
									style={{
										backgroundColor: p.color,
										maskImage: `url(${p.icon})`,
										maskSize: "contain",
										maskRepeat: "no-repeat",
										maskPosition: "center",
									}}
								/>
								<span className="truncate text-xs">{p.name}</span>
							</button>
						);
					})()
				)}
			</div>
			{selectedPlatform &&
				!value.some((v) => v.platform === selectedPlatform) && (
					<div className="space-y-2">
						<Label>Usuário</Label>
						<Input
							onChange={(e) => setUsername(e.target.value)}
							placeholder={
								platforms.find((p) => p.key === selectedPlatform)
									?.placeholder || "usuario"
							}
							value={username}
						/>
						<div className="flex items-center gap-2">
							<BaseButton
								onClick={() => {
									setSelectedPlatform("");
									setUsername("");
								}}
								variant="white"
							>
								Cancelar
							</BaseButton>
							<div className="flex justify-end">
								<BaseButton onClick={addLink}>Adicionar</BaseButton>
							</div>
						</div>
					</div>
				)}
			{value.length > 0 && (
				<div className="space-y-2">
					<Label>Redes adicionadas</Label>
					<ul className="space-y-2">
						{value.map((v) => {
							const cfg = platforms.find((p) => p.key === v.platform);
							return (
								<li
									className="flex items-center justify-between rounded-lg border p-2"
									key={v.platform}
								>
									<div className="flex w-full flex-col gap-2">
										{editingPlatform === v.platform ? (
											<>
												<div className="flex w-full items-center gap-3">
													<div
														className="h-6 w-6"
														style={{
															backgroundColor: cfg?.color,
															maskImage: cfg ? `url(${cfg.icon})` : undefined,
															maskSize: "contain",
															maskRepeat: "no-repeat",
															maskPosition: "center",
														}}
													/>
													<Input
														className="w-full min-w-0"
														onChange={(e) => setEditingUsername(e.target.value)}
														placeholder={
															platforms.find((p) => p.key === v.platform)
																?.placeholder || "usuario"
														}
														value={editingUsername}
													/>
												</div>
												<div className="flex items-center justify-end gap-2">
													<BaseButton onClick={saveEdit}>Salvar</BaseButton>
													<BaseButton
														onClick={() => {
															setEditingPlatform("");
															setEditingUsername("");
														}}
														variant="white"
													>
														Cancelar
													</BaseButton>
												</div>
											</>
										) : (
											<div className="flex items-center gap-3">
												<div
													className="h-6 w-6"
													style={{
														backgroundColor: cfg?.color,
														maskImage: cfg ? `url(${cfg.icon})` : undefined,
														maskSize: "contain",
														maskRepeat: "no-repeat",
														maskPosition: "center",
													}}
												/>
												<span className="text-sm">{v.username}</span>
											</div>
										)}
									</div>
									<div
										className={`flex items-center gap-2 ${editingPlatform === v.platform ? "hidden" : ""}`}
									>
										{editingPlatform === v.platform ? (
											<>
												<BaseButton onClick={saveEdit}>Salvar</BaseButton>
												<BaseButton
													onClick={() => {
														setEditingPlatform("");
														setEditingUsername("");
													}}
													variant="white"
												>
													Cancelar
												</BaseButton>
											</>
										) : (
											<>
												<button
													className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
													onClick={() => {
														setEditingPlatform(v.platform);
														setEditingUsername(v.username);
													}}
													title="Editar"
													type="button"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
													onClick={() =>
														onChange(
															value.filter((i) => i.platform !== v.platform)
														)
													}
													title="Remover"
													type="button"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

function CustomLinksForm({
	value,
	onChange,
}: {
	value: { title: string; url: string }[];
	onChange: (v: { title: string; url: string }[]) => void;
}) {
	const [title, setTitle] = useState<string>("");
	const [url, setUrl] = useState<string>("");
	const [editedIndex, setEditedIndex] = useState<number | null>(null);
	const [editedTitle, setEditedTitle] = useState<string>("");
	const [editedUrl, setEditedUrl] = useState<string>("");
	const addLink = () => {
		const t = title.trim();
		let u = url.trim();
		if (!(t && u)) {
			return;
		}
		if (t.length > 80) {
			return;
		}
		if (!REJEX_URL.test(u)) {
			u = `https://${u}`;
		}
		const next = [...value, { title: t, url: u }];
		onChange(next);
		setTitle("");
		setUrl("");
	};
	const startEditing = (idx: number, v: { title: string; url: string }) => {
		setEditedIndex(idx);
		setEditedTitle(v.title);
		setEditedUrl(v.url);
	};
	const cancelEdited = () => {
		setEditedIndex(null);
		setEditedTitle("");
		setEditedUrl("");
	};
	const saveEdited = () => {
		if (editedIndex === null) {
			return;
		}
		const t = editedTitle.trim();
		let u = editedUrl.trim();
		if (!(t && u)) {
			return;
		}
		if (t.length > 80) {
			return;
		}
		if (!REJEX_URL.test(u)) {
			u = `https://${u}`;
		}
		const next = value.map((item, i) =>
			i === editedIndex ? { title: t, url: u } : item
		);
		onChange(next);
		cancelEdited();
	};
	return (
		<div className="space-y-2">
			<Label>Adicionar links</Label>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<div className="mb-2 space-y-1">
					<Input
						maxLength={80}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Título"
						value={title}
					/>
				</div>
				<Input
					onChange={(e) => setUrl(e.target.value)}
					placeholder="URL"
					value={url}
				/>
			</div>
			<BaseButton onClick={addLink}>Adicionar</BaseButton>
			{value.length > 0 && (
				<ul className="mt-2 space-y-1">
					{value.map((v, idx) => (
						<li
							className="flex items-center justify-between rounded border p-2"
							key={`${v.title}-${idx}`}
						>
							<div className="flex min-w-0 flex-1 flex-col items-center gap-4 sm:flex-row">
								<div className="flex items-center gap-3">
									<ALargeSmall className="h-4 w-4" />
									<Input
										className="w-[220px] overflow-hidden truncate text-ellipsis whitespace-nowrap rounded-full bg-gray-200 px-4 py-2 text-gray-800 text-sm sm:w-[220px] md:w-[300px] dark:bg-gray-800 dark:text-gray-200"
										id={`title-pill-${idx}`}
										maxLength={80}
										onChange={(e) => {
											if (editedIndex !== idx) {
												startEditing(idx, v);
											}
											setEditedTitle(e.target.value);
										}}
										onFocus={() => startEditing(idx, v)}
										placeholder="Título"
										value={editedIndex === idx ? editedTitle : v.title}
									/>
								</div>
								<div className="flex items-center gap-3">
									<Link2 className="h-4 w-4" />
									<Input
										className="w-[220px] overflow-hidden truncate text-ellipsis whitespace-nowrap rounded-full bg-gray-200 px-4 py-2 text-gray-800 text-sm sm:w-[220px] md:w-[300px] dark:bg-gray-800 dark:text-gray-200"
										id={`url-pill-${idx}`}
										onChange={(e) => {
											if (editedIndex !== idx) {
												startEditing(idx, v);
											}
											setEditedUrl(e.target.value);
										}}
										onFocus={() => startEditing(idx, v)}
										placeholder="URL"
										type="url"
										value={editedIndex === idx ? editedUrl : v.url}
									/>
								</div>
								{editedIndex === idx &&
									(editedTitle !== v.title || editedUrl !== v.url) && (
										<div className="mt-2 flex w-full justify-end gap-2">
											<BaseButton onClick={cancelEdited} variant="white">
												Cancelar
											</BaseButton>
											<BaseButton onClick={saveEdited}>Salvar</BaseButton>
										</div>
									)}
							</div>
							<div className="flex flex-shrink-0 items-center gap-2">
								<button
									className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
									onClick={() => onChange(value.filter((_, i) => i !== idx))}
									title="Remover"
									type="button"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

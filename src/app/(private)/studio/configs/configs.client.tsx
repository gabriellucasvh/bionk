"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/providers/subscriptionProvider";
import { useTheme } from "@/providers/themeProvider";
import { useRouter } from "next/navigation";

import { PencilSimple, SpinnerGap } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useRef } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ProfileImageCropModal from "@/components/modals/ProfileImageCropModal";
import { BottomSheet, BottomSheetContent } from "@/components/ui/bottom-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { getUsernameFormatError, normalizeUsernameForLookup, sanitizeUsername } from "@/utils/username";
import VerPerfilMobile from "../VerPerfilMobile";


// Tipos
type Profile = { email: string };

type UserProfile = {
	name: string;
	username: string;
	bio?: string;
	image?: string;
	lastUsernameChange?: string | null;
};

type SubscriptionDetails = {
	isSubscribed: boolean;
	plan?: string;
	status?: string;
	renewsOn?: string;
	paymentMethod?: { brand: string; lastFour: string };
};

// -----------------------------------------------------------------------------------------------------------
// Cancel Subscription
// -----------------------------------------------------------------------------------------------------------

function CancelSubscriptionButton() {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const { refreshSubscriptionPlan } = useSubscription();

	const handleCancelConfirm = async () => {
		setIsLoading(true);
		setError("");
		setMessage("");
		try {
			const res = await fetch("/api/stripe/customer-portal", {
				method: "POST",
			});
			const data = await res.json();
			if (!(res.ok && data?.url)) {
				throw new Error(data?.error || "Falha ao abrir o Customer Portal");
			}

			window.location.href = data.url;

			await refreshSubscriptionPlan();
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="mt-4">
			<Button
				className="w-full rounded-full sm:w-auto dark:border-zinc-600"
				disabled={isLoading}
				onClick={handleCancelConfirm}
				variant="outline"
			>
				{isLoading ? "Abrindo..." : "Gerenciar Assinatura"}
			</Button>

			{message && (
				<p className="mt-2 text-blue-600 text-sm dark:text-blue-400">
					{message}
				</p>
			)}
			{error && (
				<p className="mt-2 text-red-600 text-sm dark:text-red-400">{error}</p>
			)}
		</div>
	);
}

// -----------------------------------------------------------------------------------------------------------
// Upgrade Card
// -----------------------------------------------------------------------------------------------------------

function UpgradeSubscriptionCard() {
	return (
		<div>
			<Card className="relative animate-gradient-x overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-sky-700 to-purple-500 shadow-2xl">
				<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
				<div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 to-transparent" />

				<CardHeader className="relative z-10">
					<CardTitle className="flex items-center gap-3 font-bold text-white text-xl">
						Desbloqueie o Poder Pro!
					</CardTitle>
					<CardDescription className="text-base text-blue-50/90 leading-relaxed">
						Você está a um passo da{" "}
						<span className="font-semibold text-white">
							experiência completa
						</span>
						.
					</CardDescription>
				</CardHeader>

				<CardContent className="relative z-10 mb-2">
					<Link
						className="group relative w-full transform overflow-hidden rounded-full bg-sky-400 px-8 py-3 font-medium text-base text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-sky-500 hover:shadow-xl"
						href="/planos"
					>
						Fazer Upgrade
					</Link>
				</CardContent>
			</Card>

			<Separator className="my-4" />
		</div>
	);
}

// -----------------------------------------------------------------------------------------------------------
// Subscription Management
// -----------------------------------------------------------------------------------------------------------

function SubscriptionManagement({
	subscription,
}: {
	subscription: SubscriptionDetails | null;
}) {
	if (!subscription?.isSubscribed) {
		return null;
	}

	if (subscription.plan === "free") {
		return <UpgradeSubscriptionCard />;
	}

	if (subscription.status === "active") {
		return (
			<Card className="dark:border-zinc-700 dark:bg-zinc-800">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 dark:text-white">
						Gerenciar Assinatura
					</CardTitle>
					<CardDescription className="dark:text-zinc-400">
						Visualize os detalhes do seu plano
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
						<div className="space-y-1">
							<p className="font-medium text-sm dark:text-white">Plano Atual</p>
							<p className="text-muted-foreground text-sm capitalize dark:text-zinc-400">
								{subscription.plan}
							</p>
						</div>

						<div className="space-y-1">
							<p className="font-medium text-sm dark:text-white">
								Próxima Cobrança
							</p>
							<p className="text-muted-foreground text-sm dark:text-zinc-400">
								{subscription.renewsOn
									? new Date(subscription.renewsOn).toLocaleDateString("pt-BR")
									: "-"}
							</p>
						</div>
					</div>

					<Separator />

					<CancelSubscriptionButton />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="dark:border-zinc-700 dark:bg-zinc-800">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive dark:text-red-400">
					Assinatura Cancelada
				</CardTitle>
				<CardDescription className="dark:text-zinc-400">
					Sua assinatura não está ativa. Para reativar, escolha um novo plano.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Link href="/planos">
					<Button className="w-full sm:w-auto" variant="outline">
						Ver Planos
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

// -----------------------------------------------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------------------------------------------

export default function ConfigsClient() {
    const { data: session } = useSession();
    const router = useRouter();
	const { theme, setTheme, isAutoMode, setAutoMode } = useTheme();
	const { subscriptionPlan, isLoading: isSubscriptionLoading } =
		useSubscription();

	const isCredentialsUser = session?.user?.isCredentialsUser === true;

	const [profile, setProfile] = useState<Profile>({ email: "" });
	const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
        null
    );
	const [sensitiveProfile, setSensitiveProfile] = useState(false);
	const [isSensitiveLoading, setIsSensitiveLoading] = useState(false);

	const [profileData, setProfileData] = useState({ name: "", username: "", bio: "" });
	const [originalProfile, setOriginalProfile] = useState({ name: "", username: "", bio: "" });
	const [loadingProfile, setLoadingProfile] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [profilePreview, setProfilePreview] = useState<string>(
		session?.user?.image || "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png"
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
	const [profileImageChanged, setProfileImageChanged] = useState(false);
	const [originalProfileImageUrl, setOriginalProfileImageUrl] = useState<string>("");
	const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
	const [validationError, setValidationError] = useState<string>("");
	const [bioValidationError, setBioValidationError] = useState<string>("");
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isEditingUsername, setIsEditingUsername] = useState(false);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [isTypingUsername, setIsTypingUsername] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const lastUsernameRequestedRef = useRef<string>("");
	const currentUsernameRef = useRef<string>("");
	const [canChangeUsername, setCanChangeUsername] = useState(true);
	const [cooldownMessage, setCooldownMessage] = useState<string>("");
	const usernameDebounceRef = useRef<number | null>(null);
	const usernameCheckAbortRef = useRef<AbortController | null>(null);

	const update = useSession().update;


	useEffect(() => {
		const load = async () => {
			if (!session?.user?.id) {
				return;
			}

			try {
				const [profileRes, subRes] = await Promise.all([
					fetch("/api/profile"),
					fetch("/api/subscription-details"),
				]);


				const profileRespData = await profileRes.json();
				setProfile({ email: profileRespData.email || session.user.email || "" });
				setSensitiveProfile(profileRespData.sensitiveProfile);

				const currentImage = profileRespData.image || "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
				setProfileData({ name: profileRespData.name || "", username: profileRespData.username || "", bio: profileRespData.bio || "" });
				setOriginalProfile({ name: profileRespData.name || "", username: profileRespData.username || "", bio: profileRespData.bio || "" });
				setProfilePreview(currentImage);
				setOriginalProfileImageUrl(currentImage);

				if (profileRespData.lastUsernameChange) {
					const last = new Date(profileRespData.lastUsernameChange);
					const ends = new Date(last.getTime() + 3 * 24 * 60 * 60 * 1000);
					const now = new Date();
					if (now < ends) {
						setCanChangeUsername(false);
						const diffMs = ends.getTime() - now.getTime();
						const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
						const diffHours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
						const diffMinutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
						let msg = "Alteração disponível em ";
						if (diffDays > 0) msg += `${diffDays}d`;
						if (diffHours > 0) msg += `${diffHours}h`;
						if (diffMinutes > 0 && diffDays === 0) msg += `${diffMinutes}min`;
						setCooldownMessage(msg);
					} else {
						setCanChangeUsername(true);
						setCooldownMessage("");
					}
				} else {
					setCanChangeUsername(true);
					setCooldownMessage("");
				}


				if (subRes.ok) {
					setSubscription(await subRes.json());
				}
			} finally {
				setIsProfileLoading(false);
			}
		};
		load();
	}, [session]);

	const handleLogout = () => signOut();

	const handleDeleteAccount = async () => {
		if (!session?.user?.id) {
			return;
		}

		await fetch(`/api/profile/${session.user.id}`, { method: "DELETE" });
		signOut();
	};

	const selectedMode = isAutoMode ? "system" : theme;

	
	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 640);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	const validateBio = useCallback((bio: string): boolean => {
		if (bio.length > 150) {
			setBioValidationError("A biografia deve ter no máximo 150 caracteres.");
			return false;
		}
		setBioValidationError("");
		return true;
	}, []);

	const updateProfileText = useCallback(async (): Promise<UserProfile | null> => {
		const textChanged =
			profileData.name !== originalProfile.name ||
			profileData.username !== originalProfile.username ||
			profileData.bio !== originalProfile.bio;

		if (!(session?.user?.id && (textChanged || profileImageChanged))) return null;

		try {
			const res = await fetch(`/api/profile/${session.user.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profileData),
			});
			const data = await res.json();
			if (!res.ok) {
				if (res.status === 400 && data && typeof data.error === "string") {
					setValidationError(data.error);
				}
				throw new Error(data.error || "Falha ao atualizar");
			}
			return data as UserProfile;
		} catch {
			return null;
		}
	}, [session?.user?.id, profileData, originalProfile, profileImageChanged]);

	const validateUsername = (username: string): boolean => {
		if (!username.trim()) { setValidationError("O campo de nome de usuário não pode ficar vazio."); return false; }
		if (username.length < 3) { setValidationError("Nome de usuário deve ter pelo menos 3 caracteres."); return false; }
		if (username.length > 30) { setValidationError("Nome de usuário deve ter no máximo 30 caracteres."); return false; }
		const formatErr = getUsernameFormatError(username);
		if (formatErr) { setValidationError(formatErr); return false; }
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) { setValidationError("Este nome de usuário não está disponível."); return false; }
		setValidationError("");
		return true;
	};

	const checkUsernameAvailability = async (username: string) => {
		if (!username.trim() || username === originalProfile.username) {
			if (username === originalProfile.username) { setIsCheckingUsername(false); setValidationError(""); }
			return;
		}
		lastUsernameRequestedRef.current = username;
		setIsCheckingUsername(true);
		try {
			if (usernameCheckAbortRef.current) usernameCheckAbortRef.current.abort();
			const controller = new AbortController();
			usernameCheckAbortRef.current = controller;
			const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(normalizeUsernameForLookup(username))}`, { signal: controller.signal });
			const json = await res.json();
			if (username !== lastUsernameRequestedRef.current || username !== currentUsernameRef.current) return;
			if (json && json.available) setValidationError("");
			else setValidationError("Nome de usuário já está em uso");
		} catch (err: any) {
			if (err?.name === "AbortError") return;
			setValidationError("Erro ao verificar disponibilidade");
		} finally {
			setIsCheckingUsername(false);
			setIsTypingUsername(false);
		}
	};

	const uploadImage = async (file: File): Promise<string | null> => {
		if (!session?.user?.id) return null;
		setIsUploadingImage(true);
		const formData = new FormData();
		formData.append("file", file);
		formData.append("type", "profile");
		try {
			const res = await fetch(`/api/profile/${session.user.id}/upload?type=profile`, { method: "POST", body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Falha no upload");
			return data.url;
		} catch {
			setProfilePreview(originalProfileImageUrl);
			return null;
		} finally {
			setIsUploadingImage(false);
		}
	};

	const syncLocalProfile = (updatedUserData: UserProfile | null, newImageUrl: string | null) => {
		if (updatedUserData) {
			setOriginalProfile({ name: updatedUserData.name, username: updatedUserData.username, bio: updatedUserData.bio || "" });
			window.dispatchEvent(new CustomEvent("profileNameUpdated", { detail: { name: updatedUserData.name } }));
			window.dispatchEvent(new CustomEvent("profileUsernameUpdated", { detail: { username: updatedUserData.username } }));
			if (updatedUserData.image) window.dispatchEvent(new CustomEvent("profileImageUpdated", { detail: { imageUrl: updatedUserData.image } }));
			if (updatedUserData.username !== session?.user?.username) {
				update({ user: { ...session?.user, username: updatedUserData.username, name: updatedUserData.name, image: updatedUserData.image } });
			}
		} else {
			setOriginalProfile({ name: profileData.name, username: profileData.username, bio: profileData.bio });
		}
		if (newImageUrl) {
			setProfilePreview(newImageUrl);
			setOriginalProfileImageUrl(newImageUrl);
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
			window.dispatchEvent(new CustomEvent("profileImageUpdated", { detail: { imageUrl: newImageUrl } }));
		} else if (profileImageChanged) {
			setSelectedProfileFile(null);
			setProfileImageChanged(false);
		}
		setValidationError("");
	};

	const handleSaveProfile = async () => {
		const hasChanges = (profileData.name !== originalProfile.name || profileData.username !== originalProfile.username || profileData.bio !== originalProfile.bio) || profileImageChanged;
		if (!(session?.user?.id && hasChanges)) return;
		if (!validateUsername(profileData.username)) return;
		setLoadingProfile(true);
		let newImageUrl: string | null = null;
		if (selectedProfileFile) {
			newImageUrl = await uploadImage(selectedProfileFile);
			if (!newImageUrl) { setLoadingProfile(false); return; }
		}
		const updatedUserData = await updateProfileText();
		syncLocalProfile(updatedUserData, newImageUrl);
		setLoadingProfile(false);
		setIsEditModalOpen(false);
	};

	const handleCancelChanges = () => {
		setProfileData({ ...originalProfile });
		setProfilePreview(originalProfileImageUrl);
		setSelectedProfileFile(null);
		setProfileImageChanged(false);
		setValidationError("");
	};

	const handleProfileImageSave = (imageFile: File) => {
		setProfilePreview(URL.createObjectURL(imageFile));
		setSelectedProfileFile(imageFile);
		setProfileImageChanged(true);
	};

	const handleProfileImageRemove = () => {
		const defaultImageUrl = "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png";
		setProfilePreview(defaultImageUrl);
		setProfileData((prev) => ({ ...prev, image: defaultImageUrl }));
		setSelectedProfileFile(null);
		setProfileImageChanged(true);
	};

	const hasChanges = (profileData.name !== originalProfile.name || profileData.username !== originalProfile.username || profileData.bio !== originalProfile.bio) || profileImageChanged;

	const handleSensitiveProfileToggle = async (checked: boolean) => {
		if (!session?.user?.id) {
			return;
		}

		setIsSensitiveLoading(true);
		try {
			await fetch(`/api/profile/${session.user.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sensitiveProfile: checked }),
			});

			setSensitiveProfile(checked);
		} finally {
			setIsSensitiveLoading(false);
		}
	};

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-4 p-3 pb-24 sm:space-y-6 sm:p-6 sm:pb-8 lg:space-y-8 dark:text-white">
			<header className="space-y-1 sm:space-y-2">
				<h1 className="font-bold text-xl sm:text-2xl lg:text-3xl dark:text-white">
					Configurações
				</h1>
				<p className="text-muted-foreground text-xs sm:text-sm lg:text-base dark:text-zinc-400">
					Gerencie sua conta e preferências
				</p>
			</header>

			
			{/* Perfil */}
			<article>
				<Card className="shadow-none dark:bg-zinc-900">
					<CardContent className="space-y-6 pt-6">
						<div className="flex flex-col gap-4 sm:items-center md:flex-row">
							<div className="relative flex items-center justify-center">
								<div className={`h-26 w-26 overflow-hidden rounded-full bg-muted shadow-black/20 shadow-md md:h-24 md:w-24 ${isUploadingImage ? "opacity-50" : ""}`}>
									<Image alt="Foto de perfil" className="h-full w-full object-cover" height={96} key={profilePreview} src={profilePreview} width={96} />
									{isUploadingImage && (
										<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
											<SpinnerGap weight="regular" className="h-6 w-6 animate-spin text-white" />
										</div>
									)}
								</div>
								<BaseButton className="absolute right-0 bottom-0 rounded-full" disabled={isUploadingImage} onClick={() => setIsImageCropModalOpen(true)} size="icon" variant="white">
									<PencilSimple weight="regular" className="h-4 w-4" />
								</BaseButton>
							</div>
							<div className="flex-1 space-y-2 text-center md:text-start">
								<p className="font-semibold text-xl dark:text-white">{profileData.name || "Seu nome"}</p>
								<p className="text-muted-foreground dark:text-gray-300">
									<span className="text-muted-foreground/80 dark:text-gray-400">bionk.me/</span>
									{profileData.username || "username"}
								</p>
								<p className="text-sm dark:text-gray-200">{profileData.bio || "Bio"}</p>
							</div>
						</div>
						<div className="flex justify-center md:justify-end">
							<BaseButton onClick={() => { setIsEditingUsername(false); setIsEditModalOpen(true); }} variant="studio">
								Editar Perfil
							</BaseButton>
						</div>
					</CardContent>
				</Card>

				<ProfileImageCropModal currentImageUrl={profilePreview} isOpen={isImageCropModalOpen} onClose={() => setIsImageCropModalOpen(false)} onImageRemove={handleProfileImageRemove} onImageSave={handleProfileImageSave} />

				{isMobile ? (
					<BottomSheet onOpenChange={(open) => { setIsEditModalOpen(open); if (open) setIsEditingUsername(false); else handleCancelChanges(); }} open={isEditModalOpen}>
						<BottomSheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
							<DialogHeader><DialogTitle className="text-center">{isEditingUsername ? "Alterar nome de usuário" : "Editar Perfil"}</DialogTitle></DialogHeader>
							{isEditingUsername ? (
								<div className="mt-5 space-y-6">
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label className="mb-2 dark:text-white" htmlFor="edit-username">Novo nome de usuário</Label>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground dark:text-gray-400">bionk.me/</span>
												<div className="relative flex-1">
													<Input className={`${validationError ? "border-red-500 dark:border-red-400" : "text-zinc-700 dark:bg-zinc-700 dark:text-white"} w-full pr-10`} disabled={loadingProfile || isUploadingImage || !canChangeUsername} id="edit-username" maxLength={30} onChange={(e) => {
														const sanitizedUsername = sanitizeUsername(e.target.value);
														if (sanitizedUsername === profileData.username) return;
														setProfileData({ ...profileData, username: sanitizedUsername });
														currentUsernameRef.current = sanitizedUsername;
														if (usernameDebounceRef.current) { window.clearTimeout(usernameDebounceRef.current); usernameDebounceRef.current = null; }
														setIsTypingUsername(true);
														setIsCheckingUsername(true);
														usernameDebounceRef.current = window.setTimeout(() => {
															const ok = validateUsername(sanitizedUsername);
															if (ok) checkUsernameAvailability(sanitizedUsername);
															else { setIsCheckingUsername(false); setIsTypingUsername(false); }
														}, 500);
													}} placeholder="username" value={profileData.username} />
													{isCheckingUsername && <SpinnerGap weight="regular" className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 animate-spin text-muted-foreground" />}
												</div>
											</div>
											<p className="min-h-[1.25rem] text-red-500 text-sm">{validationError || " "}</p>
										</div>
										<div>
											<h4 className="mb-2 font-semibold text-black text-sm dark:text-white">Atenção ao alterar seu usuário:</h4>
											<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm dark:text-white">
												<li>O nome de usuário só pode ser trocado a cada 3 dias.</li>
												<li>O seu link de perfil (URL) mudará.</li>
												<li>Você precisará atualizar o link em todas as suas redes sociais.</li>
												<li>O seu QR Code será alterado.</li>
											</ul>
										</div>
									</div>
									<div className="flex justify-end gap-2">
										<BaseButton disabled={loadingProfile || isUploadingImage || isCheckingUsername || isTypingUsername || !!validationError || !profileData.username || profileData.username.length < 3 || profileData.username === originalProfile.username} fullWidth onClick={() => setIsEditingUsername(false)} variant="studio">Confirmar</BaseButton>
									</div>
								</div>
							) : (
								<>
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label className="dark:text-white" htmlFor="edit-name">Nome</Label>
											<Input className="text-zinc-700 dark:bg-zinc-700 dark:text-white" disabled={loadingProfile || isUploadingImage} id="edit-name" maxLength={44} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} placeholder="Seu nome de exibição" value={profileData.name} />
										</div>
										<div className="grid gap-1">
											<Label className="dark:text-white">Nome de usuário</Label>
											<div className="flex items-center justify-between ">
												<div className="flex items-center gap-1 overflow-hidden">
													<span className="text-muted-foreground dark:text-gray-400">bionk.me/</span>
													<span className="truncate font-medium dark:text-white">{profileData.username}</span>
												</div>
												<BaseButton className="h-8 px-3 text-xs" disabled={!canChangeUsername} onClick={() => { setValidationError(""); setIsCheckingUsername(false); setIsEditingUsername(true); }} size="sm">Alterar</BaseButton>
											</div>
											{!canChangeUsername && <p className="text-muted-foreground text-xs">{cooldownMessage}</p>}
										</div>
										<div className="grid gap-2">
											<Label className="dark:text-white" htmlFor="edit-bio">Biografia</Label>
											<Textarea className={`min-h-32 text-zinc-700 dark:bg-zinc-700 dark:text-white ${bioValidationError ? "border-red-500 dark:border-red-400" : ""}`} disabled={loadingProfile || isUploadingImage} id="edit-bio" maxLength={150} onChange={(e) => { setProfileData({ ...profileData, bio: e.target.value }); validateBio(e.target.value); }} placeholder="Fale um pouco sobre você" value={profileData.bio} />
											<div className="flex items-center justify-between">
												<p className="min-h-[1.25rem] text-red-500 text-sm">{bioValidationError || " "}</p>
												<p className="text-muted-foreground text-sm">{profileData.bio.length}/150</p>
											</div>
										</div>
									</div>
									<div className="flex justify-end gap-2 pt-2">
										<BaseButton disabled={loadingProfile || isUploadingImage || !!validationError || !hasChanges} fullWidth loading={loadingProfile || isUploadingImage} onClick={handleSaveProfile} variant="studio">Salvar</BaseButton>
									</div>
								</>
							)}
						</BottomSheetContent>
					</BottomSheet>
				) : (
					<Dialog onOpenChange={(open) => { setIsEditModalOpen(open); if (open) setIsEditingUsername(false); else handleCancelChanges(); }} open={isEditModalOpen}>
						<DialogContent className="w-full max-w-[90vw] rounded-3xl border bg-background p-6 shadow-xl sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
							<DialogHeader><DialogTitle className="text-center">{isEditingUsername ? "Alterar nome de usuário" : "Editar Perfil"}</DialogTitle></DialogHeader>
							{isEditingUsername ? (
								<div className="space-y-6">
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label className="dark:text-white" htmlFor="edit-username">Novo nome de usuário</Label>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground dark:text-gray-400">bionk.me/</span>
												<div className="relative flex-1">
													<Input className={`${validationError ? "border-red-500 dark:border-red-400" : "text-zinc-700 dark:bg-zinc-700 dark:text-white"} w-full pr-10`} disabled={loadingProfile || isUploadingImage || !canChangeUsername} id="edit-username" maxLength={30} onChange={(e) => {
														const sanitizedUsername = sanitizeUsername(e.target.value);
														if (sanitizedUsername === profileData.username) return;
														setProfileData({ ...profileData, username: sanitizedUsername });
														currentUsernameRef.current = sanitizedUsername;
														if (usernameDebounceRef.current) { window.clearTimeout(usernameDebounceRef.current); usernameDebounceRef.current = null; }
														setIsTypingUsername(true);
														setIsCheckingUsername(true);
														usernameDebounceRef.current = window.setTimeout(() => {
															const ok = validateUsername(sanitizedUsername);
															if (ok) checkUsernameAvailability(sanitizedUsername);
															else { setIsCheckingUsername(false); setIsTypingUsername(false); }
														}, 500);
													}} placeholder="username" value={profileData.username} />
													{isCheckingUsername && <SpinnerGap weight="regular" className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 animate-spin text-muted-foreground" />}
												</div>
											</div>
											<p className="min-h-[1.25rem] text-red-500 text-sm">{validationError || " "}</p>
										</div>
										<div>
											<h4 className="mb-2 font-semibold text-black text-sm dark:text-white">Atenção ao alterar seu usuário:</h4>
											<ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm dark:text-white">
												<li>O nome de usuário só pode ser trocado a cada 3 dias.</li>
												<li>O seu link de perfil (URL) mudará.</li>
												<li>Você precisará atualizar o link em todas as suas redes sociais.</li>
												<li>O seu QR Code será alterado.</li>
											</ul>
										</div>
									</div>
									<div className="flex justify-end gap-2">
										<BaseButton disabled={loadingProfile || isUploadingImage || isCheckingUsername || isTypingUsername || !!validationError || !profileData.username || profileData.username.length < 3 || profileData.username === originalProfile.username} fullWidth onClick={() => setIsEditingUsername(false)} variant="studio">Confirmar</BaseButton>
									</div>
								</div>
							) : (
								<>
									<div className="space-y-4">
										<div className="grid gap-1">
											<Label className="dark:text-white" htmlFor="edit-name">Nome</Label>
											<Input className="text-zinc-700 dark:bg-zinc-700 dark:text-white" disabled={loadingProfile || isUploadingImage} id="edit-name" maxLength={44} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} placeholder="Seu nome de exibição" value={profileData.name} />
										</div>
										<div className="grid gap-1">
											<Label className="dark:text-white">Nome de usuário</Label>
											<div className="flex items-center justify-between ">
												<div className="flex items-center gap-1 overflow-hidden">
													<span className="text-muted-foreground dark:text-gray-400">bionk.me/</span>
													<span className="truncate font-medium dark:text-white">{profileData.username}</span>
												</div>
												<BaseButton className="h-8 px-3 text-xs" disabled={!canChangeUsername} onClick={() => { setValidationError(""); setIsCheckingUsername(false); setIsEditingUsername(true); }} size="sm">Alterar</BaseButton>
											</div>
											{!canChangeUsername && <p className="text-muted-foreground text-xs">{cooldownMessage}</p>}
										</div>
										<div className="grid gap-2">
											<Label className="dark:text-white" htmlFor="edit-bio">Biografia</Label>
											<Textarea className={`min-h-32 text-zinc-700 dark:bg-zinc-700 dark:text-white ${bioValidationError ? "border-red-500 dark:border-red-400" : ""}`} disabled={loadingProfile || isUploadingImage} id="edit-bio" maxLength={150} onChange={(e) => { setProfileData({ ...profileData, bio: e.target.value }); validateBio(e.target.value); }} placeholder="Fale um pouco sobre você" value={profileData.bio} />
											<div className="flex items-center justify-between">
												<p className="min-h-[1.25rem] text-red-500 text-sm">{bioValidationError || " "}</p>
												<p className="text-muted-foreground text-sm">{profileData.bio.length}/150</p>
											</div>
										</div>
									</div>
									<div className="flex justify-end gap-2 pt-2">
										<BaseButton disabled={loadingProfile || isUploadingImage || !!validationError || !hasChanges} fullWidth loading={loadingProfile || isUploadingImage} onClick={handleSaveProfile} variant="studio">Salvar</BaseButton>
									</div>
								</>
							)}
						</DialogContent>
					</Dialog>
				)}
			</article>


			<article>
				<SubscriptionManagement subscription={subscription} />
			</article>

			{/* Tema */}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							Tema da Interface
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Escolha entre claro, escuro ou automático
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-3 sm:space-y-4">
						<RadioGroup
							className="flex flex-wrap gap-3 sm:gap-4"
							onValueChange={(v) => {
								if (v === "light") {
									setTheme("light");
								} else if (v === "dark") {
									setTheme("dark");
								} else {
									setAutoMode();
								}
							}}
							value={selectedMode}
						>
							{/* Light */}
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${
									selectedMode === "light"
										? "border-green-500"
										: "dark:border-zinc-700"
								}`}
								htmlFor="theme-light"
							>
								<div className="mb-2 overflow-hidden rounded-md border dark:border-zinc-700">
									<Image
										alt="Modo Claro"
										className="h-28 w-[224px] object-cover"
										height={112}
										src="/images/light-mode.png"
										width={224}
									/>
								</div>
								<div className="flex items-center gap-2">
									<RadioGroupItem id="theme-light" value="light" />
									<span className="text-sm dark:text-zinc-300">Claro</span>
								</div>
							</Label>

							{/* Dark */}
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${
									selectedMode === "dark"
										? "border-green-500"
										: "dark:border-zinc-700"
								}`}
								htmlFor="theme-dark"
							>
								<div className="mb-2 overflow-hidden rounded-md border dark:border-zinc-700">
									<Image
										alt="Modo Escuro"
										className="h-28 w-[224px] object-cover"
										height={112}
										src="/images/dark-mode.png"
										width={224}
									/>
								</div>
								<div className="flex items-center gap-2">
									<RadioGroupItem id="theme-dark" value="dark" />
									<span className="text-sm dark:text-zinc-300">Escuro</span>
								</div>
							</Label>

							{/* System */}
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${
									selectedMode === "system"
										? "border-green-500"
										: "dark:border-zinc-700"
								}`}
								htmlFor="theme-system"
							>
								<div className="mb-2 overflow-hidden rounded-md border dark:border-zinc-700">
									<Image
										alt="Automático"
										className="h-28 w-[224px] object-cover"
										height={112}
										src="/images/system-mode.png"
										width={224}
									/>
								</div>
								<div className="flex items-center gap-2">
									<RadioGroupItem id="theme-system" value="system" />
									<span className="text-sm dark:text-zinc-300">Automático</span>
								</div>
							</Label>
						</RadioGroup>

						<p className="text-muted-foreground text-sm dark:text-zinc-400">
							O modo automático segue o tema do sistema operacional.
						</p>
					</CardContent>
				</Card>
			</article>

			{/* Conta */}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="dark:text-white">
							Informações da Conta
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Gerencie suas informações
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-1">
							<p className="font-medium text-sm dark:text-white">Email</p>
							<p className="break-all text-muted-foreground text-sm dark:text-zinc-400">
								{profile.email}
							</p>
						</div>

						<div className="space-y-1">
							<p className="font-medium text-sm dark:text-white">Plano</p>
							<p className="text-muted-foreground text-sm capitalize dark:text-zinc-400">
								{isSubscriptionLoading ? "-" : subscriptionPlan || "free"}
							</p>
						</div>

						<Button
							className="rounded-full"
							onClick={handleLogout}
							variant="outline"
						>
							Sair da conta
						</Button>
					</CardContent>
				</Card>
			</article>

			{/* Arquivados */}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="dark:text-white">Links Arquivados</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Visualize e restaure links arquivados
						</CardDescription>
					</CardHeader>

                    <CardContent>
                        <Button className="rounded-full" onClick={() => router.push("/studio/configs/arquivados")} variant="outline">
                            Ver Links Arquivados
                        </Button>
                    </CardContent>
                </Card>
            </article>

			{/* Sensível */}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							Perfil Sensível
							<Switch
								checked={sensitiveProfile}
								className="ml-auto"
								disabled={isSensitiveLoading}
								onCheckedChange={handleSensitiveProfileToggle}
							/>
						</CardTitle>

						<CardDescription className="mt-2 dark:text-zinc-400">
							Se ativado, seu perfil exibe aviso antes de mostrar conteúdo.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<p className="text-muted-foreground text-xs dark:text-zinc-500">
							Use apenas se seu perfil pode não ser adequado para todos os
							públicos.
						</p>
					</CardContent>
				</Card>
			</article>

			{/* Alterar Email */}
			{isCredentialsUser && (
				<article>
					<Card className="dark:border-zinc-700 dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="dark:text-white">Alterar E-mail</CardTitle>
							<CardDescription className="dark:text-zinc-400">
								Atualize o e-mail associado
							</CardDescription>
						</CardHeader>

						<CardContent>
							<Link href="/profile/change-email">
								<Button className="rounded-full" variant="outline">
									Alterar E-mail
								</Button>
							</Link>
						</CardContent>
					</Card>
				</article>
			)}

			{/* Alterar Senha */}
			{isCredentialsUser && (
				<article>
					<Card className="dark:border-zinc-700 dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="dark:text-white">Alterar Senha</CardTitle>
							<CardDescription className="dark:text-zinc-400">
								Atualize sua senha
							</CardDescription>
						</CardHeader>

						<CardContent>
							<Link href="/profile/change-password">
								<Button className="rounded-full" variant="outline">
									Alterar Senha
								</Button>
							</Link>
						</CardContent>
					</Card>
				</article>
			)}

			{/* Excluir Conta */}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="text-destructive dark:text-red-500">
							Excluir Conta
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Exclui permanentemente seus dados
						</CardDescription>
					</CardHeader>

					<CardContent>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="rounded-full" variant="destructive">
									Excluir Conta
								</Button>
							</AlertDialogTrigger>

							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
									<AlertDialogDescription>
										A exclusão da conta remove permanentemente todos os dados
										armazenados, sem possibilidade de recuperação.
									</AlertDialogDescription>
								</AlertDialogHeader>

								<AlertDialogFooter>
									<AlertDialogCancel asChild>
										<Button className="rounded-full" variant="outline">
											Cancelar
										</Button>
									</AlertDialogCancel>
									<Button
										className="rounded-full"
										onClick={handleDeleteAccount}
										variant="destructive"
									>
										Excluir permanentemente
									</Button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardContent>
				</Card>
			</article>

        </div>
    );
}

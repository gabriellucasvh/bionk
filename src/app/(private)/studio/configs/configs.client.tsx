"use client";

import {
	Archive,
	CreditCard,
	EyeOff,
	HelpCircle,
	Lock,
	LogOut,
	Mail,
	SunMoon,
	Trash2,
	User,
	XOctagon,
	// RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import {
	AlertDialog,
	AlertDialogAction,
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
import ArchivedLinksModal from "./components/configs.ArchiveLinksModal";

// (Troca de plano desativada) Dialog imports removidos

// (Troca de plano desativada) Select imports removidos
// (Troca de plano desativada) Label import removido

type Profile = { email: string };
type SubscriptionDetails = {
	isSubscribed: boolean;
	plan?: string;
	status?: string;
	renewsOn?: string;
	paymentMethod?: { brand: string; lastFour: string };
};

function CancelSubscriptionButton() {
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [showCancelDialog, setShowCancelDialog] = useState(false);

	const { refreshSubscriptionPlan } = useSubscription();

	const handleCancelConfirm = async () => {
		setIsLoading(true);
		setError("");
		setMessage("");
		setShowCancelDialog(false);
		try {
			const res = await fetch("/api/stripe/customer-portal", {
				method: "POST",
			});
			const data = await res.json();
			if (!(res.ok && data?.url)) {
				throw new Error(data?.error || "Falha ao abrir o Customer Portal");
			}
			// Redireciona o usuário para o Customer Portal da Stripe
			window.location.href = data.url;
			// Opcionalmente atualiza estado local após retorno
			await refreshSubscriptionPlan();
		} catch (err: any) {
			console.error("Erro ao cancelar assinatura:", err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="mt-4">
			<AlertDialog onOpenChange={setShowCancelDialog} open={showCancelDialog}>
				<AlertDialogTrigger asChild>
					<Button
						className="w-full text-red-800 hover:text-red-600 sm:w-auto dark:border-zinc-600 dark:text-red-400 dark:hover:text-red-300"
						disabled={isLoading}
						size="sm"
						variant="outline"
					>
						<XOctagon className="mr-2 h-4 w-4" />
						{isLoading ? "Cancelando..." : "Cancelar Assinatura"}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent className="dark:border-zinc-700 dark:bg-zinc-800">
					<AlertDialogHeader>
						<AlertDialogTitle className="dark:text-white">
							Cancelar Assinatura
						</AlertDialogTitle>
						<AlertDialogDescription className="dark:text-zinc-400">
							Você tem certeza? Você será levado ao Customer Portal para
							gerenciar ou cancelar sua assinatura.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700"
							disabled={isLoading}
							onClick={handleCancelConfirm}
						>
							{isLoading ? "Cancelando..." : "Sim, Cancelar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			{message && (
				<p className="mt-2 text-green-600 text-sm dark:text-green-400">
					{message}
				</p>
			)}
			{error && (
				<p className="mt-2 text-red-600 text-sm dark:text-red-400">{error}</p>
			)}
		</div>
	);
}

function UpgradeSubscriptionCard() {
	return (
		<div>
			<Card className="relative animate-gradient-x overflow-hidden border-0 bg-gradient-to-br from-cyan-500 via-green-500 to-teal-500 shadow-2xl">
				{/* shimmer */}
				<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* gradiente preto para transparente */}
				<div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 to-transparent" />

				<CardHeader className="relative z-10">
					<CardTitle className="flex items-center gap-3 font-bold text-white text-xl">
						Desbloqueie o Poder PRO!
					</CardTitle>
					<CardDescription className="text-base text-green-50/90 leading-relaxed">
						Você está a um passo da{" "}
						<span className="font-semibold text-white">
							experiência completa
						</span>
						. Junte-se aos criadores de elite e transforme sua presença digital.
					</CardDescription>
				</CardHeader>

				<CardContent className="relative z-10 mb-2">
					<Link
						className="group relative w-full transform overflow-hidden rounded-full bg-avocado-400 px-8 py-3 font-medium text-base text-green-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-avocado-500 hover:shadow-xl"
						href="/planos"
						passHref
					>
						Fazer Upgrade
					</Link>
				</CardContent>
			</Card>

			<Separator className="my-4" />
		</div>
	);
}

// --- NOVO COMPONENTE PARA RENDERIZAÇÃO LIMPA ---
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
						<CreditCard className="h-5 w-5" />
						Gerenciar Assinatura
					</CardTitle>
					<CardDescription className="dark:text-zinc-400">
						Visualize os detalhes do seu plano e forma de pagamento.
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
					{/* Removido PlanChangeButton */}
					<CancelSubscriptionButton />
				</CardContent>
			</Card>
		);
	}

	// Default para status 'cancelled' ou outros
	return (
		<Card className="dark:border-zinc-700 dark:bg-zinc-800">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive dark:text-red-400">
					<XOctagon className="h-5 w-5" />
					Assinatura Cancelada
				</CardTitle>
				<CardDescription className="dark:text-zinc-400">
					Sua assinatura não está mais ativa. Para reativar, escolha um novo
					plano.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Link href="/planos" passHref>
					<Button className="w-full sm:w-auto" variant="outline">
						Ver Planos
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

export default function ConfigsClient() {
	const { data: session } = useSession();
	const { theme, setTheme, isAutoMode, setAutoMode } = useTheme();
	const { subscriptionPlan, isLoading: isSubscriptionLoading } =
		useSubscription();
	const isCredentialsUser = session?.user?.isCredentialsUser === true;
	const [profile, setProfile] = useState<Profile>({ email: "" });
	const [isProfileLoading, setIsProfileLoading] = useState(true);
	const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
		null
	);
	const [sensitiveProfile, setSensitiveProfile] = useState(false);
	const [isSensitiveLoading, setIsSensitiveLoading] = useState(false);

	useEffect(() => {
		const fetchInitialData = async () => {
			if (!session?.user?.id) {
				return;
			}
			try {
				const [profileRes, subRes] = await Promise.all([
					fetch("/api/profile"),
					fetch("/api/subscription-details"),
				]);
				const profileData = await profileRes.json();
				setProfile({ email: profileData.email || session.user.email || "" });
				setSensitiveProfile(profileData.sensitiveProfile);
				const subData = await subRes.json();
				if (subRes.ok) {
					setSubscription(subData);
				}
			} catch {
				setProfile({ email: session.user.email || "" });
			} finally {
				setIsProfileLoading(false);
			}
		};
		fetchInitialData();
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
	const handleModeChange = (value: string) => {
		if (value === "light") {
			setTheme("light");
			return;
		}
		if (value === "dark") {
			setTheme("dark");
			return;
		}
		if (value === "system") {
			setAutoMode();
			return;
		}
	};

	const handleSensitiveProfileToggle = async (checked: boolean) => {
		if (!session?.user?.id) {
			return;
		}

		setIsSensitiveLoading(true);
		try {
			const response = await fetch(`/api/profile/${session.user.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ sensitiveProfile: checked }),
			});

			if (response.ok) {
				setSensitiveProfile(checked);
			}
		} catch (error) {
			console.error("Erro ao atualizar perfil sensível:", error);
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

			<article>
				<SubscriptionManagement subscription={subscription} />
			</article>

			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<SunMoon className="h-5 w-5" />
							Tema da Interface
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Escolha entre modo claro, escuro ou automático
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 sm:space-y-4">
						<RadioGroup
							className="flex flex-wrap gap-3 sm:gap-4"
							onValueChange={handleModeChange}
							value={selectedMode}
						>
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${selectedMode === "light" ? "border-green-500" : "dark:border-zinc-700"}`}
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
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${selectedMode === "dark" ? "border-green-500" : "dark:border-zinc-700"}`}
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
							<Label
								className={`group flex cursor-pointer flex-col items-start rounded-lg border p-2 transition-colors ${selectedMode === "system" ? "border-green-500" : "dark:border-zinc-700"}`}
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
							O modo automático segue a preferência do seu sistema operacional.
						</p>
					</CardContent>
				</Card>
			</article>

			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<User className="h-5 w-5" />
							Informações da Conta
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Gerencie suas informações de conta e opções de login
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
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
							<div className="flex justify-start">
								<Button
									className="w-auto"
									onClick={handleLogout}
									size="sm"
									variant="outline"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sair da conta
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</article>
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<Archive className="h-5 w-5" />
							Links Arquivados
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Visualize e restaure links que você arquivou
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							className="w-full sm:w-auto"
							onClick={() => setIsArchivedModalOpen(true)}
							variant="outline"
						>
							Ver Links Arquivados
						</Button>
					</CardContent>
				</Card>
			</article>

			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<EyeOff className="h-5 w-5" />
							Perfil Sensível
							<Switch
								checked={sensitiveProfile}
								className="ml-auto"
								disabled={isSensitiveLoading}
								onCheckedChange={handleSensitiveProfileToggle}
							/>
						</CardTitle>
						<CardDescription className="mt-2 dark:text-zinc-400">
							Se ativado, seu perfil exibirá um aviso antes que outros usuários
							vejam seu conteúdo.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-xs dark:text-zinc-500">
							Use esta opção apenas se você acredita que seu perfil pode não ser
							apropriado para todos os públicos.
						</p>
					</CardContent>
				</Card>
			</article>

			{isCredentialsUser && (
				<article>
					<Card className="dark:border-zinc-700 dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 dark:text-white">
								<Mail className="h-5 w-5" />
								Alterar E-mail
							</CardTitle>
							<CardDescription className="dark:text-zinc-400">
								Atualize o e-mail associado à sua conta
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/profile/change-email">
								<Button className="w-full sm:w-auto" variant="outline">
									Alterar E-mail
								</Button>
							</Link>
						</CardContent>
					</Card>
				</article>
			)}
			{isCredentialsUser && (
				<article>
					<Card className="dark:border-zinc-700 dark:bg-zinc-900">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 dark:text-white">
								<Lock className="h-5 w-5" />
								Alterar Senha
							</CardTitle>
							<CardDescription className="dark:text-zinc-400">
								Atualize sua senha de acesso
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Link href="/profile/change-password">
								<Button className="w-full sm:w-auto" variant="outline">
									Alterar Senha
								</Button>
							</Link>
						</CardContent>
					</Card>
				</article>
			)}
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive dark:text-red-500">
							<Trash2 className="h-5 w-5" />
							Excluir Conta
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Exclua permanentemente sua conta e todos os seus dados
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									className="w-auto dark:bg-red-500"
									variant="destructive"
								>
									Excluir Conta
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="mx-auto w-[calc(100vw-2rem)] max-w-md sm:mx-auto sm:w-full dark:border-zinc-700 dark:bg-zinc-800">
								<AlertDialogHeader className="space-y-2">
									<AlertDialogTitle className="text-base sm:text-lg dark:text-white">
										Tem certeza?
									</AlertDialogTitle>
									<AlertDialogDescription className="text-xs sm:text-sm dark:text-zinc-400">
										Esta ação não pode ser desfeita. Sua conta e dados serão
										removidos permanentemente.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
									<AlertDialogCancel className="w-full text-xs sm:w-auto sm:text-sm">
										Cancelar
									</AlertDialogCancel>
									<AlertDialogAction
										className="w-full bg-red-500 text-white text-xs sm:w-auto sm:text-sm"
										onClick={handleDeleteAccount}
									>
										Sim, excluir minha conta
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardContent>
				</Card>
			</article>
			<Separator />
			<article>
				<Card className="dark:border-zinc-700 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 dark:text-white">
							<HelpCircle className="h-5 w-5" />
							Central de Ajuda
						</CardTitle>
						<CardDescription className="dark:text-zinc-400">
							Acesse nossa documentação e perguntas frequentes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link
							className="h-9 rounded-lg border bg-background px-4 py-2 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground has-[>svg]:px-3 dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
							href="https://ajuda.bionk.me"
							passHref
							rel="noopener noreferrer"
							target="_blank"
						>
							Acessar Central de Ajuda
						</Link>
					</CardContent>
				</Card>
			</article>

			<ArchivedLinksModal
				isOpen={isArchivedModalOpen}
				onClose={() => setIsArchivedModalOpen(false)}
			/>
		</div>
	);
}

// Troca de plano desativada; componente PlanChangeButton removido temporariamente

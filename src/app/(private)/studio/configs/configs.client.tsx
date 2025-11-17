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
import ArchivedLinksModal from "./components/configs.ArchiveLinksModal";

// Tipos
type Profile = { email: string };
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
		const load = async () => {
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
						<Button
							className="rounded-full"
							onClick={() => setIsArchivedModalOpen(true)}
							variant="outline"
						>
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

			<ArchivedLinksModal
				isOpen={isArchivedModalOpen}
				onClose={() => setIsArchivedModalOpen(false)}
			/>
		</div>
	);
}

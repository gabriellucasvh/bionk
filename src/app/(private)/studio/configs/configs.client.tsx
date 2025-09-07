"use client";

import {
	Archive,
	CreditCard,
	HelpCircle,
	Lock,
	LogOut,
	Mail,
	Trash2,
	User,
	XOctagon,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSubscription } from "@/providers/subscriptionProvider";
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
import { Separator } from "@/components/ui/separator";
import ArchivedLinksModal from "./components/configs.ArchiveLinksModal";

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
			console.log('Iniciando cancelamento da assinatura...');
			
			const response = await fetch("/api/mercadopago/cancel-subscription", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			
			console.log('Response status:', response.status);
			console.log('Response URL:', response.url);
			
			const data = await response.json();
			console.log('Response data:', data);
			
			if (!response.ok) {
				throw new Error(data.details || data.error || "Falha ao cancelar.");
			}
			
			setMessage(data.message);
			// Atualiza o subscription plan no contexto
			await refreshSubscriptionPlan();
			setTimeout(() => window.location.reload(), 2000);
		} catch (err: any) {
			console.error('Erro ao cancelar assinatura:', err);
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
						className="w-full text-red-800 hover:text-red-600 sm:w-auto"
						disabled={isLoading}
						size="sm"
						variant="outline"
					>
						<XOctagon className="mr-2 h-4 w-4" />
						{isLoading ? "Cancelando..." : "Cancelar Assinatura"}
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
						<AlertDialogDescription>
							Você tem certeza? Sua assinatura será cancelada e seus benefícios
							removidos no final do ciclo atual.
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
			{message && <p className="mt-2 text-green-600 text-sm">{message}</p>}
			{error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
		</div>
	);
}

function UpgradeSubscriptionCard() {
	return (
		<div>
			<Card className="relative animate-gradient-x overflow-hidden border-0 bg-gradient-to-br from-yellow-500 via-purple-500 to-blue-500 shadow-2xl">
				{/* shimmer */}
				<div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				{/* gradiente preto para transparente */}
				<div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 to-transparent" />

				<CardHeader className="relative z-10">
					<CardTitle className="flex items-center gap-3 font-bold text-white text-xl">
						Desbloqueie o Poder Premium!
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
						className="group relative w-full transform overflow-hidden rounded-xl bg-lime-400 px-8 py-3 font-medium text-base text-green-800 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-lime-500 hover:shadow-xl"
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
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Gerenciar Assinatura
					</CardTitle>
					<CardDescription>
						Visualize os detalhes do seu plano e forma de pagamento.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
						<div className="space-y-1">
							<p className="font-medium text-sm">Plano Atual</p>
							<p className="text-muted-foreground text-sm capitalize">
								{subscription.plan}
							</p>
						</div>
						<div className="space-y-1">
							<p className="font-medium text-sm">Próxima Cobrança</p>
							<p className="text-muted-foreground text-sm">
								{subscription.renewsOn
									? new Date(subscription.renewsOn).toLocaleDateString("pt-BR")
									: "-"}
							</p>
						</div>
					</div>
					{/* Seção de pagamento removida por enquanto, pois os dados não estão disponíveis */}
					<Separator />
					<CancelSubscriptionButton />
				</CardContent>
			</Card>
		);
	}

	// Default para status 'cancelled' ou outros
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<XOctagon className="h-5 w-5" />
					Assinatura Cancelada
				</CardTitle>
				<CardDescription>
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
	const isCredentialsUser = session?.user?.isCredentialsUser === true;
	const [profile, setProfile] = useState<Profile>({ email: "" });
	const [isProfileLoading, setIsProfileLoading] = useState(true);
	const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
	const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
		null
	);

	useEffect(() => {
		const fetchInitialData = async () => {
			if (!session?.user?.id) {
				return;
			}
			try {
				const [profileRes, subRes] = await Promise.all([
					fetch(`/api/profile/${session.user.id}`),
					fetch("/api/subscription-details"),
				]);
				const profileData = await profileRes.json();
				setProfile({ email: profileData.email || session.user.email || "" });
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

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 p-4 pb-20 sm:p-6 sm:pb-8 lg:space-y-8">
			<header className="space-y-2">
				<h1 className="font-bold text-2xl sm:text-3xl">Configurações</h1>
				<p className="text-muted-foreground text-sm sm:text-base">
					Gerencie sua conta e preferências
				</p>
			</header>

			<article>
				<SubscriptionManagement subscription={subscription} />
			</article>

			<article>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Informações da Conta
						</CardTitle>
						<CardDescription>
							Gerencie suas informações de conta e opções de login
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-1">
								<p className="font-medium text-sm">Email</p>
								<p className="break-all text-muted-foreground text-sm">
									{profile.email}
								</p>
							</div>
							<div className="flex justify-start">
								<Button
									className="w-full sm:w-auto"
									onClick={handleLogout}
									size="sm"
									variant="outline"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sair
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</article>
			<article>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Archive className="h-5 w-5" />
							Links Arquivados
						</CardTitle>
						<CardDescription>
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
			{isCredentialsUser && (
				<article>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mail className="h-5 w-5" />
								Alterar E-mail
							</CardTitle>
							<CardDescription>
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
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lock className="h-5 w-5" />
								Alterar Senha
							</CardTitle>
							<CardDescription>Atualize sua senha de acesso</CardDescription>
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
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<Trash2 className="h-5 w-5" />
							Excluir Conta
						</CardTitle>
						<CardDescription>
							Exclua permanentemente sua conta e todos os seus dados
						</CardDescription>
					</CardHeader>
					<CardContent>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button className="w-full sm:w-auto" variant="destructive">
									Excluir Conta
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="mx-4 max-w-md">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-lg">
										Tem certeza?
									</AlertDialogTitle>
									<AlertDialogDescription className="text-sm">
										Esta ação não pode ser desfeita. Sua conta e dados serão
										removidos permanentemente.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
									<AlertDialogCancel className="w-full sm:w-auto">
										Cancelar
									</AlertDialogCancel>
									<AlertDialogAction
										className="w-full bg-destructive text-red-100 sm:w-auto"
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
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HelpCircle className="h-5 w-5" />
							Central de Ajuda
						</CardTitle>
						<CardDescription>
							Acesse nossa documentação e perguntas frequentes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/ajuda" passHref>
							<Button className="w-full text-sm sm:text-base" variant="outline">
								Acessar Central de Ajuda
							</Button>
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

"use client";

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
import {
	Archive,
	CreditCard,
	HelpCircle,
	Lock,
	LogOut,
	Mail,
	Star,
	Trash2,
	User,
	XOctagon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
	const handleCancel = async () => {
		setIsLoading(true);
		setError("");
		setMessage("");
		if (
			!confirm(
				"Você tem certeza? Sua assinatura será cancelada e seus benefícios removidos no final do ciclo atual."
			)
		) {
			setIsLoading(false);
			return;
		}
		try {
			const response = await fetch("/api/mercadopago/cancel-subscription", {
				method: "POST",
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.details || "Falha ao cancelar.");
			}
			setMessage(data.message);
			setTimeout(() => window.location.reload(), 2000);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<div className="mt-4">
			<Button
				disabled={isLoading}
				onClick={handleCancel}
				size="sm"
				variant="destructive"
			>
				<XOctagon className="mr-2 h-4 w-4" />
				{isLoading ? "Cancelando..." : "Cancelar Assinatura"}
			</Button>
			{message && <p className="mt-2 text-green-600 text-sm">{message}</p>}
			{error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
		</div>
	);
}

function UpgradeSubscriptionCard() {
	return (
		<Card className="border-green-500 bg-green-50/50">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-green-800">
					<Star className="h-5 w-5" />
					Faça um Upgrade no seu Plano!
				</CardTitle>
				<CardDescription>
					Você está no plano Free. Desbloqueie recursos avançados e leve sua
					página para o próximo nível.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Link href="/planos" passHref>
					<Button className="w-full bg-green-600 hover:bg-green-700">
						Ver Planos
					</Button>
				</Link>
			</CardContent>
		</Card>
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
					<div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
						<div>
							<p className="font-medium text-sm">Plano Atual</p>
							<p className="text-muted-foreground text-sm capitalize">
								{subscription.plan}
							</p>
						</div>
						<div>
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
					<Button variant="outline">Ver Planos</Button>
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
		<main className="container mx-auto min-h-dvh max-w-1/2 space-y-8 p-5">
			<header>
				<h1 className="font-bold text-3xl">Configurações</h1>
				<p className="mt-1 text-muted-foreground">
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
						<div className="flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
							<div className="space-y-1">
								<p className="font-medium text-sm">Email</p>
								<p className="text-muted-foreground text-sm">{profile.email}</p>
							</div>
							<Button onClick={handleLogout} size="sm" variant="outline">
								<LogOut className="mr-2 h-4 w-4" />
								Sair
							</Button>
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
								<Button variant="outline">Alterar E-mail</Button>
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
								<Button variant="outline">Alterar Senha</Button>
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
								<Button variant="destructive">Excluir Conta</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Tem certeza?</AlertDialogTitle>
									<AlertDialogDescription>
										Esta ação não pode ser desfeita. Sua conta e dados serão
										removidos permanentemente.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancelar</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive text-red-100"
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
							<Button className="w-full" variant="outline">
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
		</main>
	);
}

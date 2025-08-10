// components/ConfigsClient.tsx
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
	HelpCircle,
	Lock,
	LogOut,
	Mail,
	Trash2,
	User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ArchivedLinksModal from "./components/configs.ArchiveLinksModal";

type Profile = {
	email: string;
};

export default function ConfigsClient() {
	const { data: session } = useSession();
	const isCredentialsUser = session?.user?.isCredentialsUser === true;
	const [profile, setProfile] = useState<Profile>({ email: "" });
	const [isProfileLoading, setIsProfileLoading] = useState(true);
	const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!session?.user?.id) {
				return;
			}
			try {
				const res = await fetch(`/api/profile/${session.user.id}`);
				const data = await res.json();
				const email =
					data.email || data.user?.email || session.user.email || "";
				setProfile({ email });
			} catch {
				setProfile({ email: session.user.email || "" });
			} finally {
				setIsProfileLoading(false);
			}
		};
		fetchProfile();
	}, [session]);

	const handleLogout = () => signOut();

	const handleDeleteAccount = async () => {
		if (!session?.user?.id) {
			return;
		}
		const res = await fetch(`/api/profile/${session.user.id}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			throw new Error("Erro ao excluir a conta");
		}
		signOut();
	};

	if (isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<main className="container max-w-4xl space-y-8 p-5">
			<header>
				<h1 className="font-bold text-3xl">Configurações</h1>
				<p className="mt-1 text-muted-foreground">
					Gerencie sua conta e preferências
				</p>
			</header>

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
						{isCredentialsUser ? (
							<Link href="/profile/change-email" passHref>
								<Button variant="outline">Alterar E-mail</Button>
							</Link>
						) : (
							<Button disabled variant="outline">
								Alterar E-mail
							</Button>
						)}
						{!isCredentialsUser && (
							<p className="mt-2 text-muted-foreground text-sm">
								Opção indisponível para login via provedor externo.
							</p>
						)}
					</CardContent>
				</Card>
			</article>

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
						{isCredentialsUser ? (
							<Link href="/profile/change-password" passHref>
								<Button variant="outline">Alterar Senha</Button>
							</Link>
						) : (
							<Button disabled variant="outline">
								Alterar Senha
							</Button>
						)}
						{!isCredentialsUser && (
							<p className="mt-2 text-muted-foreground text-sm">
								Opção indisponível para login via provedor externo.
							</p>
						)}
					</CardContent>
				</Card>
			</article>

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

			<section className="grid gap-6 md:grid-cols-2">
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

				{/* ======= Manutenção ======= */}

				{/* <article>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Enviar Feedback
              </CardTitle>
              <CardDescription>
                Envie sugestões ou reporte problemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/feedback" passHref>
                <Button variant="outline" className="w-full">
                  Enviar Feedback
                </Button>
              </Link>
            </CardContent>
          </Card>
        </article> */}
			</section>

			{/* ======= Manutenção ======= */}

			{/* <article>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Atualizações
            </CardTitle>
            <CardDescription>
              Fique por dentro das novidades e atualizações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/updates" passHref>
              <Button variant="outline">Ver Atualizações</Button>
            </Link>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Versão atual: 1.0.0</span>
            </div>
          </CardFooter>
        </Card>
      </article> */}

			<ArchivedLinksModal
				isOpen={isArchivedModalOpen}
				onClose={() => setIsArchivedModalOpen(false)}
			/>
		</main>
	);
}

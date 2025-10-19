"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BannedUserWarningProps {
	username: string;
	banReason?: string | null;
	bannedAt?: Date | null;
}

export default function BannedUserWarning({
	username,
	banReason,
	bannedAt,
}: BannedUserWarningProps) {
	const router = useRouter();

	const formattedDate = bannedAt
		? new Date(bannedAt).toLocaleDateString("pt-BR")
		: "Data não disponível";

	const handleGoBack = () => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-white px-4">
			<div className="w-full max-w-md text-center">
				<div className="mb-6">
					<Image
						alt="Bionk Logo"
						className="mb-3 inline-block h-20 w-auto"
						height={28}
						priority
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
						width={110}
					/>
					<h1 className="mb-4 font-bold text-2xl text-zinc-900">
						Usuário Suspenso
					</h1>
					<p className="text-zinc-600">
						O perfil de <strong>@{username}</strong> foi suspenso por violação
						dos nossos termos de uso.
					</p>
				</div>

				<div className="mb-6 rounded-lg bg-zinc-50 p-4">
					<div className="mb-2 text-sm text-zinc-700">
						<strong>Motivo:</strong> {banReason || "Violação dos termos de uso"}
					</div>
					<div className="text-sm text-zinc-700">
						<strong>Data da suspensão:</strong> {formattedDate}
					</div>
				</div>

				<div className="mb-6 text-sm text-zinc-600">
					<p className="mb-3">
						Se você é o proprietário desta conta e acredita que isso foi um
						erro, entre em contato conosco.
					</p>
					<p>
						Caso contrário, este perfil pode conter conteúdo que viola nossas{" "}
						<Link
							className="text-blue-600 hover:underline"
							href="/termos"
							rel="noopener noreferrer"
							target="_blank"
						>
							diretrizes da comunidade
						</Link>
						.
					</p>
				</div>

				<div className="space-y-3">
					<Link
						className="inline-block w-full rounded-full bg-black px-4 py-2 text-white transition-colors hover:bg-zinc-800"
						href="/contato"
					>
						Entrar em Contato
					</Link>
					<button
						className="w-full rounded-full bg-zinc-200 px-4 py-2 text-zinc-800 transition-colors hover:bg-zinc-300"
						onClick={handleGoBack}
						type="button"
					>
						Voltar
					</button>
				</div>
			</div>
		</div>
	);
}

"use client";

import { CheckCircle, Copy } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useState } from "react";

function SuccessContent() {
	const searchParams = useSearchParams();
	const username = searchParams.get("username") || "";
	const { data: session } = useSession();
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(`https://bionk.me/${username}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
			<div className="flex w-full max-w-lg flex-col items-center text-center">
				<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm dark:bg-green-900/30 dark:text-green-400">
					<CheckCircle className="h-10 w-10" weight="fill" />
				</div>

				<h1 className="mb-3 font-bold text-3xl text-zinc-900 tracking-tight md:text-4xl dark:text-white">
					Seu novo espaço está pronto!
				</h1>

				<p className="mb-8 text-zinc-500 dark:text-zinc-400">
					A página <strong>@{username}</strong> foi criada com sucesso e já está
					vinculada de forma segura à sua conta principal (
					{session?.user?.email}).
				</p>

				<div className="mb-10 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center justify-between p-5">
						<div className="flex flex-col items-start truncate">
							<span className="mb-1 font-bold text-[11px] text-zinc-400 uppercase tracking-wider">
								Seu link oficial
							</span>
							<span className="truncate font-semibold text-lg text-zinc-800 dark:text-zinc-100">
								bionk.me/{username}
							</span>
						</div>
						<button
							className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 font-semibold text-sm text-zinc-700 transition-colors hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
							onClick={handleCopy}
							type="button"
						>
							{copied ? (
								"Copiado!"
							) : (
								<>
									<Copy weight="bold" />
									Copiar
								</>
							)}
						</button>
					</div>
					<div className="bg-zinc-50 p-4 text-left text-sm text-zinc-500 leading-relaxed dark:bg-zinc-900/50">
						<strong>Dica:</strong> Você não precisa de uma nova senha. Alterne
						entre suas páginas a qualquer momento usando o menu no canto
						inferior da barra lateral do Studio.
					</div>
				</div>

				<Link
					className="w-full rounded-2xl bg-black py-4 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-black"
					href="/studio"
				>
					Personalizar minha página
				</Link>
			</div>
		</div>
	);
}

export default function SuccessPage() {
	return (
		<Suspense
			fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}
		>
			<SuccessContent />
		</Suspense>
	);
}

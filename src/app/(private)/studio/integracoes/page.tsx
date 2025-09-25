import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Bionk Integrações",
	description: "Conecte sua conta Bionk com suas ferramentas favoritas",
};

export default function Integracoes() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-green-950">
			<div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
				<div className="mx-auto max-w-2xl space-y-8">
					<div className="space-y-4">
						<h1 className="font-bold text-4xl text-white md:text-6xl">
							Integrações
						</h1>
					</div>

					<div className="space-y-6 text-lime-400">
						<p className="font-medium text-xl md:text-2xl">
							Em Desenvolvimento
						</p>
						<p className="text-lg leading-relaxed">
							Em breve você poderá conectar sua conta Bionk com suas ferramentas
							favoritas! Integrações com redes sociais, analytics, automação e
							muito mais estão chegando.
						</p>
					</div>

					<div className="rounded-2xl border border-green-700 bg-green-800/80 p-6 shadow-lg backdrop-blur-sm">
						<h3 className="mb-3 font-semibold text-lg text-white">
							Que integração você gostaria de ver?
						</h3>
						<p className="mb-4 text-lime-400">
							Sua opinião é importante para definirmos as próximas integrações!
						</p>
						<Link
							className="inline-flex text-white underline decoration-lime-400 decoration-wavy underline-offset-6"
							href="mailto:sugestoes@bionk.com.br"
							rel="noopener noreferrer"
							target="_blank"
						>
							ideias@bionk.me
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}

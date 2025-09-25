import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Bionk Para Criadores",
	description: "Ferramentas e recursos especiais para criadores de conteúdo",
};

export default function Criadores() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-green-950">
			<div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
				<div className="mx-auto max-w-2xl space-y-8">
					<div className="space-y-4">
						<h1 className="font-bold text-4xl text-white md:text-6xl">
							Para Criadores
						</h1>
					</div>

					<div className="space-y-6 text-lime-400">
						<p className="font-medium text-xl md:text-2xl">
							Em Desenvolvimento
						</p>
						<p className="text-lg leading-relaxed">
							Estamos trabalhando em ferramentas incríveis para criadores de
							conteúdo! Esta seção em breve terá recursos especiais para
							redes sociais, analytics avançados e muito mais.
						</p>
					</div>

					<div className="rounded-2xl border border-green-700 bg-green-800/80 p-6 shadow-lg backdrop-blur-sm">
						<h3 className="mb-3 font-semibold text-lg text-white">
							Tem sugestões?
						</h3>
						<p className="mb-4 text-lime-400">
							Queremos ouvir suas ideias para tornar esta seção ainda melhor!
						</p>
						<a
							className="inline-flex text-white underline decoration-lime-400 decoration-wavy underline-offset-6"
							href="mailto:sugestoes@bionk.com.br"
							rel="noopener noreferrer"
							target="_blank"
						>
							ideias@bionk.me
						</a>
					</div>
				</div>
			</div>
		</main>
	);
}

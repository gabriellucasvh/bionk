import {
	BarChart3,
	Compass,
	Link as LinkIcon,
	ListChecks,
	Palette,
	Rocket,
} from "lucide-react";

export default function Features() {
	const items = [
		{
			icon: LinkIcon,
			title: "Link in bio",
			description:
				"Agrupe redes, conteúdos, produtos e contato em um só lugar, com clareza.",
		},
		{
			icon: ListChecks,
			title: "Organização simples",
			description:
				"Arraste e solte, ordene e edite títulos e URLs sem fricção.",
		},
		{
			icon: BarChart3,
			title: "Métricas",
			description:
				"Visualizações e cliques por link. Decida com base em dados.",
		},
		{
			icon: Palette,
			title: "Personalização",
			description:
				"Visual consistente com fontes, cores e layouts pensados para clareza.",
		},
		{
			icon: Rocket,
			title: "Performance & SEO",
			description:
				"Estrutura leve e otimizada para busca. Carregamento ágil e direto.",
		},
		{
			icon: Compass,
			title: "Descoberta",
			description:
				"Apresente formatos variados e leve seu público às ações certas.",
		},
	];
	return (
		<section className="bg-white py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="text-sky-400 text-sm uppercase tracking-[4px]">
						Recursos que fazem diferença
					</div>
					<h2 className="title mt-3 text-3xl text-bunker-950 sm:text-4xl">
						Tudo o que você precisa, sem complicação
					</h2>
					<p className="mt-4 max-w-2xl text-bunker-700">
						Organize seus links, destaque conteúdos e conduza seu público com
						uma experiência direta e leve.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
					{items.map((item, idx) => {
						const Icon = item.icon as React.ComponentType<{
							className?: string;
						}>;
						return (
							<div
								className="group hover:-translate-y-1 relative overflow-hidden rounded-3xl border border-bunker-200 bg-white p-6 transition-all duration-200 hover:shadow-lg md:col-span-4"
								key={idx}
							>
								<div className="mb-4 flex items-center justify-center">
									<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bunker-50 shadow-sm ring-1 ring-bunker-200">
										<Icon className="h-8 w-8 text-sky-500" />
									</div>
								</div>
								<h3 className="font-semibold text-bunker-900 text-xl">
									{item.title}
								</h3>
								<p className="mt-2 text-bunker-700">{item.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

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
			bg: "bg-sky-950",
			accent: "text-sky-500",
		},
		{
			icon: ListChecks,
			title: "Organização simples",
			description:
				"Arraste e solte, ordene e edite títulos e URLs sem fricção.",
			bg: "bg-emerald-950",
			accent: "text-emerald-500",
		},
		{
			icon: BarChart3,
			title: "Métricas",
			description:
				"Visualizações e cliques por link. Decida com base em dados.",
			bg: "bg-indigo-950",
			accent: "text-indigo-500",
		},
		{
			icon: Palette,
			title: "Personalização",
			description:
				"Visual consistente com fontes, cores e layouts pensados para clareza.",
			bg: "bg-amber-950",
			accent: "text-amber-500",
		},
		{
			icon: Rocket,
			title: "Performance & SEO",
			description:
				"Estrutura leve e otimizada para busca. Carregamento ágil e direto.",
			bg: "bg-violet-950",
			accent: "text-violet-500",
		},
		{
			icon: Compass,
			title: "Descoberta",
			description:
				"Apresente formatos variados e leve seu público às ações certas.",
			bg: "bg-rose-950",
			accent: "text-rose-500",
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
							className={`group relative overflow-hidden rounded-3xl p-6 md:col-span-4 ${item.bg}`}
							key={idx}
						>
								<div className="mb-4 flex items-center justify-start">
									<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white ">
								<Icon className={`h-8 w-8 ${item.accent}`} />
							</div>
						</div>
								<h3 className="font-semibold text-bunker-50 text-xl">
									{item.title}
								</h3>
								<p className="mt-2 text-bunker-50">{item.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

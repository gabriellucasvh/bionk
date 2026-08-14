import {
	ChartBar,
	Compass,
	Link as LinkIcon,
	ListChecks,
	Palette,
	Rocket,
} from "@phosphor-icons/react/dist/ssr";

export default function Features() {
	const items = [
		{
			icon: LinkIcon,
			title: "Link in bio",
			description:
				"Agrupe redes, conteúdos, produtos e contato em um só lugar, com clareza.",
			bg: "bg-sky-400",
		},
		{
			icon: ListChecks,
			title: "Organização simples",
			description:
				"Arraste e solte, ordene e edite títulos e URLs sem fricção.",
			bg: "bg-emerald-400",
		},
		{
			icon: ChartBar,
			title: "Métricas",
			description:
				"Visualizações e cliques por link. Decida com base em dados.",
			bg: "bg-indigo-400",
		},
		{
			icon: Palette,
			title: "Personalização",
			description:
				"Visual consistente com fontes, cores e layouts pensados para clareza.",
			bg: "bg-amber-400",
		},
		{
			icon: Rocket,
			title: "Performance & SEO",
			description:
				"Estrutura leve e otimizada para busca. Carregamento ágil e direto.",
			bg: "bg-violet-400",
		},
		{
			icon: Compass,
			title: "Descoberta",
			description:
				"Apresente formatos variados e leve seu público às ações certas.",
			bg: "bg-rose-400",
		},
	];
	return (
		<section className="bg-white py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="inline-block rounded-full bg-sky-200 px-4 py-1 font-bold text-black text-xs uppercase tracking-[4px]">
						Recursos que fazem diferença
					</div>
					<h2 className="title mt-4 font-black text-4xl text-black sm:text-5xl">
						Tudo o que você precisa, sem complicação
					</h2>
					<p className="mt-4 max-w-2xl font-medium text-black/80 text-lg">
						Organize seus links, destaque conteúdos e conduza seu público com
						uma experiência direta e leve.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
					{items.map((item, idx) => {
						const Icon = item.icon as React.ComponentType<{
							className?: string;
							weight?: "bold" | "fill" | "regular";
						}>;
						return (
							<div
								className={`group relative overflow-hidden rounded-3xl p-6 md:col-span-4 ${item.bg}`}
								key={idx}
							>
								<div className="mb-4 flex items-center justify-start">
									<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white">
										<Icon className="h-8 w-8 text-black" weight="bold" />
									</div>
								</div>
								<h3 className="font-black text-2xl text-black">{item.title}</h3>
								<p className="mt-2 font-medium text-black/90">
									{item.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

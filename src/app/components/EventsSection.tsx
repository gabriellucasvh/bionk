import Image from "next/image";

export default function EventsSection() {
	return (
		<section className="bg-bunker-50 py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="text-sky-400 text-sm uppercase tracking-[4px]">
						Para quem tem eventos
					</div>
					<h2 className="title mt-3 text-3xl text-bunker-950 sm:text-4xl">
						Ingressos, agenda e links que convertem
					</h2>
					<p className="mt-4 max-w-2xl text-bunker-700">
						Crie um fluxo simples para o seu público comprar e participar.
						Integre links de plataformas como Sympla e outras, sem complicação.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="rounded-3xl bg-white p-6">
						<div className="text-sky-400 text-xs uppercase tracking-[3px]">
							Próximo evento
						</div>
						<div className="mt-4 rounded-3xl border p-4">
							<h3 className="mt-2 font-semibold text-bunker-900 text-xl">
								Noite de Lançamento
							</h3>
							<div className="my-2 text-bunker-700">
								<p>São Paulo</p>
								{new Date().toLocaleDateString()} • 19:00
							</div>
							<div className="flex text-bunker-700 text-xs">
								<Image
									alt="Sympla"
									height={15}
									src="/images/sympla-icon.svg"
									width={15}
								/>{" "}
								• Sympla
							</div>
							<div className="mt-4 cursor-pointer select-none rounded-full border border-bunker-200 bg-black px-4 py-2 text-center text-sm text-white">
								Comprar
							</div>
						</div>
						<p className="mt-3 text-bunker-700">
							Se você organiza eventos, sua página na Bionk pode ser o lugar
							onde a curiosidade vira presença. Links claros, decisões fáceis e
							uma experiência leve.
						</p>
					</div>
					{/* Card 2 */}
					<div className="rounded-3xl bg-white p-6">
						<div className="text-sky-400 text-xs uppercase tracking-[3px]">
							Formatos
						</div>
						<h3 className="mt-2 font-semibold text-bunker-900 text-xl">
							Sem Limites.
						</h3>
						<p className="mt-3 text-bunker-700">
							Estruture uma lista clara com diferentes ofertas. Cada item com
							descrição, preço e ação simples.
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Show
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Workshop
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Tour
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Live
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Palestra
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Congresso
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Festival
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Exposição
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Treinamento
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								Conferência
							</span>
							<span className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm">
								...
							</span>
						</div>
						<div className="mt-4 text-bunker-700">
							Crie seu evento do seu jeito, com liberdade para definir cada
							detalhe. Personalize, divulgue e ofereça uma experiência única ao
							seu público.
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

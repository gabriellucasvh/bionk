export default function EventsSection() {
	return (
		<section className="bg-amber-300 py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="inline-block rounded-full bg-white px-4 py-1 font-bold text-black text-xs uppercase tracking-[4px]">
						Para quem tem eventos
					</div>
					<h2 className="title mt-4 font-black text-4xl text-black sm:text-5xl">
						Ingressos, agenda e links que convertem
					</h2>
					<p className="mt-4 max-w-2xl font-medium text-black/90 text-lg">
						Crie um fluxo simples para o seu público comprar e participar.
						Integre links de plataformas como Sympla e outras, sem complicação.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="rounded-3xl bg-white p-6">
						<div className="inline-block rounded-full bg-sky-300 px-3 py-1 font-bold text-black text-xs uppercase tracking-[3px]">
							Próximo evento
						</div>
						<div className="mt-4 rounded-3xl bg-amber-100 p-4">
							<h3 className="mt-2 font-black text-2xl text-black">
								Noite de Lançamento
							</h3>
							<div className="my-2 font-bold text-black/80">
								<p>São Paulo</p>
								{new Date().toLocaleDateString()} • 19:00
							</div>
						</div>
						<p className="mt-4 font-medium text-black/90">
							Se você organiza eventos, sua página na Bionk pode ser o lugar
							onde a curiosidade vira presença. Links claros, decisões fáceis e
							uma experiência leve.
						</p>
					</div>
					{/* Card 2 */}
					<div className="rounded-3xl bg-white p-6">
						<div className="inline-block rounded-full bg-emerald-300 px-3 py-1 font-bold text-black text-xs uppercase tracking-[3px]">
							Formatos
						</div>
						<h3 className="mt-4 font-black text-2xl text-black">
							Sem Limites.
						</h3>
						<p className="mt-3 font-medium text-black/90">
							Estruture uma lista clara com diferentes ofertas. Cada item com
							descrição, preço e ação simples.
						</p>
						<div className="mt-6 flex flex-wrap gap-2">
							<span className="rounded-full bg-sky-200 px-4 py-2 font-bold text-black text-sm">
								Show
							</span>
							<span className="rounded-full bg-[#d2f34c] px-4 py-2 font-bold text-black text-sm">
								Workshop
							</span>
							<span className="rounded-full bg-rose-200 px-4 py-2 font-bold text-black text-sm">
								Tour
							</span>
							<span className="rounded-full bg-amber-200 px-4 py-2 font-bold text-black text-sm">
								Live
							</span>
							<span className="rounded-full bg-violet-200 px-4 py-2 font-bold text-black text-sm">
								Palestra
							</span>
							<span className="rounded-full bg-orange-200 px-4 py-2 font-bold text-black text-sm">
								Congresso
							</span>
							<span className="rounded-full bg-emerald-200 px-4 py-2 font-bold text-black text-sm">
								Festival
							</span>
							<span className="rounded-full bg-pink-200 px-4 py-2 font-bold text-black text-sm">
								Exposição
							</span>
							<span className="rounded-full bg-cyan-200 px-4 py-2 font-bold text-black text-sm">
								Treinamento
							</span>
							<span className="rounded-full bg-white px-4 py-2 font-bold text-black text-sm">
								Conferência
							</span>
							<span className="rounded-full bg-gray-200 px-4 py-2 font-bold text-black text-sm">
								...
							</span>
						</div>
						<div className="mt-6 font-medium text-black/90">
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

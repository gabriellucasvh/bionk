import { Star } from "lucide-react";

export default function Testimonials() {
	return (
		<section className="bg-emerald-950 py-24">
			<div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<h2 className="title font-bold text-4xl text-white sm:text-5xl">
						O que nossos usuários dizem
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-gray-300 text-lg leading-relaxed">
						Milhares de criadores já transformaram sua presença online com o{" "}
						<span className="font-semibold text-emerald-400">Bionk</span>
					</p>
				</div>

				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
					{[
						{
							content:
								"O Bionk transformou minha presença nas redes sociais. Agora posso compartilhar todos os meus links de forma elegante!",
							author: "Ana Silva",
							role: "Influenciadora Digital",
							rating: 5,
						},
						{
							content:
								"Interface super intuitiva! Em poucos minutos, configurei todos os meus links e comecei a compartilhar com minha audiência.",
							author: "Carlos Santos",
							role: "Produtor de Conteúdo",
							rating: 5,
						},
						{
							content:
								"A melhor ferramenta para centralizar links que já usei. Simples, bonita e eficiente. Recomendo a todos.",
							author: "Mariana Costa",
							role: "Empreendedora Digital",
							rating: 4,
						},
					].map((testimonial) => (
						<article
							className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm transition-transform hover:scale-[1.02]"
							key={testimonial.content}
						>
							<p className="mb-8 text-gray-200 italic leading-relaxed">
								“{testimonial.content}”
							</p>

							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-semibold text-lg text-white">
										{testimonial.author}
									</h4>
									<p className="text-gray-400 text-sm">{testimonial.role}</p>
								</div>
								<div className="flex">
									{Array.from({ length: testimonial.rating }).map((_, i) => (
										<Star
											className="h-5 w-5 fill-yellow-400 text-yellow-400"
											key={i}
										/>
									))}
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

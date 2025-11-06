"use client";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MotionDiv } from "@/components/ui/motion";

export default function Testimonials() {
	const items = [
		{
			quote:
				"O Bionk me ajudou a apresentar meu trabalho de forma simples e profissional. Foi além do que eu imaginava.",
			name: "Marcos Vieira",
			role: "Criador de Conteúdo",
			avatar: "/images/marcos-vieira.png",
		},
		{
			quote:
				"Ficou muito mais fácil centralizar campanhas e redirecionar minha audiência. Minha bio virou meu principal canal.",
			name: "Julia Ramos",
			role: "Empreendedora",
			avatar: "/images/julia-ramos.png",
		},
		{
			quote:
				"Uso diariamente para compartilhar novidades e fechar parcerias. É rápido, moderno e confiável.",
			name: "Daniel Nogueira",
			role: "Influenciador",
			avatar: "/images/daniel-nogueira.png",
		},
	];

	const [index, setIndex] = useState(0);

	const prev = () => {
		setIndex((i) => {
			if (i === 0) {
				return items.length - 1;
			}
			return i - 1;
		});
	};

	const next = () => {
		setIndex((i) => {
			if (i === items.length - 1) {
				return 0;
			}
			return i + 1;
		});
	};

	const t = items[index];

	return (
		<section className="bg-purple-950 py-24">
			<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-12 md:flex-row md:items-center">
					<div className="md:w-5/12">
						<h2 className="title font-bold text-4xl text-white sm:text-5xl">
							Da nossa <span className="font-black">comunidade.</span>
						</h2>
						<p className="mt-6 max-w-md text-gray-300 text-lg">
							Veja o que nossos usuários têm a dizer sobre o Bionk.
						</p>
						<div className="mt-8 hidden gap-4 md:flex">
							<button
								aria-label="Anterior"
								className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 hover:bg-purple-900"
								onClick={prev}
								type="button"
							>
								<ChevronLeft className="h-6 w-6 text-white" />
							</button>
							<button
								aria-label="Próximo"
								className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 hover:bg-purple-900"
								onClick={next}
								type="button"
							>
								<ChevronRight className="h-6 w-6 text-white" />
							</button>
						</div>
					</div>

					<div className="md:w-7/12">
						<AnimatePresence mode="wait">
							<MotionDiv
								animate={{ opacity: 1, y: 0 }}
								className="rounded-3xl border-2 border-violet-500 p-10 shadow-sm"
								exit={{ opacity: 0, y: -12 }}
								initial={{ opacity: 0, y: 12 }}
								key={index}
								transition={{ duration: 0.25 }}
							>
								<Quote
									className="h-8 w-8 fill-current text-purple-400"
									strokeWidth={0.1}
								/>
								<p className="mt-4 text-3xl text-white leading-snug">
									{t.quote}
								</p>
								<div className="mt-8 flex items-center gap-4">
									<div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
										<Image alt={t.name} height={48} src={t.avatar} width={48} />
									</div>
									<div>
										<div className="font-semibold text-white">{t.name}</div>
										<div className="text-gray-300 text-sm">{t.role}</div>
									</div>
								</div>
							</MotionDiv>
						</AnimatePresence>
						<div className="mt-8 flex justify-center gap-4 md:hidden">
							<button
								aria-label="Anterior"
								className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 hover:bg-purple-900"
								onClick={prev}
								type="button"
							>
								<ChevronLeft className="h-6 w-6 text-white" />
							</button>
							<button
								aria-label="Próximo"
								className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 hover:bg-purple-900"
								onClick={next}
								type="button"
							>
								<ChevronRight className="h-6 w-6 text-white" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

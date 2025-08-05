"use client";
import {
	CheckCircle,
	Compass,
	Link,
	MousePointerClick,
	Share2,
	Trash,
	UserRoundPen,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/buttons/BaseButton";
import { BorderBeam } from "@/components/magicui/border-beam";

export default function Features() {
	const router = useRouter();
	return (
		<section className="relative py-28 bg-gradient-to-br from-green-50 via-white to-white overflow-hidden">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
				<div className="text-center mb-20">
					<h2 className="text-4xl font-extrabold font-gsans text-green-900 sm:text-5xl">
						Eleve sua presença online
					</h2>
					<p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
						Uma plataforma de bio inteligente para influenciadores, marcas e
						profissionais que querem impactar.
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					<div className="md:col-span-5 rounded-3xl overflow-hidden relative md:min-h-[280px] flex flex-col shadow-black/30 shadow-md">
						<video
							key="background-video"
							className="absolute top-0 left-0 w-full h-full object-top z-0"
							src="https://res.cloudinary.com/dlfpjuk2r/video/upload/v1754362134/gestao-loop-compact_gsqszb.mp4"
							autoPlay
							loop
							muted
							playsInline
						/>

						<div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent z-10" />

						<div className="relative z-20 flex flex-col justify-end h-full p-6 gap-2 text-white">
							<div>
								<div className="bg-white/20 inline-flex p-3 rounded-full shadow mb-4">
									<CheckCircle className="h-8 w-8 text-white" />
								</div>
								<h3 className="text-3xl font-bold mb-3">
									Gestão Descomplicada
								</h3>
								<p className="text-lg opacity-90">
									Organize seus links em tempo real, edite com facilidade e
									mantenha tudo otimizado.
								</p>
							</div>

							<BaseButton onClick={() => router.push("/registro")}>
								Criar uma conta na Bionk
							</BaseButton>
						</div>
						<BorderBeam
							duration={6}
							size={300}
							borderWidth={3}
							className="from-tranparent via-green-500 to-transparent"
						/>
						<BorderBeam
							delay={3}
							duration={6}
							size={300}
							borderWidth={3}
							className="from-tranparent via-green-500 to-transparent"
						/>
					</div>

					<div className="relative md:col-span-4 bg-gradient-to-r from-lime-400 via-lime-300 to-white bg-[length:200%_200%] hover:bg-[position:100%_0%] transition-all duration-500 ease-in-out rounded-3xl shadow-black/30 shadow-md overflow-hidden ">
						<Image
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362133/bionk-web_ykys9y.svg"
							alt="Ícone Bionk Web"
							width={450}
							height={450}
							loading="lazy"
						/>
						<div className="p-6 relative z-10">
							<div className="bg-lime-100 inline-flex p-3 rounded-full shadow mb-4">
								<Compass className="h-8 w-8 text-lime-500" />
							</div>
							<h3 className="flex items-center text-3xl font-semibold text-green-800 mb-3">
								Sua identidade na web{" "}
							</h3>
							<p className="text-gray-700 text-lg lg:text-xl font-light leading-snug">
								Mostre seu nome ou marca com um link fácil de lembrar e visual
								moderno, direto na barra do navegador.
							</p>
						</div>
					</div>

					<div className="md:col-span-3 rounded-3xl p-6 relative min-h-[180px] overflow-hidden shadow-black/30 shadow-md">
						{/* Camada base */}
						<div className="absolute inset-0 bg-gradient-to-bl from-green-900 via-green-500 to-green-700" />

						{/* Camada que surge com hover */}
						<div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-600 to-green-400 opacity-0-hover:opacity-100 transition-opacity duration-500" />

						{/* Conteúdo visível */}
						<div className="relative z-10">
							<div className="bg-lime-300 inline-flex p-3 rounded-full shadow mb-4">
								<MousePointerClick className="h-8 w-8 text-green-700" />
							</div>
							<h3 className="text-3xl font-semibold text-gray-100 mb-3">
								Fácil de Usar
							</h3>
							<p className="text-gray-200 mb-12 text-lg lg:text-xl font-light leading-snug">
								Tudo pensado para você editar, compartilhar e gerenciar sem
								complicações.
							</p>
							<div className="relative h-24 w-full">
								<UserRoundPen
									className="absolute top-2 left-2 text-lime-300 filter drop-shadow-sm animate-[float_3s_ease-in-out_infinite]"
									style={{ width: 36, height: 36 }}
								/>
								<Trash
									className="absolute top-8 left-20 rotate-12 text-lime-300 filter drop-shadow-sm animate-[float_4s_ease-in-out_infinite]"
									style={{ width: 40, height: 40 }}
								/>
								<Share2
									className="absolute top-4 left-36 -rotate-12 text-lime-300 filter drop-shadow-sm animate-[float_3.5s_ease-in-out_infinite]"
									style={{ width: 32, height: 32 }}
								/>
								<Link
									className="absolute top-12 left-48 rotate-6 text-lime-300 filter drop-shadow-sm animate-[float_5s_ease-in-out_infinite]"
									style={{ width: 44, height: 44 }}
								/>
							</div>
						</div>
					</div>

					{/* Para Influencers */}
					<div className="md:col-span-4 relative overflow-hidden bg-white rounded-3xl shadow-black/30 shadow-md  flex flex-col">
						<Image
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362133/bionk-socials_vtuugv.svg"
							alt="Rede de influenciadores conectados visualmente"
							fill
							className="absolute inset-0 w-full h-full object-cover opacity-70 scale-110 pointer-events-none select-none"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-teal-950/95 z-10" />
						<div className="relative z-20 p-6 flex flex-col justify-end h-full">
							<div className="text-lime-300 text-balance break-words">
								<h3 className="text-5xl lg:text-6xl font-bold mb-2 leading-tight">
									Para Influencers
								</h3>
								<p className="text-lg lg:text-xl font-light leading-snug">
									Conecte todas as suas redes e promova colaborações com estilo
									e profissionalismo.
								</p>
							</div>
						</div>
					</div>

					{/* Para Marcas */}
					<div className="md:col-span-4 relative overflow-hidden rounded-3xl shadow-black/30 shadow-md  flex flex-col">
						<Image
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362606/bionk-enterprises_yaj0kb.jpg"
							alt="Elementos gráficos decorativos para marcas"
							fill
							className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none select-none"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-emerald-950/95 z-10" />
						<div className="relative z-20 p-6 flex flex-col justify-end h-full">
							<div className="text-cyan-300 break-keep">
								<h3 className="text-5xl lg:text-6xl font-bold mb-2 leading-tight">
									Para Marcas
								</h3>
								<p className="text-lg lg:text-xl font-light leading-snug">
									Redirecione campanhas, promova lançamentos e mantenha seus
									clientes engajados.
								</p>
							</div>
						</div>
					</div>

					{/* Para Freelancers */}
					<div className="md:col-span-4 relative overflow-hidden bg-white rounded-3xl shadow-black/30 shadow-md  flex flex-col">
						<Image
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362673/bionk-freelancer_xk5n3t.jpg"
							alt="Elementos gráficos decorativos para freelancers"
							fill
							className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none select-none"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-cyan-950/95 z-10" />
						<div className="relative z-20 p-6 flex flex-col justify-end h-full text-green-400 break-keep">
							<h3 className="text-5xl lg:text-6xl font-bold mb-2 leading-tight">
								Para Freelancers
							</h3>
							<p className="text-lg lg:text-xl font-light leading-snug">
								Exiba seu portfólio, serviços e canais de contato de forma
								profissional e acessível.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

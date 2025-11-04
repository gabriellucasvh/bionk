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
		<section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-white py-28">
			<div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<h2 className="font-extrabold text-4xl text-green-900 sm:text-5xl">
						Eleve sua presença online
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-gray-700 text-lg">
						Uma plataforma de bio inteligente para influenciadores, marcas e
						profissionais que querem impactar.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
					<div className="relative flex flex-col overflow-hidden rounded-3xl shadow-black/30 shadow-md md:col-span-5 md:min-h-[280px]">
						<video
							autoPlay
							className="absolute top-0 left-0 z-0 h-full w-full object-top"
							key="background-video"
							loop
							muted
							playsInline
							src="https://res.cloudinary.com/dlfpjuk2r/video/upload/v1756007043/gestao-loop-compact_gsqszb_avmhaz.mp4"
						/>

						<div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black to-transparent" />

						<div className="relative z-20 flex h-full flex-col justify-end gap-2 p-6 text-white">
							<div>
								<div className="mb-4 inline-flex rounded-full bg-white/20 p-3 shadow">
									<CheckCircle className="h-8 w-8 text-white" />
								</div>
								<h3 className="mb-3 font-bold text-3xl">
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
							borderWidth={3}
							className="from-tranparent via-green-500 to-transparent"
							duration={6}
							size={300}
						/>
						<BorderBeam
							borderWidth={3}
							className="from-tranparent via-green-500 to-transparent"
							delay={3}
							duration={6}
							size={300}
						/>
					</div>

					<div className="relative overflow-hidden rounded-3xl bg-[length:200%_200%] bg-gradient-to-r from-lime-400 via-lime-300 to-white shadow-black/30 shadow-md transition-all duration-500 ease-in-out hover:bg-[position:100%_0%] md:col-span-4 ">
						<Image
							alt="Ícone Bionk Web"
							height={450}
							loading="lazy"
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362133/bionk-web_ykys9y.svg"
							width={450}
						/>
						<div className="relative z-10 p-6">
							<div className="mb-4 inline-flex rounded-full bg-avocado-100 p-3 shadow">
								<Compass className="h-8 w-8 text-lime-500" />
							</div>
							<h3 className="mb-3 flex items-center font-semibold text-3xl text-green-800">
								Sua identidade na web{" "}
							</h3>
							<p className="font-light text-gray-700 text-lg leading-snug lg:text-xl">
								Mostre seu nome ou marca com um link fácil de lembrar e visual
								moderno, direto na barra do navegador.
							</p>
						</div>
					</div>

					<div className="relative min-h-[180px] overflow-hidden rounded-3xl p-6 shadow-black/30 shadow-md md:col-span-3">
						{/* Camada base */}
						<div className="absolute inset-0 bg-gradient-to-bl from-green-900 via-green-500 to-green-700" />

						{/* Camada que surge com hover */}
						<div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-600 to-green-400 opacity-0-hover:opacity-100 transition-opacity duration-500" />

						{/* Conteúdo visível */}
						<div className="relative z-10">
							<div className="mb-4 inline-flex rounded-full bg-avocado-300 p-3 shadow">
								<MousePointerClick className="h-8 w-8 text-green-700" />
							</div>
							<h3 className="mb-3 font-semibold text-3xl text-gray-100">
								Fácil de Usar
							</h3>
							<p className="mb-12 font-light text-gray-200 text-lg leading-snug lg:text-xl">
								Tudo pensado para você editar, compartilhar e gerenciar sem
								complicações.
							</p>
							<div className="relative h-24 w-full">
								<UserRoundPen
									className="absolute top-2 left-2 animate-[float_3s_ease-in-out_infinite] text-lime-300 drop-shadow-sm filter"
									style={{ width: 36, height: 36 }}
								/>
								<Trash
									className="absolute top-8 left-20 rotate-12 animate-[float_4s_ease-in-out_infinite] text-lime-300 drop-shadow-sm filter"
									style={{ width: 40, height: 40 }}
								/>
								<Share2
									className="-rotate-12 absolute top-4 left-36 animate-[float_3.5s_ease-in-out_infinite] text-lime-300 drop-shadow-sm filter"
									style={{ width: 32, height: 32 }}
								/>
								<Link
									className="absolute top-12 left-48 rotate-6 animate-[float_5s_ease-in-out_infinite] text-lime-300 drop-shadow-sm filter"
									style={{ width: 44, height: 44 }}
								/>
							</div>
						</div>
					</div>

					{/* Para Influencers */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-black/30 shadow-md md:col-span-4">
						<Image
							alt="Rede de influenciadores conectados visualmente"
							className="pointer-events-none absolute inset-0 h-full w-full scale-110 select-none object-cover opacity-70"
							fill
							loading="lazy"
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1756007371/bionk-socials_vtuugv_iwlsmy.svg"
						/>
						<div className="absolute inset-0 z-10 bg-teal-950/95" />
						<div className="relative z-20 flex h-full flex-col justify-end p-6">
							<div className="text-balance break-words text-lime-300">
								<h3 className="mb-2 font-bold text-5xl leading-tight lg:text-6xl">
									Para Influencers
								</h3>
								<p className="font-light text-lg leading-snug lg:text-xl">
									Conecte todas as suas redes e promova colaborações com estilo
									e profissionalismo.
								</p>
							</div>
						</div>
					</div>

					{/* Para Marcas */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl shadow-black/30 shadow-md md:col-span-4">
						<Image
							alt="Elementos gráficos decorativos para marcas"
							className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-70"
							fill
							loading="lazy"
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1756007370/bionk-enterprises_yaj0kb_c67qog.jpg"
						/>
						<div className="absolute inset-0 z-10 bg-emerald-950/95" />
						<div className="relative z-20 flex h-full flex-col justify-end p-6">
							<div className="break-keep text-cyan-300">
								<h3 className="mb-2 font-bold text-5xl leading-tight lg:text-6xl">
									Para Marcas
								</h3>
								<p className="font-light text-lg leading-snug lg:text-xl">
									Redirecione campanhas, promova lançamentos e mantenha seus
									clientes engajados.
								</p>
							</div>
						</div>
					</div>

					{/* Para Freelancers */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-black/30 shadow-md md:col-span-4">
						<Image
							alt="Elementos gráficos decorativos para freelancers"
							className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-70"
							fill
							loading="lazy"
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1756007368/bionk-freelancer_xk5n3t_xeqqp1.jpg"
						/>
						<div className="absolute inset-0 z-10 bg-cyan-950/95" />
						<div className="relative z-20 flex h-full flex-col justify-end break-keep p-6 text-green-400">
							<h3 className="mb-2 font-bold text-5xl leading-tight lg:text-6xl">
								Para Freelancers
							</h3>
							<p className="font-light text-lg leading-snug lg:text-xl">
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

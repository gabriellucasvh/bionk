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

export default function Features() {
	const router = useRouter();
	return (
		<section className="relative overflow-hidden bg-white py-28">
			<div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-20 text-center">
					<h2 className="title font-bold text-4xl text-black sm:text-5xl">
						Eleve sua presença online
					</h2>
					<p className="mx-auto mt-6 max-w-2xl text-gray-700 text-lg">
						Uma plataforma de bio inteligente para influenciadores, marcas e
						profissionais que querem impactar.
					</p>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-12">
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-bunker-950 md:col-span-5 md:min-h-[280px]">
						{/* <video
							autoPlay
							className="absolute top-0 left-0 z-0 h-full w-full object-top"
							key="background-video"
							loop
							muted
							playsInline
							src="https://res.cloudinary.com/dlfpjuk2r/video/upload/v1756007043/gestao-loop-compact_gsqszb_avmhaz.mp4"
						/>

						<div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black to-transparent" /> */}

						<div className="relative z-20 flex h-full flex-col justify-end gap-2 p-6 text-white">
							<div>
								<div className="mb-4 inline-flex rounded-full bg-white/20 p-3 shadow">
									<CheckCircle className="h-8 w-8 text-white" />
								</div>
								<h3 className="mb-3 font-bold text-3xl">
									Gestão Descomplicada
								</h3>
								<p className="font-light text-lg opacity-90">
									Organize seus links em tempo real, edite com facilidade e
									mantenha tudo otimizado.
								</p>
							</div>

							<BaseButton onClick={() => router.push("/registro")}>
								Criar uma conta na Bionk
							</BaseButton>
						</div>
					</div>

					<div className="relative overflow-hidden rounded-3xl bg-[length:200%_200%] bg-gradient-to-r from-purple-400 via-purple-300 to-white transition-all duration-500 ease-in-out hover:bg-[position:100%_0%] md:col-span-4 ">
						<Image
							alt="Ícone Bionk Web"
							height={450}
							loading="lazy"
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1754362133/bionk-web_ykys9y.svg"
							width={450}
						/>
						<div className="relative z-10 p-6">
							<div className="mb-4 inline-flex rounded-full bg-purple-100 p-3 shadow">
								<Compass className="h-8 w-8 text-purple-500" />
							</div>
							<h3 className="mb-3 flex items-center font-semibold text-3xl text-purple-800">
								Sua identidade na web{" "}
							</h3>
							<p className="font-light text-gray-700 text-lg leading-snug lg:text-xl">
								Mostre seu nome ou marca com um link fácil de lembrar e visual
								moderno, direto na barra do navegador.
							</p>
						</div>
					</div>

					<div className="relative min-h-[180px] overflow-hidden rounded-3xl p-6 md:col-span-3">
						{/* Camada base */}
						<div className="absolute inset-0 bg-gradient-to-bl from-purple-900 via-purple-500 to-purple-700" />

						{/* Conteúdo visível */}
						<div className="relative z-10">
							<div className="mb-4 inline-flex rounded-full bg-purple-300 p-3 shadow">
								<MousePointerClick className="h-8 w-8 text-purple-700" />
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
									className="absolute top-2 left-2 text-purple-300 drop-shadow-sm filter"
									style={{ width: 36, height: 36 }}
								/>
								<Trash
									className="absolute top-8 left-20 rotate-12 text-purple-300 drop-shadow-sm filter"
									style={{ width: 40, height: 40 }}
								/>
								<Share2
									className="-rotate-12 absolute top-4 left-36 text-purple-300 drop-shadow-sm filter"
									style={{ width: 32, height: 32 }}
								/>
								<Link
									className="absolute top-12 left-48 rotate-6 text-purple-300 drop-shadow-sm filter"
									style={{ width: 44, height: 44 }}
								/>
							</div>
						</div>
					</div>

					{/* Para Influencers */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-bunker-950 md:col-span-4">
						<div className="relative z-20 flex h-full flex-col justify-end p-6">
							<div className="text-balance break-words text-white">
								<h3 className="mb-2 line-clamp-2 font-bold text-5xl leading-tight lg:text-6xl">
									Para{" "}
									<br />
									<span className="font-black text-purple-500">
										Influencers
									</span>
								</h3>
								<p className="font-light text-lg leading-snug lg:text-xl">
									Conecte todas as suas redes e promova colaborações com estilo
									e profissionalismo.
								</p>
							</div>
						</div>
					</div>

					{/* Para Empresas */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-bunker-950 md:col-span-4">
						<div className="relative z-20 flex h-full flex-col justify-end p-6">
							<div className="break-keep text-white">
								<h3 className="mb-2 line-clamp-2 font-bold text-5xl leading-tight lg:text-6xl">
									Para{" "}
									<br />
									<span className="font-black text-purple-500">Empresas</span>
								</h3>
								<p className="font-light text-lg leading-snug lg:text-xl">
									Redirecione campanhas, promova lançamentos e mantenha seus
									clientes engajados.
								</p>
							</div>
						</div>
					</div>

					{/* Para Freelancers */}
					<div className="relative flex flex-col overflow-hidden rounded-3xl bg-bunker-950 md:col-span-4">
						<div className="relative z-20 flex h-full flex-col justify-end break-keep p-6 text-white">
							<h3 className="mb-2 line-clamp-2 whitespace-pre-line font-bold text-5xl leading-tight lg:text-6xl">
								Para{" "}
								<br />
								<span className="font-black text-purple-500">Proveito</span>
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

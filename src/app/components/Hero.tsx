"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { AnimatedList } from "@/components/magicui/animated-list";
import { BorderBeam } from "@/components/magicui/border-beam"; // 1. Importe o novo componente
import { MotionDiv } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

// --- Lógica da Lista Animada (sem alterações) ---
interface Item {
	name: string;
	description: string;
	time: string;
	social: string;
}

let notifications: Item[] = [
	{
		name: "Link adicionado!",
		description: "20K de pessoas curtiram seu albúm novo!",
		time: "15m atrás",
		social:
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634936/Spotify_k5trud.png",
	},
	{
		name: "Link adicionado!",
		description: "Veja quantas pessoas visitaram seu perfil",
		time: "10m atrás",
		social:
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634937/Telegram_hlo0sb.png",
	},
	{
		name: "Link adicionado!",
		description: "Estão gostando do seu conteúdo!",
		time: "5m atrás",
		social:
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634935/Snapchat_ppf2h5.png",
	},
	{
		name: "Link adicionado!",
		description: "O número de acessos neste link está aumentando!",
		time: "2m atrás",
		social:
			"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634933/Facebook_awxfp5.png",
	},
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, time, social }: Item) => {
	return (
		<figure
			className={cn(
				"relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-3",
				"bg-white/60 backdrop-blur-sm transition-all duration-200 ease-in-out hover:scale-[103%]",
				"[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]"
			)}
		>
			<div className="flex flex-row items-center gap-3">
				<div className="flex size-10 items-center justify-center">
					<Image
						alt={name}
						className="h-7 w-7 object-contain"
						height={28}
						src={social}
						width={28}
					/>
				</div>
				<div className="flex flex-col overflow-hidden">
					<figcaption className="flex flex-row items-center whitespace-pre font-medium text-base text-gray-800">
						<span className="text-sm sm:text-base">{name}</span>
						<span className="mx-1">·</span>
						<span className="text-gray-500 text-xs">{time}</span>
					</figcaption>
					<p className="font-normal text-gray-600 text-sm">{description}</p>
				</div>
			</div>
		</figure>
	);
};
// --- Fim da Lógica da Lista Animada ---

const Hero = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isClicked, setIsClicked] = useState<{ [key: string]: boolean }>({});
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoaded(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const handleClick = (path: string) => {
		if (isClicked[path]) {
			return;
		}
		setIsClicked((prev) => ({ ...prev, [path]: true }));
		setTimeout(() => {
			router.push(path);
		}, 100);
	};

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-teal-950 text-white">
			{/* ... (background motion divs - sem alterações) ... */}
			<MotionDiv
				animate={{ scale: [1, 1.2, 1] }}
				className="absolute inset-0 overflow-hidden"
				transition={{
					duration: 5,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "reverse",
				}}
			>
				<div className="-right-24 -top-24 absolute h-96 w-96 rounded-full bg-teal-900 opacity-60 blur-3xl" />
				<div className="-left-24 absolute top-1/2 h-96 w-96 rounded-full bg-teal-900 opacity-60 blur-3xl" />
			</MotionDiv>
			<div className="container relative z-10 mx-auto mt-10 flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10 sm:mt-20 sm:px-6 lg:px-8">
				{/* ... (título, texto e botões - sem alterações) ... */}
				<div
					className={`-translate-x-1 -translate-y-1 mt-1 mb-4 block transform px-4 py-1 text-lime-400 text-sm uppercase tracking-[4px] transition-all duration-700 ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
				>
					TUDO EM UM SÓ LUGAR
				</div>

				<h1
					className={`mb-6 text-center font-bold text-4xl text-white tracking-wider transition-all duration-700 sm:text-5xl md:text-6xl ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ transitionDelay: "100ms" }}
				>
					Adicione links na{" "}
					<span className="relative inline-block">
						sua bio
						<span className="-bottom-2 sm:-bottom-4 absolute left-0 h-1 w-full rounded-full bg-avocado-400" />
					</span>
				</h1>

				<p
					className={`mb-8 max-w-2xl text-center text-base text-gray-200 transition-all duration-700 sm:text-lg ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ transitionDelay: "200ms" }}
				>
					Destaque sua presença digital com o Bionk. Reúna links de redes
					sociais, portfólio, agenda de eventos, contatos e muito mais em uma
					única página.
				</p>

				<div
					className={`flex flex-row items-center gap-2 transition-all duration-700 ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ transitionDelay: "300ms" }}
				>
					<BaseButton
						disabled={isClicked["/descubra"]}
						onClick={() => handleClick("/descubra")}
						variant="white"
					>
						<span className="flex items-center">
							Saiba mais <ExternalLink className="ml-2 h-4 w-4" />
						</span>
					</BaseButton>
					<BaseButton
						className="group"
						disabled={isClicked["/registro"]}
						onClick={() => handleClick("/registro")}
					>
						<span className="relative z-10 flex items-center">
							Comece Grátis{" "}
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</span>
					</BaseButton>
				</div>

				{/* --- Início da Área do Card Modificada --- */}
				<div
					className={`relative mt-16 w-full max-w-4xl transition-all duration-1000 ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
					}`}
					style={{ transitionDelay: "400ms" }}
				>
					{/* 2. Este é o novo container PAI.
                           - Adicionamos `relative` para posicionar o BorderBeam.
                           - Mantivemos o `rounded-xl`, `bg-gradient`, `shadow-2xl`.
                           - REMOVEMOS o `overflow-hidden`.
                    */}
					<div className="relative aspect-[12/9] rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 shadow-2xl md:aspect-[20/9]">
						{/* 3. Este é o container do CONTEÚDO.
                               - Ele tem `overflow-hidden` para garantir que o conteúdo interno respeite as bordas.
                               - As classes de padding (`p-4 sm:p-8`) foram movidas para cá.
                        */}
						<div className="h-full w-full overflow-hidden rounded-xl p-4 sm:p-8">
							<div className="glass-effect h-full w-full rounded-lg p-6 shadow-inner">
								<div className="flex items-center space-x-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
										<Image
											alt="Bionk Logo"
											className="h-14 w-auto"
											height={28}
											priority
											src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
											width={110}
										/>
									</div>
									<div>
										<div className="h-4 w-36 font-semibold text-black">
											Bionk
										</div>
										<div className="mt-2 mb-3 flex h-3 w-24 items-center text-black/60">
											bionk.me/{" "}
											<Link
												className="mt-0.5 h-3 min-w-15 animate-pulse rounded-full bg-black/30 hover:bg-avocado-500"
												href={"/registro"}
											/>
										</div>
									</div>
								</div>

								<div className="relative mt-4 h-[240px] w-full overflow-hidden">
									<AnimatedList>
										{notifications.map((item, idx) => (
											<Notification {...item} key={idx} />
										))}
									</AnimatedList>
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gray-50 to-transparent" />
								</div>
							</div>
						</div>

						{/* 4. Colocamos o BorderBeam aqui. Ele vai se alinhar ao container pai `relative` e herdar seu `rounded-xl`. */}
						<BorderBeam
							borderWidth={4}
							colorFrom="#a3e635"
							colorTo="#14b8a6"
							duration={6}
							size={300}
						/>
						<BorderBeam
							borderWidth={4}
							colorFrom="#14b8a6"
							colorTo="#a3e635"
							delay={3}
							duration={6}
							size={200}
						/>
					</div>

					{/* Elementos flutuantes (sem alterações) */}
					<div
						className="-right-4 -top-4 float-animation absolute h-15 w-15 rounded-xl bg-blue-500/10 backdrop-blur-xl md:h-20 md:w-20"
						style={{ animationDelay: "0.2s" }}
					/>
					<div
						className="-bottom-6 -left-6 float-animation absolute h-15 w-15 rounded-full bg-purple-500/10 backdrop-blur-xl md:h-24 md:w-24"
						style={{ animationDelay: "0.5s" }}
					/>
				</div>
				{/* --- Fim da Área do Card Modificada --- */}
			</div>
		</div>
	);
};

export default Hero;

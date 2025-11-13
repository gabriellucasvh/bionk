"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

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
		<div className="relative h-[650px] w-full overflow-hidden bg-bunker-50 pt-56 sm:h-[720px] sm:pt-32 md:h-[780px] md:pt-90">
			<div className="container relative z-10 mx-auto mt-0 flex h-full max-w-7xl flex-col items-center justify-center px-4 py-10 sm:mt-0 sm:px-6 lg:px-8">
				{/* ... (título, texto e botões - sem alterações) ... */}
				<div
					className={`-translate-x-1 -translate-y-1 mt-1 mb-4 block transform px-4 py-1 text-sky-400 text-sm uppercase tracking-[4px] transition-all duration-700 ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
				>
					TUDO EM UM SÓ LUGAR
				</div>

				<h1
					className={`title mb-6 max-w-4xl text-center font-semibold text-4xl text-bunker-950 transition-all duration-700 sm:text-5xl md:text-5xl ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ transitionDelay: "100ms" }}
				>
					Coloque todos os seus links em um só lugar e deixe sua bio incrível.
				</h1>

				<p
					className={`mb-8 max-w-2xl text-center text-base text-bunker-700 transition-all duration-700 sm:text-lg ${
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
						className="bg-sky-300 text-black hover:bg-sky-400"
						disabled={isClicked["/registro"]}
						onClick={() => handleClick("/registro")}
					>
						<span className="relative z-10 flex items-center">
							Comece Grátis{" "}
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</span>
					</BaseButton>
				</div>
				<Image
					alt="Bionk Images"
					className="mt-10 h-150 w-auto"
					height={2386}
					priority
					src="/images/test-fotos.png"
					width={2969}
				/>
			</div>
		</div>
	);
};

export default Hero;

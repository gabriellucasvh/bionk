"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { MotionDiv } from "@/components/ui/motion";



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
		<div className="relative min-h-screen w-full overflow-hidden bg-bunker-950 text-white">
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
				<div className="-right-24 -top-24 absolute h-96 w-96 rounded-full bg-purple-900 opacity-60 blur-3xl" />
				<div className="-left-24 absolute top-1/2 h-96 w-96 rounded-full bg-purple-900 opacity-60 blur-3xl" />
			</MotionDiv>
			<div className="container relative z-10 mx-auto mt-10 flex min-h-dvh max-w-7xl flex-col items-center justify-center px-4 py-10 sm:mt-20 sm:px-6 lg:px-8">
				{/* ... (título, texto e botões - sem alterações) ... */}
				<div
					className={`-translate-x-1 -translate-y-1 mt-1 mb-4 block transform px-4 py-1 text-purple-400 text-sm uppercase tracking-[4px] transition-all duration-700 ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
				>
					TUDO EM UM SÓ LUGAR
				</div>

				<h1
					className={`title mb-6 text-center font-semibold text-4xl text-white transition-all duration-700 sm:text-5xl md:text-6xl ${
						isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
					}`}
					style={{ transitionDelay: "100ms" }}
				>
					Adicione links na{" "}
					<span className="relative inline-block underline decoration-purple-400">
						sua bio
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
			</div>
		</div>
	);
};

export default Hero;

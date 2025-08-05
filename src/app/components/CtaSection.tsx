"use client";

import { ArrowRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

export default function CtaSection() {
	const router = useRouter();
	const [isClicked, setIsClicked] = useState<{ [key: string]: boolean }>({});

	const handleClick = (path: string) => {
		if (isClicked[path]) return;
		setIsClicked((prev) => ({ ...prev, [path]: true }));
		router.push(path);
	};

	return (
		<section className="py-20 bg-white text-black">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6 font-gsans">
						Pronto para unificar sua presença online?
					</h2>
					<p className="text-lg mb-8 text-black">
						Junte-se a milhares de criadores que já estão aproveitando o poder
						do Bionk
					</p>

					<div className="inline-flex flex-wrap justify-center gap-4">
						<BaseButton
							variant="white"
							onClick={() => handleClick("/registro")}
							loading={isClicked["/registro"]}
						>
							<span className="flex items-center">
								Criar meu Bionk <ArrowRight className="ml-2 h-5 w-5" />
							</span>
						</BaseButton>

						<BaseButton
							onClick={() => handleClick("/planos")}
							loading={isClicked["/planos"]}
						>
							<span className="flex items-center">
								Ver Planos Premium <Users className="ml-2 h-5 w-5" />
							</span>
						</BaseButton>
					</div>
				</div>
			</div>
		</section>
	);
}

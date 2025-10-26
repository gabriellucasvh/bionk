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
		<section className="bg-white py-20 text-black">
			<div className="container mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
				<div className="mx-auto max-w-3xl">
					<h2 className="mb-6 font-bold text-3xl sm:text-4xl ">
						Pronto para unificar sua presença online?
					</h2>
					<p className="mb-8 text-black text-lg">
						Junte-se a milhares de criadores que já estão aproveitando o poder
						do Bionk
					</p>

					<div className="inline-flex flex-wrap justify-center gap-4">
						<BaseButton
							loading={isClicked["/registro"]}
							onClick={() => handleClick("/registro")}
							variant="white"
						>
							<span className="flex items-center">
								Criar meu Bionk <ArrowRight className="ml-2 h-5 w-5" />
							</span>
						</BaseButton>

						<BaseButton
							loading={isClicked["/planos"]}
							onClick={() => handleClick("/planos")}
						>
							<span className="flex items-center">
								Ver Planos Ultra <Users className="ml-2 h-5 w-5" />
							</span>
						</BaseButton>
					</div>
				</div>
			</div>
		</section>
	);
}

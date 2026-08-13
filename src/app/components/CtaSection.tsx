"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

export default function CtaSection() {
	const router = useRouter();
	const [isClicked, setIsClicked] = useState<{ [key: string]: boolean }>({});

	const handleClick = (path: string) => {
		if (isClicked[path]) {
			return;
		}
		setIsClicked((prev) => ({ ...prev, [path]: true }));
		router.push(path);
	};

	return (
		<section className="bg-white py-20 text-black">
			<div className="mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
				<div className="relative mx-auto w-full overflow-hidden rounded-3xl bg-pink-500">
					<div className="relative mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16">
						<h2 className="title mb-6 font-black text-4xl text-white sm:text-5xl">
							Pronto para unificar sua presença online?
						</h2>
						<p className="mb-8 font-medium text-white/90 text-lg">
							Descubra o poder do Bionk e comece a criar do seu jeito.
						</p>

						<div className="inline-flex flex-wrap justify-center gap-4">
							<BaseButton
								className="rounded-full bg-white font-bold text-black hover:bg-gray-100"
								loading={isClicked["/planos"]}
								onClick={() => handleClick("/planos")}
							>
								<span className="flex items-center">Ver planos</span>
							</BaseButton>

							<BaseButton
								className="rounded-full bg-[#d2f34c] font-bold text-black hover:bg-lime-400"
								loading={isClicked["/registro"]}
								onClick={() => handleClick("/registro")}
							>
								<span className="flex items-center">Criar meu Bionk</span>
							</BaseButton>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

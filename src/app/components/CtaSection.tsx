"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";

export default function CtaSection({ locale = "pt-br" }: { locale?: "pt-br" | "en" | "es" }) {
    const router = useRouter();
    const [isClicked, setIsClicked] = useState<{ [key: string]: boolean }>({});
    const dict = useMemo(() => {
        if (locale === "en") {
            return {
                title: "Ready to unify your online presence?",
                description: "Discover Bionk's power and start creating your way.",
                plans: "See plans",
                create: "Create my Bionk",
            };
        }
        if (locale === "es") {
            return {
                title: "¿Listo para unificar tu presencia online?",
                description: "Descubre el poder de Bionk y empieza a crear a tu manera.",
                plans: "Ver planes",
                create: "Crear mi Bionk",
            };
        }
        return {
            title: "Pronto para unificar sua presença online?",
            description: "Descubra o poder do Bionk e comece a criar do seu jeito.",
            plans: "Ver planos",
            create: "Criar meu Bionk",
        };
    }, [locale]);

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
				<div className="relative mx-auto w-full overflow-hidden rounded-3xl">
					<div className="absolute inset-0">
						<Image
							alt="Bionk Sky Gradient"
							className="w-full rounded-4xl object-cover"
							height={900}
							src="/images/sky-gradient.png"
							width={1600}
						/>
					</div>
					<div className="relative mx-auto max-w-3xl px-6 py-10 sm:px-10 lg:px-16">
                        <h2 className="title mb-6 font-bold text-3xl text-white sm:text-4xl">
                            {dict.title}
                        </h2>
                        <p className="mb-8 text-bunker-100 text-lg">
                            {dict.description}
                        </p>

						<div className="inline-flex flex-wrap justify-center gap-4">
                            <BaseButton
                                loading={isClicked["/planos"]}
                                onClick={() => handleClick("/planos")}
                                variant="white"
                            >
                                <span className="flex items-center">{dict.plans}</span>
                            </BaseButton>

                            <BaseButton
                                loading={isClicked["/registro"]}
                                onClick={() => handleClick("/registro")}
                                variant="sky"
                            >
                                <span className="flex items-center">{dict.create}</span>
                            </BaseButton>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

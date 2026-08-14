"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import TemplatePreviewModal from "@/components/modals/TemplatePreviewModal";
import { ALL_TEMPLATES } from "./templates.constants";
import type { TemplateType } from "./templates.types";

const TemplatesClient = () => {
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const handleTemplateClick = (template: TemplateType) => {
		setSelectedTemplate(template);
		setIsModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-[#d2f34c] text-black">
			<Header />
			<HeaderMobile />

			<section className="relative flex min-h-screen flex-col items-start justify-start gap-10 px-4 pt-20 sm:px-6 md:px-10 md:pt-40 lg:px-20 xl:px-40">
				<div className="w-full space-y-6 text-left sm:w-4/5 sm:space-y-8 md:w-3/4 ">
					<h1 className="title font-black text-4xl text-black leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
						Escolha o template perfeito para você
					</h1>
					<p className="font-medium text-base text-black/90 leading-relaxed sm:text-lg md:text-xl">
						Personalize seu perfil Bionk com designs modernos e exclusivos,
						feitos para destacar sua identidade e atrair mais cliques.
					</p>
				</div>

				<div className="grid w-full grid-cols-2 gap-4 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8 md:grid-cols-4 lg:grid-cols-5">
					{ALL_TEMPLATES.map((template) => (
						<div
							className="group cursor-pointer"
							key={template.id}
							onClick={() => handleTemplateClick(template)}
							role="none"
						>
							<div className="aspect-[3/4] overflow-hidden ">
								<Image
									alt={template.name}
									className="h-full w-full object-cover"
									height={400}
									quality={90}
									src={template.image}
									width={300}
								/>
							</div>
							<p className="mt-2 text-center font-bold text-black text-sm transition-colors duration-300">
								{template.name}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="w-full px-4 py-20 sm:px-10 md:px-20 ">
				<div className="mx-auto max-w-5xl space-y-8 text-center">
					<h2 className="title font-black text-4xl text-black sm:text-5xl md:text-6xl">
						<span className="text-violet-600">Tem uma</span>{" "}
						<span className="text-rose-600">ideia insana?</span>
					</h2>

					<p className="mx-auto max-w-3xl font-medium text-black/90 text-lg sm:text-xl md:text-2xl">
						Adoraríamos saber o que você está imaginando. Um layout? Uma
						funcionalidade? Uma animação? Compartilhe com a gente.
					</p>

					<p className="mt-6 font-black text-black text-xl md:text-2xl">
						Envie sua ideia para{" "}
						<Link
							className="underline decoration-rose-600 decoration-wavy transition-colors hover:text-rose-700"
							href="mailto:ideias@bionk.com"
						>
							ideias@bionk.me
						</Link>
					</p>
				</div>
			</section>

			<Footer />

			{selectedTemplate && (
				<TemplatePreviewModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					template={selectedTemplate}
				/>
			)}
		</div>
	);
};

export default TemplatesClient;

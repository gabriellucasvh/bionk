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
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const handleTemplateClick = (template: TemplateType) => {
		setSelectedTemplate(template);
		setIsModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-white text-black font-gsans">
			<Header />
			<HeaderMobile />

			<section className="relative min-h-screen flex flex-col items-start justify-start gap-10 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 pt-20 md:pt-40">
				<div className="w-full sm:w-4/5 md:w-3/4 lg:w-1/2 space-y-6 sm:space-y-8 text-left">
					<h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
						Escolha o template perfeito para você
					</h1>
					<p className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
						Personalize seu perfil Bionk com designs modernos e exclusivos,
						feitos para destacar sua identidade e atrair mais cliques.
					</p>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 w-full py-6 sm:py-8">
					{ALL_TEMPLATES.map((template) => (
						<div
							key={template.id}
							className="cursor-pointer group"
							onClick={() => handleTemplateClick(template)}
							role="none"
						>
							<div className="overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-lime-500 transition-all duration-300 aspect-[9/16]">
								<Image
									src={template.image}
									alt={template.name}
									width={300}
									height={533}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									quality={90}
									unoptimized
								/>
							</div>
							<p className="text-center mt-2 text-sm font-medium text-gray-700 group-hover:text-lime-600 transition-colors duration-300">
								{template.name}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="w-full px-4 sm:px-10 md:px-20 py-20 ">
				<div className="max-w-5xl mx-auto text-center space-y-8">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
						<span className="text-green-700">Tem uma</span>{" "}
						<span className="text-lime-600">ideia insana?</span>
					</h2>

					<p className="text-lg sm:text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto">
						Adoraríamos saber o que você está imaginando. Um layout? Uma
						funcionalidade? Uma animação? Compartilhe com a gente.
					</p>

					<p className="mt-6 text-xl md:text-2xl font-semibold text-green-800">
						Envie sua ideia para{" "}
						<Link
							href="mailto:ideias@bionk.com"
							className="underline decoration-wavy decoration-lime-600 hover:text-lime-700 transition-colors"
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

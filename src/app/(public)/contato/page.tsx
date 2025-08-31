import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
	title: "Contato - Bionk",
	description:
		"Entre em contato conosco. Nossa equipe está pronta para ajudar com suporte técnico, dúvidas sobre planos, parcerias e muito mais.",
};

export default function ContactPage() {
	return (
		<div className="min-h-dvh bg-white">
			<Header />
			<HeaderMobile />
			<div className="container mx-auto px-4 py-12 pt-32">
				{/* Título Principal */}
				<div className="text-center">
					<h1 className="mb-4 font-bold text-4xl text-black">
						Fale Conosco
					</h1>
					<p className="mx-auto max-w-3xl font-medium text-gray-700 text-lg">
						Tem alguma dúvida, sugestão ou precisa de ajuda? Nossa equipe está
						aqui para ajudar você.
						<br />
						<span>
							Você também pode consultar na{" "}
							<Link
								className="text-green-600 underline"
								href={"/ajuda"}
								rel="noopener noreferrer"
								target="_blank"
							>
								Central de Ajuda
							</Link>{" "}
							para obter respostas rápidas e eficientes. Se precisar de suporte
							técnico, entre em contato conosco através do formulário abaixo.
						</span>
					</p>
				</div>

				{/* Formulário de Contato */}
				<div className="mx-auto max-w-2xl md:p-12">
					<ContactForm />
				</div>
			</div>
			<Footer />
		</div>
	);
}

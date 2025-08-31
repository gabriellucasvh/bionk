import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import CustomPlanForm from "./CustomPlanForm";

export const metadata: Metadata = {
	title: "Bionk | Plano Personalizado",
	description:
		"Entre em contato conosco para criar um plano sob medida para suas necessidades. Soluções personalizadas com funcionalidades exclusivas.",
};

export default function CustomPlanPage() {
	return (
		<div className="min-h-dvh">
			<Header />
			<HeaderMobile />
			<main className="min-h-dvh">
				{/* Form Section */}
				<section className="px-4 py-16 pt-32">
					<div className="mx-auto max-w-2xl">
						<div className="text-center">
							<h2 className="mb-6 font-bold text-4xl text-green-800">
								Vamos conversar sobre seu projeto
							</h2>
							<p className="text-gray-600 text-lg">
								Pensado para negócios que precisam de algo além do comum, o
								Plano Customizado oferece soluções exclusivas, com design,
								performance e estratégias alinhadas às necessidades da sua
								marca.
							</p>
						</div>

						{/* Custom Form */}
						<CustomPlanForm />
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

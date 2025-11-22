import type { Metadata } from "next";
import { cookies } from "next/headers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { normalizeLocale } from "@/lib/i18n";
import CustomPlanForm from "./CustomPlanForm";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const titles: Record<string, string> = {
		"pt-br": "Bionk | Plano Personalizado",
		en: "Bionk | Custom Plan",
		es: "Bionk | Plan Personalizado",
	};
	const descriptions: Record<string, string> = {
		"pt-br":
			"Entre em contato conosco para criar um plano sob medida para suas necessidades. Soluções personalizadas com funcionalidades exclusivas.",
		en: "Contact us to create a tailored plan for your needs. Personalized solutions with exclusive features.",
		es: "Contáctanos para crear un plan a medida para tus necesidades. Soluciones personalizadas con funcionalidades exclusivas.",
	};
	return { title: titles[locale], description: descriptions[locale] };
}

export default async function CustomPlanPage() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = require(`@/dictionaries/public/${locale}/planos.ts`).default;
	return (
		<div className="min-h-dvh">
			<Header locale={locale} />
			<HeaderMobile locale={locale} />
			<main className="min-h-dvh">
				<section className="px-4 py-16 pt-32">
					<div className="mx-auto max-w-2xl">
						<div className="text-start md:text-center">
							<h2 className="mb-6 font-bold text-4xl text-black">
								{dict.customName}
							</h2>
							<p className="font-medium text-gray-600 md:text-lg">
								{dict.customDescription}
							</p>
						</div>
						<CustomPlanForm />
					</div>
				</section>
			</main>
			<Footer locale={locale} />
		</div>
	);
}

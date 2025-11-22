import type { Metadata } from "next";
import { cookies } from "next/headers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { normalizeLocale } from "@/lib/i18n";
import PricingPage from "./prices";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const titles: Record<string, string> = {
		"pt-br": "Bionk | Planos",
		en: "Bionk | Plans",
		es: "Bionk | Planes",
	};
	const descriptions: Record<string, string> = {
		"pt-br": "Compare os planos da Bionk e comece agora!",
		en: "Compare Bionk plans and start now!",
		es: "Compara los planes de Bionk y empieza ahora.",
	};
	return { title: titles[locale], description: descriptions[locale] };
}

export default async function planos() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return (
		<div>
			<Header locale={locale} />
			<HeaderMobile locale={locale} />
			<PricingPage locale={locale} />
			<Footer locale={locale} />
		</div>
	);
}

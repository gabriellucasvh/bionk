import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import PageRegistro from "./components/PageRegistro";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const titles: Record<string, string> = {
		"pt-br": "Bionk | Cadastro",
		en: "Bionk | Sign up",
		es: "Bionk | Registro",
	};
	const descriptions: Record<string, string> = {
		"pt-br":
			"Cadastre-se gratuitamente na Bionk e crie sua página de links poderosa.",
		en: "Sign up for free and create your powerful links page.",
		es: "Regístrate gratis y crea tu página de enlaces.",
	};
	return {
		title: titles[locale],
		description: descriptions[locale],
	};
}

export default async function registro() {
	const session = await getServerSession();
	if (session) {
		return redirect("/studio");
	}
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "registro");
	return <PageRegistro dict={dict} locale={locale} />;
}

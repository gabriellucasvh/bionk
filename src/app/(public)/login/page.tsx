import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import FormularioLogin from "./formulario-login";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "login");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

export default async function login() {
	const session = await getServerSession();
	if (session) {
		return redirect("/studio");
	}
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "login");
	return <FormularioLogin dict={dict} locale={locale} />;
}

import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import EsqueciSenhaClient from "./EsqueciSenhaClient";

export default async function EsqueciSenhaPage() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return <EsqueciSenhaClient locale={locale} />;
}

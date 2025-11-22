import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeLocale } from "@/lib/i18n";
import NovaSenhaClient from "./NovaSenhaClient";

export default async function NovaSenhaPage() {
	const cookieStore = await cookies();
	const verified = cookieStore.get("fp_verified");
	const th = cookieStore.get("fp_th");
	if (!(verified && verified.value === "1" && th && th.value)) {
		redirect("/esqueci-senha/verificar");
	}
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return <NovaSenhaClient locale={locale} />;
}

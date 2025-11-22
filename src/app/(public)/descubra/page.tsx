import type { Metadata } from "next";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";
import DescubraClient from "./descubra.client";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const titles: Record<string, string> = {
		"pt-br": "Bionk | Descubra",
		en: "Bionk | Discover",
		es: "Bionk | Descubre",
	};
	const descriptions: Record<string, string> = {
		"pt-br": "Descubra a Bionk e simplifique sua presença online.",
		en: "Discover Bionk and simplify your online presence.",
		es: "Descubre Bionk y simplifica tu presencia en línea.",
	};
	return { title: titles[locale], description: descriptions[locale] };
}

const Descubra = async () => {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return (
		<div>
			<DescubraClient locale={locale} />
		</div>
	);
};

export default Descubra;

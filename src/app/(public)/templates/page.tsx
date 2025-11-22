import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import TemplatesClient from "./templates.client";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "templates");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

const Templates = async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
    const locale = normalizeLocale(cookieLocale);
    return (
        <div>
            <TemplatesClient locale={locale} />
        </div>
    );
};

export default Templates;

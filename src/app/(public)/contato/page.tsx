import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import ContactForm from "./ContactForm";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "contato");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

export default async function ContactPage() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "contato");
	return (
		<div className="min-h-dvh bg-white">
			<Header locale={locale} />
			<HeaderMobile locale={locale} />
			<div className="container mx-auto px-4 py-12 pt-32">
				{/* Título Principal */}
				<div className="text-start md:text-center">
					<h1 className="mb-4 font-bold text-4xl text-black">
						{dict.pageTitle}
					</h1>
					<p className="mx-auto max-w-3xl pb-7 font-medium text-gray-700 md:text-lg">
						{dict.pageIntro1}
						<br />
						<span>
							{dict.pageIntro2.split("Central de Ajuda")[0]}
							<Link
								className="text-green-600 underline"
								href="https://ajuda.bionk.me"
								rel="noopener noreferrer"
								target="_blank"
							>
								{dict.helpCenter}
							</Link>{" "}
							{dict.pageIntro2.split("Central de Ajuda")[1]}
						</span>
					</p>
				</div>

				{/* Formulário de Contato */}
				<div className="mx-auto max-w-2xl md:p-12">
					<ContactForm dict={dict} locale={locale} />
				</div>
			</div>
			<Footer locale={locale} />
		</div>
	);
}

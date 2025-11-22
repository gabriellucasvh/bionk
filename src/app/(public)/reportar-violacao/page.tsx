import type { Metadata } from "next";
import { cookies } from "next/headers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { Separator } from "@/components/ui/separator";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "reportar-violacao");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

export default async function ReportarViolacaoPage() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "reportar-violacao");
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header locale={locale} />
			<HeaderMobile locale={locale} />

			<main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
				<section className="scroll-mt-[140px]" id="inicio">
					<h1 className="font-extrabold text-4xl">{dict.pageTitle}</h1>
					<Separator className="my-6" />

					<p className="mt-4">{dict.introParagraph}</p>

					<h2 className="mt-8 font-semibold text-xl">{dict.importantTitle}</h2>
					<p className="mt-2">{dict.importantParagraph}</p>
					<p className="mt-2">
						Para problemas de acesso à conta, questões técnicas, suporte geral
						ou solicitações administrativas, entre em contato diretamente com
						nossa equipe em
						<a className="ml-1 underline" href="mailto:suporte@bionk.me">
							suporte@bionk.me
						</a>
						.
					</p>
					<div className="mt-6 text-sm">
						<span className="font-medium">Termos de Uso:</span>
						<a className="ml-2 underline" href="/termos">
							https://bionk.me/termos
						</a>
					</div>
					<div className="mt-1 text-sm">
						<span className="font-medium">Diretrizes da Comunidade:</span>
						<a className="ml-2 underline" href="/comunidade">
							https://bionk.me/comunidade
						</a>
					</div>
				</section>

				<section className="scroll-mt-[140px]" id="formulario">
					<h2 className="mt-10 font-semibold text-xl">{dict.formTitle}</h2>
					<p className="mt-2 text-muted-foreground">{dict.helpText}</p>
					<div className="mt-4">
						<iframe
							allowFullScreen
							className="w-full rounded-md border"
							frameBorder="0"
							height="1600"
							loading="lazy"
							src="https://strong-thread-ea5.notion.site/ebd/291662cb17dd80f88610d5aeb9c023a2"
							title="Formulário de denúncia"
							width="100%"
						/>
					</div>
				</section>
			</main>

			<Footer locale={locale} />
		</div>
	);
}

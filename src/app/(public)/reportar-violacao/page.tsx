import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { Separator } from "@/components/ui/separator";

export const metadata = {
	title: "Bionk | Reportar Violação",
	description:
		"Denuncie conteúdo que viole nossos Termos de Uso ou Diretrizes da Comunidade. Preencha o formulário para que possamos avaliar e agir.",
};

export default function ReportarViolacaoPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header />
			<HeaderMobile />

			<main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
				<section className="scroll-mt-[140px]" id="inicio">
					<h1 className="font-extrabold text-4xl">Reportar Violação</h1>
					<Separator className="my-6" />

					<p className="mt-4">
						Se você encontrou conteúdo no Bionk que possa violar nossos
						<a className="ml-1 underline" href="/termos">
							{" "}
							Termos de Uso
						</a>{" "}
						ou
						<a className="ml-1 underline" href="/comunidade">
							{" "}
							Diretrizes da Comunidade
						</a>
						, preencha o formulário abaixo. Levamos todas as denúncias com
						seriedade, analisamos cada caso e tomamos as medidas adequadas
						conforme necessário.
					</p>

					<h2 className="mt-8 font-semibold text-xl">Importante</h2>
					<p className="mt-2">
						Este formulário é exclusivo para relatar conteúdo, comportamento ou
						links que infrinjam nossas políticas.
					</p>
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
					<h2 className="mt-10 font-semibold text-xl">
						Formulário de denúncia
					</h2>
					<p className="mt-2 text-muted-foreground">
						Descreva o caso com o máximo de detalhes possível para agilizar a análise.
					</p>
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

			<Footer />
		</div>
	);
}

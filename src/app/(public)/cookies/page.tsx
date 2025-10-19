/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
	title: "Bionk | Uso de Cookies",
	description:
		"Como usamos cookies de forma clara e simples: categorias, finalidades, consentimento, preferências e como gerenciar suas escolhas.",
};

export default function UsoDeCookiesPage() {
	return (
		<div className="flex min-h-screen flex-col items-center bg-background">
			<header>
				<Header />
				<HeaderMobile />
			</header>
			<main className="flex-1 px-10 pt-28 md:px-0">
				<div className="container py-6 md:py-8 lg:py-10">
					<div className="mx-auto max-w-3xl space-y-6">
						<div>
							<h1 className="font-bold text-3xl tracking-tight">
								Uso de Cookies
							</h1>
							<p className="text-muted-foreground">
								Última atualização: 19/10/2025
							</p>
						</div>
						<Separator />

						<div className="space-y-6">
							{/* Introdução */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="introducao"
							>
								<p className="text-muted-foreground">
							Esta página explica como a Bionk usa cookies e
							tecnologias semelhantes. Você verá para que eles servem, quais
							categorias existem e como suas escolhas são aplicadas.
						</p>
						<p className="mt-2 text-muted-foreground">
							Cumprimos as leis de proteção de dados aplicáveis (como a LGPD) e oferecemos
							mecanismos de consentimento e gestão para que você tenha controle
							sobre suas preferências.
						</p>
							</section>

							{/* Sumário */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="sumario"
							>
								<h2 className="font-semibold text-xl">Sumário</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
							<li><a className="underline hover:text-foreground" href="#o-que-sao-cookies">O que são cookies</a></li>
							<li><a className="underline hover:text-foreground" href="#categorias">Categorias e finalidades</a></li>
							<li><a className="underline hover:text-foreground" href="#consentimento-preferencias">Consentimento e preferências</a></li>
							<li><a className="underline hover:text-foreground" href="#seguranca">Segurança e confiabilidade</a></li>
							<li><a className="underline hover:text-foreground" href="#retencao-expiracao">Retenção e expiração</a></li>
							<li><a className="underline hover:text-foreground" href="#como-gerenciar">Como gerenciar e desabilitar</a></li>
							<li><a className="underline hover:text-foreground" href="#atualizacoes">Atualizações</a></li>
							<li><a className="underline hover:text-foreground" href="#links">Links relacionados</a></li>
						</ul>
							</section>

							{/* O que são cookies */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="o-que-sao-cookies"
							>
								<h2 className="font-semibold text-xl">O que são cookies</h2>
								<p className="mt-2 text-muted-foreground">
							Cookies são pequenos arquivos enviados por um site e armazenados no
							seu navegador ou dispositivo. Eles permitem funções essenciais (como
							login), memorizam preferências (como tema e idioma) e ajudam a
							entender como o serviço é usado para melhorar sua experiência.
						</p>
							</section>

							{/* Categorias e finalidades */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="categorias"
							>
								<h2 className="font-semibold text-xl">
									Categorias e finalidades
								</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Essenciais:</strong> Necessários para funcionamento
										básico, autenticação, segurança e controle de acesso. Sempre
										ativos.
									</li>
									<li>
										<strong>Funcionais:</strong> Guardam preferências como tema,
										idioma e configurações de usuário. O uso é opcional e
										depende do seu consentimento.
									</li>
									<li>
										<strong>Analytics:</strong> Coletam dados de uso para
										estatísticas agregadas como visualizações de perfis, cliques
										em links, origem de tráfego, tipo de dispositivo e país de
										origem. Só são coletados quando você permite.
									</li>
									<li>
										<strong>Marketing:</strong> Destinados à personalização de
										conteúdo e publicidade direcionada. Só são ativados com
										consentimento.
									</li>
								</ul>
							</section>



							{/* Consentimento e preferências */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="consentimento-preferencias"
							>
								<h2 className="font-semibold text-xl">
									Consentimento e preferências
								</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
							<li>Exibimos um banner para você aceitar, rejeitar ou personalizar por categoria.</li>
							<li>Suas escolhas ficam salvas para que possamos aplicá-las nas próximas visitas.</li>
							<li>Você pode revisar suas preferências a qualquer momento pelas configurações de privacidade ou limpando os cookies do navegador.</li>
							<li>Cookies essenciais permanecem ativos para garantir o funcionamento e a segurança do serviço.</li>
						</ul>
							</section>

							{/* Como nossas APIs respeitam cookies */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="apis"
							>

							</section>

							{/* Segurança, flags e escopo */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="seguranca"
							>
								<h2 className="font-semibold text-xl">Segurança e confiabilidade</h2>
						<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
							<li>Tratamos suas informações com cuidado e adotamos medidas de proteção padrão da indústria.</li>
							<li>Minimizamos o uso de dados e sempre respeitamos suas preferências.</li>
							<li>Não utilizamos cookies de terceiros sem sua autorização.</li>
						</ul>
							</section>

							{/* Retenção e expiração */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="retencao-expiracao"
							>
								<h2 className="font-semibold text-xl">Retenção e expiração</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
							<li>Suas preferências de cookies permanecem salvas por um tempo para facilitar sua experiência, e você pode alterá-las quando quiser.</li>
							<li>Sua sessão de login vence após um período e pode exigir novo acesso.</li>
							<li>Usamos estatísticas de forma agregada para melhorar o produto, conforme suas escolhas.</li>
						</ul>
							</section>

							{/* Como gerenciar e desabilitar */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="como-gerenciar"
							>
								<h2 className="font-semibold text-xl">
									Como gerenciar e desabilitar
								</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
							<li>Use o banner de cookies para aceitar, rejeitar ou personalizar por categoria.</li>
							<li>Para redefinir suas escolhas, limpe os cookies do seu navegador e recarregue o site.</li>
							<li>Você também pode configurar bloqueio de cookies nas preferências do navegador (isso pode reduzir funcionalidades essenciais).</li>
						</ul>
							</section>

							{/* Atualizações */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="atualizacoes"
							>
								<h2 className="font-semibold text-xl">Atualizações</h2>
								<p className="mt-2 text-muted-foreground">
									Podemos atualizar esta página para refletir mudanças técnicas
									ou legais. Recomendamos revisitar periodicamente para se
									manter informado.
								</p>
							</section>

							{/* Links */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="links"
							>
								<p className="text-muted-foreground">
									Consulte também os nossos{" "}
									<a className="underline hover:text-foreground" href="/termos">
										Termos e Condições
									</a>{" "}
									e a{" "}
									<a
										className="underline hover:text-foreground"
										href="/privacidade"
									>
										Política de Privacidade
									</a>
									.
								</p>
							</section>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	);
}

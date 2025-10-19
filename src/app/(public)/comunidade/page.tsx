/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
	title: "Bionk | Diretrizes da Comunidade",
	description:
		"Diretrizes completas da Comunidade Bionk: comportamento, conteúdo proibido, autenticidade, segurança, privacidade, propriedade intelectual, integridade da plataforma, consequências, apelações e denúncias.",
};

export default function DiretrizesDaComunidade() {
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
								Diretrizes da Comunidade
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
									As Diretrizes da Comunidade da Bionk existem para garantir um
									ambiente seguro, respeitoso e autêntico. Elas se aplicam a
									todos os usuários e ao conteúdo publicado, incluindo textos,
									imagens, vídeos, links, comentários e mensagens. Ao utilizar a
									plataforma, você concorda em seguir estas regras e contribuir
									para uma comunidade saudável.
								</p>
								<p className="mt-2 text-muted-foreground">
									O não cumprimento destas diretrizes pode resultar em remoção
									de conteúdo, restrição de funcionalidades, suspensão ou
									encerramento da conta.
								</p>
							</section>

							{/* Sumário */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="sumario"
							>
								<h2 className="font-semibold text-xl">Sumário</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<a
											className="underline hover:text-foreground"
											href="#principios"
										>
											Princípios
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#comportamento"
										>
											Comportamento e Uso
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#conteudo-proibido"
										>
											Conteúdo Proibido
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#propriedade-intelectual"
										>
											Propriedade Intelectual
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#seguranca-privacidade"
										>
											Segurança e Privacidade
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#integridade-plataforma"
										>
											Integridade da Plataforma
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#conteudo-sensivel"
										>
											Conteúdo Sensível e Rotulagem
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#contas-identidade"
										>
											Contas e Identidade
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#consequencias"
										>
											Consequências
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#apelacoes-denuncias"
										>
											Apelações e Denúncias
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#atualizacoes"
										>
											Atualizações
										</a>
									</li>
									<li>
										<a
											className="underline hover:text-foreground"
											href="#definicoes"
										>
											Definições
										</a>
									</li>
								</ul>
							</section>

							{/* Princípios */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="principios"
							>
								<h2 className="font-semibold text-xl">Princípios</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Respeito:</strong> trate todos com dignidade, sem
										ataques pessoais.
									</li>
									<li>
										<strong>Segurança:</strong> não cause danos físicos,
										psicológicos ou materiais.
									</li>
									<li>
										<strong>Autenticidade:</strong> não engane, manipule ou se
										faça passar por terceiros.
									</li>
									<li>
										<strong>Legalidade:</strong> não publique ou promova
										atividades ilegais.
									</li>
									<li>
										<strong>Integridade:</strong> não abuse dos recursos
										técnicos da plataforma.
									</li>
									<li>
										<strong>Privacidade:</strong> proteja dados pessoais e
										informações privadas.
									</li>
									<li>
										<strong>Responsabilidade:</strong> considere o impacto do
										seu conteúdo antes de publicar.
									</li>
								</ul>
							</section>

							{/* Comportamento e uso da plataforma */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="comportamento"
							>
								<h2 className="font-semibold text-xl">
									Comportamento e uso da plataforma
								</h2>
								<h3 className="mt-3 font-medium text-lg">Assédio e bullying</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Insultos, xingamentos e linguagem abusiva direcionada.
									</li>
									<li>
										Perseguição contínua, assédio repetido e invasão de
										privacidade.
									</li>
									<li>Ameaças de dano físico, psicológico ou material.</li>
									<li>
										Publicação de rumores maliciosos ou doxxing (exposição de
										dados privados).
									</li>
									<li>
										Ridicularização de traços pessoais (aparência, voz, condição
										de saúde).
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">Discurso de ódio</h3>
								<p className="mt-2 text-muted-foreground">
									É proibido atacar pessoas com base em características
									protegidas: raça, etnia, nacionalidade, religião, gênero,
									identidade de gênero, orientação sexual, deficiência, condição
									de saúde, idade, origem socioeconômica ou status migratório.
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Desumanização (comparar grupos a pragas, animais ou
										objetos).
									</li>
									<li>Inferiorização, segregação ou exclusão de grupos.</li>
									<li>
										Ameaças, celebração de danos ou promessas de violência a
										grupos protegidos.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Violência e incitação
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Incitar violência, incentivar agressões ou promover
										armamento ilegal.
									</li>
									<li>
										Ameaças credíveis (com detalhes, meios ou intenção
										plausível).
									</li>
									<li>
										Instruções para causar danos, fabricar explosivos ou cometer
										crimes.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Fraude, engano e manipulação
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Phishing, spoofing, golpes financeiros e esquemas de
										pirâmide.
									</li>
									<li>
										Impersonation (se passar por pessoa, marca ou entidade sem
										autorização).
									</li>
									<li>
										Manipulação de métricas (cliques falsos, compra de
										seguidores/engajamento).
									</li>
									<li>
										Redirecionamentos enganosos, mascaramento de URLs ou iscas
										de clique.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Spam e práticas abusivas
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Publicações repetitivas, irrelevantes ou de alta frequência.
									</li>
									<li>Automação de envio em massa sem autorização.</li>
									<li>
										Uso de links maliciosos, páginas de baixa qualidade e
										conteúdo duplicado.
									</li>
								</ul>
							</section>

							{/* Conteúdo proibido */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="conteudo-proibido"
							>
								<h2 className="font-semibold text-xl">Conteúdo proibido</h2>
								<h3 className="mt-3 font-medium text-lg">
									Nudez e conteúdo sexual
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Exploração sexual e sexualização de menores (proibido em
										qualquer circunstância).
									</li>
									<li>
										Atos sexuais não consensuais, coerção, fetiches violentos ou
										que glorifiquem violência.
									</li>
									<li>
										Sextorsão, solicitação de nudes ou distribuição de imagens
										íntimas sem consentimento.
									</li>
									<li>
										Exibição de conteúdo sexual explícito sem rotulagem sensível
										ativa no perfil.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Violência e automutilação
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Violência gráfica, gore e exibição de ferimentos graves.
									</li>
									<li>
										Promoção, romantização ou instruções de automutilação ou
										suicídio.
									</li>
									<li>
										Tortura, crueldade a animais e celebração de danos físicos.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Extremismo e terrorismo
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Propaganda, apologia, recrutamento ou financiamento de
										grupos extremistas.
									</li>
									<li>
										Exibição de símbolos, slogans e materiais que incentivem
										violência política.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">Conteúdo enganoso</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Desinformação que possa causar danos significativos (saúde,
										segurança, finanças).
									</li>
									<li>
										Manipulações e deepfakes não rotulados com intuito de
										enganar.
									</li>
									<li>
										Títulos sensacionalistas que distorcem fatos de forma
										deliberada.
									</li>
								</ul>
								<h3 className="mt-3 font-medium text-lg">
									Promoção de ilegalidades
								</h3>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Venda ou promoção de drogas ilícitas, armas, explosivos e
										munições.
									</li>
									<li>
										Comércio de documentos falsos, dados roubados ou
										credenciais.
									</li>
									<li>
										Pirataria digital, distribuição de material protegido sem
										autorização.
									</li>
								</ul>
							</section>

							{/* Propriedade intelectual */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="propriedade-intelectual"
							>
								<h2 className="font-semibold text-xl">
									Proteção de propriedade intelectual
								</h2>
								<p className="mt-2 text-muted-foreground">
									Respeite direitos autorais, marcas registradas, patentes e
									identidade visual. Não compartilhe obras sem autorização dos
									titulares.
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Obras protegidas: músicas, filmes, séries, transmissões
										esportivas, fotos, textos, software e jogos.
									</li>
									<li>Uso de logos e marcas sem licença é proibido.</li>
									<li>
										Links de download não autorizados e reupload de conteúdo
										removido não são permitidos.
									</li>
								</ul>
							</section>

							{/* Segurança e privacidade */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="seguranca-privacidade"
							>
								<h2 className="font-semibold text-xl">
									Segurança e privacidade
								</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Não colete ou compartilhe dados pessoais sem consentimento
										explícito e finalidade clara.
									</li>
									<li>
										Proibido doxxing: publicar endereço, telefone, documentos,
										e-mails ou conversas privadas.
									</li>
									<li>
										Evite técnicas de fingerprinting ou rastreamento invasivo
										sem base legal.
									</li>
									<li>
										Proteja menores: exploração infantil é absolutamente
										proibida.
									</li>
								</ul>
							</section>

							{/* Integridade da plataforma */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="integridade-plataforma"
							>
								<h2 className="font-semibold text-xl">
									Integridade da plataforma
								</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Uso indevido de automação (bots), scraping agressivo ou
										engenharia reversa.
									</li>
									<li>
										Tentativas de invasão, exploração de vulnerabilidades ou
										bypass de CAPTCHA.
									</li>
									<li>
										Inserção de scripts, iframes maliciosos, clickjacking ou
										manipulação do cliente.
									</li>
									<li>
										Abuso de APIs além dos limites e políticas publicados.
									</li>
								</ul>
							</section>

							{/* Conteúdo sensível */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="conteudo-sensivel"
							>
								<h2 className="font-semibold text-xl">
									Conteúdo sensível e rotulagem
								</h2>
								<p className="mt-2 text-muted-foreground">
									Permitimos conteúdo adulto consensual e legal (incluindo nudez
									e erotismo), desde que esteja claramente rotulado e restrito
									para maiores de idade. Para isso, habilite a opção{" "}
									<strong>Perfil Sensível</strong> nas configurações do Studio.
									Perfis com essa opção ativa exibem um aviso antes do acesso ao
									conteúdo.
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Ative <strong>Perfil Sensível</strong> em Configurações do
										Studio para liberar conteúdo NSFW.
									</li>
									<li>
										Mantenha conformidade legal: nunca envolva menores,
										exploração, violência ou conteúdo não consensual.
									</li>
									<li>
										Links para sites e serviços de conteúdo adulto são
										permitidos quando o perfil é sensível.
									</li>
									<li>
										Evite miniaturas e capas explícitas visíveis sem o aviso;
										use imagens neutras.
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Conteúdo adulto sem a rotulagem adequada ou publicado por
									perfis sem a opção <strong>Perfil Sensível</strong> poderá ser
									removido e a conta poderá ser restrita.
								</p>
							</section>

							{/* Contas e identidade */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="contas-identidade"
							>
								<h2 className="font-semibold text-xl">Contas e identidade</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Mantenha uma identidade verdadeira; não crie perfis falsos
										ou duplicados.
									</li>
									<li>
										Não compartilhe credenciais; proteja sua conta e
										autenticação.
									</li>
									<li>
										Impersonation de indivíduos, marcas ou entidades é proibida.
									</li>
								</ul>
							</section>

							{/* Consequências */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="consequencias"
							>
								<h2 className="font-semibold text-xl">Consequências</h2>
								<p className="mt-2 text-muted-foreground">
									Medidas podem incluir aviso, remoção de conteúdo, restrições
									temporárias, suspensão e encerramento da conta, conforme
									gravidade, recorrência e risco.
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Aplicação proporcionada ao impacto e às políticas violadas.
									</li>
									<li>
										Comunicação das medidas quando aplicável e conforme a lei.
									</li>
								</ul>
							</section>

							{/* Apelações e denúncias */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="apelacoes-denuncias"
							>
								<h2 className="font-semibold text-xl">Apelações e denúncias</h2>
								<p className="mt-2 text-muted-foreground">
									Se acreditar que uma ação foi tomada por engano, envie um
									recurso com contexto, identificando o conteúdo e a decisão.
									Denuncie violações através do canal oficial.
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Recurso: utilize o formulário em{" "}
										<a
											className="underline hover:text-foreground"
											href="/contato"
										>
											/contato
										</a>
										.
									</li>
									<li>
										Denúncia: reporte perfis/links diretamente pela plataforma
										ou via{" "}
										<a
											className="underline hover:text-foreground"
											href="/reportar-violacao"
										>
											/reportar-violacao
										</a>
										.
									</li>
								</ul>
							</section>

							{/* Atualizações */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="atualizacoes"
							>
								<h2 className="font-semibold text-xl">
									Atualizações das diretrizes
								</h2>
								<p className="mt-2 text-muted-foreground">
									As diretrizes podem ser atualizadas a qualquer momento. O
									usuário é responsável por acompanhar as mudanças e cumprir as
									regras vigentes.
								</p>
							</section>

							{/* Definições */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="definicoes"
							>
								<h2 className="font-semibold text-xl">Definições</h2>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Conteúdo:</strong> qualquer material publicado
										(texto, imagem, vídeo, link, comentário).
									</li>
									<li>
										<strong>Usuário:</strong> pessoa que cria conta, acessa ou
										interage com a plataforma.
									</li>
									<li>
										<strong>Doxxing:</strong> exposição de dados privados sem
										consentimento.
									</li>
									<li>
										<strong>Impersonation:</strong> se passar por terceiros sem
										autorização.
									</li>
									<li>
										<strong>Deepfake:</strong> mídia sintética que retrata
										pessoas de forma enganosa.
									</li>
								</ul>
							</section>

							{/* Links úteis */}
							<section
								className="scroll-mt-20 sm:scroll-mt-24 md:scroll-mt-28"
								id="links-uteis"
							>
								<p className="text-muted-foreground">
									Para mais informações, consulte também nossos{" "}
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

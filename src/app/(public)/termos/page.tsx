/* eslint-disable react/no-unescaped-entities */

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
	const dict = await getDictionary(locale, "termos");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

export default async function TermosECondicoes() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "termos");
	return (
		<div className="flex min-h-screen flex-col items-center bg-background">
			<header>
				<Header locale={locale} />
				<HeaderMobile locale={locale} />
			</header>
			<main className="flex-1 px-10 pt-28 md:px-0">
				<div className="container py-6 md:py-8 lg:py-10">
					<div className="mx-auto max-w-3xl space-y-6">
						<div>
							<h1 className="font-bold text-3xl tracking-tight">
								{dict.pageTitle}
							</h1>
							<p className="text-muted-foreground">
								Última atualização: 17/09/2025
							</p>
						</div>
						<Separator />
						<div className="space-y-6">
							<section>
								<h2 className="font-semibold text-xl">1. Introdução</h2>
								<p className="mt-2 text-muted-foreground">
									Bem-vindo ao Bionk ("nós", "nosso" ou "nos"). Estes Termos e
									Condições ("Termos") regem seu acesso e uso da plataforma
									Bionk, incluindo quaisquer aplicativos móveis, sites, software
									e serviços associados (coletivamente, o "Serviço"). Ao acessar
									ou usar o Serviço, você concorda em estar vinculado a estes
									Termos. Se você não concordar com estes Termos, não poderá
									acessar ou usar o Serviço.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									2. Aceitação dos Termos
								</h2>
								<p className="mt-2 text-muted-foreground">
									Ao criar uma conta, acessar ou usar nosso Serviço, você
									reconhece que leu, entendeu e concorda em estar vinculado a
									estes Termos. Se você estiver usando o Serviço em nome de uma
									empresa, organização ou outra entidade, você declara e garante
									que tem autoridade para vincular essa entidade a estes Termos,
									e referências a "você" e "seu" referem-se tanto a você
									individualmente quanto a essa entidade.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									3. Alterações nos Termos
								</h2>
								<p className="mt-2 text-muted-foreground">
									Reservamo-nos o direito de modificar estes Termos a qualquer
									momento. Se fizermos alterações materiais nestes Termos,
									forneceremos aviso através do nosso Serviço ou por outros
									meios. Seu uso contínuo do Serviço após as alterações terem
									sido feitas constituirá sua aceitação das alterações. Se você
									não concordar com as alterações, deverá parar de usar o
									Serviço.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									4. Registro de Conta e Segurança
								</h2>
								<p className="mt-2 text-muted-foreground">
									Para usar certos recursos do Serviço, você pode precisar criar
									uma conta. Você concorda em fornecer informações precisas,
									atuais e completas durante o processo de registro e em
									atualizar essas informações para mantê-las precisas, atuais e
									completas. Você é responsável por proteger sua senha e por
									todas as atividades que ocorrem em sua conta. Você concorda em
									nos notificar imediatamente sobre qualquer uso não autorizado
									de sua conta ou qualquer outra violação de segurança. Não
									podemos e não seremos responsáveis por qualquer perda ou dano
									decorrente de sua falha em cumprir os requisitos acima.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									5. Conteúdo do Usuário
								</h2>
								<p className="mt-2 text-muted-foreground">
									Nosso Serviço permite que você crie, carregue, armazene e
									compartilhe conteúdo, incluindo texto, links, imagens e outros
									materiais (coletivamente, "Conteúdo do Usuário"). Você mantém
									todos os direitos e é o único responsável pelo Conteúdo do
									Usuário que você publica no Serviço.
								</p>
								<p className="mt-2 text-muted-foreground">
									Ao criar, carregar, postar ou compartilhar Conteúdo do Usuário
									no ou através do Serviço, você nos concede uma licença
									mundial, não exclusiva, livre de royalties (com o direito de
									sublicenciar) para usar, copiar, reproduzir, processar,
									adaptar, modificar, publicar, transmitir, exibir e distribuir
									tal Conteúdo do Usuário em qualquer e todos os meios ou
									métodos de distribuição agora conhecidos ou posteriormente
									desenvolvidos. Esta licença nos permite disponibilizar seu
									Conteúdo do Usuário para o resto do mundo e permitir que
									outros façam o mesmo.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									6. Política de Uso Aceitável
								</h2>
								<p className="mt-2 text-muted-foreground">
									Você concorda em não usar o Serviço para:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Qualquer propósito ilegal ou para solicitar outros a
										realizar ou participar de atos ilegais
									</li>
									<li>
										Violar qualquer regulamento, regra, lei ou ordenança local,
										estadual, nacional ou internacional
									</li>
									<li>
										Infringir ou violar nossos direitos de propriedade
										intelectual ou os direitos de propriedade intelectual de
										terceiros
									</li>
									<li>
										Assediar, abusar, insultar, prejudicar, difamar, caluniar,
										depreciar, intimidar ou discriminar com base em gênero,
										orientação sexual, religião, etnia, raça, idade,
										nacionalidade ou deficiência
									</li>
									<li>Enviar informações falsas ou enganosas ou spam</li>
									<li>
										Fazer upload ou transmitir vírus ou qualquer outro tipo de
										código malicioso que será ou pode ser usado de qualquer
										forma que afete a funcionalidade ou operação do Serviço ou
										de qualquer site relacionado, outros sites ou a Internet
									</li>
									<li>Coletar ou rastrear as informações pessoais de outros</li>
									<li>Spam, phish, pharm, pretext, spider, crawl ou scrape</li>
									<li>
										Qualquer propósito obsceno ou imoral ou para criar links que
										redirecionem para conteúdo inadequado
									</li>
									<li>
										Interferir ou contornar os recursos de segurança do Serviço
										ou qualquer site relacionado, outros sites ou a Internet
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Reservamo-nos o direito de encerrar seu uso do Serviço ou
									qualquer site relacionado por violar qualquer um dos usos
									proibidos.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									6.1 Coleta de Dados e Analytics
								</h3>
								<p className="mt-2 text-muted-foreground">
									Para melhorar nossos serviços e fornecer analytics detalhados,
									coletamos informações sobre o uso da plataforma, incluindo:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Dados de cliques e visualizações de links</li>
									<li>
										Informações sobre origem do tráfego (redes sociais,
										referrers)
									</li>
									<li>
										Tipo de dispositivo e sistema operacional (de forma
										anonimizada)
									</li>
									<li>Localização geográfica aproximada (nível de país)</li>
									<li>Dados de navegação e interação com a plataforma</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Todos os dados são coletados em conformidade com a LGPD e
									nossa Política de Privacidade. Você pode gerenciar suas
									preferências de cookies e analytics através das configurações
									da plataforma.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									7. Direitos de Propriedade Intelectual
								</h2>
								<p className="mt-2 text-muted-foreground">
									O Serviço e seu conteúdo original (excluindo o Conteúdo do
									Usuário), recursos e funcionalidades são e permanecerão
									propriedade exclusiva do Bionk e seus licenciadores. O Serviço
									é protegido por direitos autorais, marcas registradas e outras
									leis tanto do Brasil quanto de países estrangeiros. Nossas
									marcas registradas e identidade visual não podem ser usadas em
									conexão com qualquer produto ou serviço sem o consentimento
									prévio por escrito do Bionk.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									8. DMCA e Política de Direitos Autorais
								</h2>
								<p className="mt-2 text-muted-foreground">
									Respeitamos os direitos de propriedade intelectual de
									terceiros e esperamos que os usuários do Serviço façam o
									mesmo. Responderemos a notificações de alegadas violações de
									direitos autorais que estejam em conformidade com a lei
									aplicável e sejam devidamente fornecidas a nós. Se você
									acredita que seu conteúdo foi copiado de uma maneira que
									constitui violação de direitos autorais, forneça-nos as
									seguintes informações:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Uma assinatura física ou eletrônica do proprietário dos
										direitos autorais ou uma pessoa autorizada a agir em seu
										nome
									</li>
									<li>
										Identificação da obra protegida por direitos autorais que
										alegadamente foi violada
									</li>
									<li>
										Identificação do material que supostamente está infringindo
										ou que é objeto de atividade infratora e que deve ser
										removido
									</li>
									<li>
										Informações razoavelmente suficientes para nos permitir
										contatá-lo, como endereço, número de telefone e endereço de
										e-mail
									</li>
									<li>
										Uma declaração sua de que você acredita de boa-fé que o uso
										do material da maneira reclamada não é autorizado pelo
										proprietário dos direitos autorais, seu agente ou a lei
									</li>
									<li>
										Uma declaração de que as informações na notificação são
										precisas e, sob pena de perjúrio, que você está autorizado a
										agir em nome do proprietário dos direitos autorais
									</li>
								</ul>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									9. Política de Privacidade
								</h2>
								<p className="mt-2 text-muted-foreground">
									Consulte nossa Política de Privacidade para obter informações
									sobre como coletamos, usamos e divulgamos informações de
									nossos usuários. Ao usar o Serviço, você concorda com a coleta
									e uso de informações de acordo com nossa Política de
									Privacidade.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									10. Links e Serviços de Terceiros
								</h2>
								<p className="mt-2 text-muted-foreground">
									O Serviço pode conter links para sites ou serviços de
									terceiros que não são de propriedade ou controlados pelo
									Bionk. Não temos controle sobre, e não assumimos
									responsabilidade pelo conteúdo, políticas de privacidade ou
									práticas de quaisquer sites ou serviços de terceiros. Você
									reconhece e concorda ainda que o Bionk não será responsável,
									direta ou indiretamente, por qualquer dano ou perda causada ou
									alegadamente causada por ou em conexão com o uso ou confiança
									em qualquer conteúdo, bens ou serviços disponíveis em ou
									através de tais sites ou serviços.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">11. Rescisão</h2>
								<p className="mt-2 text-muted-foreground">
									Podemos encerrar ou suspender sua conta e impedir o acesso ao
									Serviço imediatamente, sem aviso prévio ou responsabilidade,
									sob nosso exclusivo critério, por qualquer motivo e sem
									limitação, incluindo, mas não se limitando a, uma violação dos
									Termos. Se você deseja encerrar sua conta, você pode
									simplesmente descontinuar o uso do Serviço ou excluir sua
									conta através da página de configurações. Todas as disposições
									dos Termos que, por sua natureza, devem sobreviver à rescisão,
									sobreviverão à rescisão, incluindo, sem limitação, disposições
									de propriedade, isenções de garantia, indenização e limitações
									de responsabilidade.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									11.1 Exclusão de Conta pelo Usuário
								</h3>
								<p className="mt-2 text-muted-foreground">
									Você pode solicitar a exclusão permanente de sua conta a
									qualquer momento através das configurações da sua conta. A
									exclusão de conta é irreversível e resultará na remoção
									permanente de:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Todos os seus dados pessoais e informações de perfil</li>
									<li>Todos os links criados e suas estatísticas</li>
									<li>Dados de analytics e visualizações</li>
									<li>Configurações e preferências personalizadas</li>
									<li>Histórico de atividades e interações</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Após a confirmação da exclusão, seus dados serão removidos de
									nossos sistemas em até 30 dias, exceto quando a retenção for
									exigida por lei. Links públicos criados por você podem
									permanecer inacessíveis, mas não serão transferidos para
									outros usuários.
								</p>
								<p className="mt-2 text-muted-foreground">
									<strong>Importante:</strong> A exclusão da conta não pode ser
									desfeita. Certifique-se de fazer backup de qualquer informação
									importante antes de proceder com a exclusão.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">12. Indenização</h2>
								<p className="mt-2 text-muted-foreground">
									Você concorda em defender, indenizar e isentar o Bionk, sua
									empresa controladora, diretores, administradores, funcionários
									e agentes, de e contra quaisquer reclamações, danos,
									obrigações, perdas, responsabilidades, custos ou dívidas e
									despesas (incluindo, mas não se limitando a honorários
									advocatícios) decorrentes de: (i) seu uso e acesso ao Serviço;
									(ii) sua violação de qualquer termo destes Termos; (iii) sua
									violação de qualquer direito de terceiros, incluindo, sem
									limitação, qualquer direito autoral, propriedade ou direito de
									privacidade; ou (iv) qualquer alegação de que seu Conteúdo do
									Usuário causou danos a terceiros. Esta obrigação de defesa e
									indenização sobreviverá a estes Termos e ao seu uso do
									Serviço.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									13. Limitação de Responsabilidade
								</h2>
								<p className="mt-2 text-muted-foreground">
									Em nenhum caso o Bionk, nem seus diretores, funcionários,
									parceiros, agentes, fornecedores ou afiliados, serão
									responsáveis por quaisquer danos indiretos, incidentais,
									especiais, consequenciais ou punitivos, incluindo, sem
									limitação, perda de lucros, dados, uso, boa vontade ou outras
									perdas intangíveis, resultantes de (i) seu acesso ou uso ou
									incapacidade de acessar ou usar o Serviço; (ii) qualquer
									conduta ou conteúdo de terceiros no Serviço; (iii) qualquer
									conteúdo obtido do Serviço; e (iv) acesso não autorizado, uso
									ou alteração de suas transmissões ou conteúdo, seja com base
									em garantia, contrato, ato ilícito (incluindo negligência) ou
									qualquer outra teoria legal, independentemente de termos sido
									informados da possibilidade de tais danos, e mesmo que um
									recurso estabelecido aqui seja considerado como tendo falhado
									em seu propósito essencial.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									14. Isenção de Responsabilidade
								</h2>
								<p className="mt-2 text-muted-foreground">
									Seu uso do Serviço é por sua conta e risco. O Serviço é
									fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL". O Serviço é
									fornecido sem garantias de qualquer tipo, sejam expressas ou
									implícitas, incluindo, mas não se limitando a, garantias
									implícitas de comercialização, adequação a um propósito
									específico, não violação ou curso de desempenho. O Bionk, suas
									subsidiárias, afiliadas e seus licenciadores não garantem que
									a) o Serviço funcionará ininterruptamente, de forma segura ou
									disponível em qualquer momento ou local específico; b)
									quaisquer erros ou defeitos serão corrigidos; c) o Serviço
									está livre de vírus ou outros componentes prejudiciais; ou d)
									os resultados do uso do Serviço atenderão aos seus requisitos.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">15. Lei Aplicável</h2>
								<p className="mt-2 text-muted-foreground">
									Estes Termos serão regidos e interpretados de acordo com as
									leis do Brasil, sem considerar suas disposições sobre
									conflitos de leis. Nossa falha em fazer cumprir qualquer
									direito ou disposição destes Termos não será considerada uma
									renúncia a esses direitos. Se qualquer disposição destes
									Termos for considerada inválida ou inexequível por um
									tribunal, as disposições restantes destes Termos permanecerão
									em vigor. Estes Termos constituem o acordo completo entre nós
									em relação ao nosso Serviço e substituem e substituem
									quaisquer acordos anteriores que possamos ter tido entre nós
									em relação ao Serviço.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									16. Resolução de Disputas
								</h2>
								<p className="mt-2 text-muted-foreground">
									Quaisquer disputas decorrentes ou relacionadas a estes Termos
									ou ao Serviço serão resolvidas por meio de arbitragem
									vinculativa de acordo com as regras do Centro de Arbitragem e
									Mediação da Câmara de Comércio Brasil-Canadá. A arbitragem
									será conduzida em São Paulo, SP. A decisão do árbitro será
									final e vinculativa, e o julgamento sobre a sentença proferida
									pelo árbitro poderá ser registrado em qualquer tribunal com
									jurisdição sobre o assunto. Não obstante o acima exposto,
									podemos buscar medida cautelar ou outro recurso equitativo
									para proteger nossos direitos de propriedade intelectual em
									qualquer tribunal de jurisdição competente.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									17. Informações de Contato
								</h2>
								<p className="mt-2 text-muted-foreground">
									Se você tiver alguma dúvida sobre estes Termos, entre em
									contato conosco em:
								</p>
								<p className="mt-2 text-muted-foreground">
									Bionk
									<br />
									Brasil
									<br />
									Email: suporte@bionk.me
								</p>
							</section>
						</div>
					</div>
				</div>
			</main>
			<Footer locale={locale} />
		</div>
	);
}

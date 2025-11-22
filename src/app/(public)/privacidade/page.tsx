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
	const dict = await getDictionary(locale, "privacidade");
	return { title: dict.metadataTitle, description: dict.metadataDescription };
}

export default async function PoliticaDePrivacidade() {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "privacidade");
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
									A Bionk ("nós", "nosso" ou "nos") está comprometida em
									proteger sua privacidade. Esta Política de Privacidade explica
									como coletamos, usamos, divulgamos e protegemos suas
									informações quando você utiliza nosso serviço de link na bio,
									aplicativo móvel e website (coletivamente, o "Serviço").
								</p>
								<p className="mt-2 text-muted-foreground">
									Por favor, leia esta Política de Privacidade cuidadosamente.
									Ao acessar ou usar nosso Serviço, você concorda com a coleta e
									uso de informações de acordo com esta política. Se você não
									concordar com nossa política, por favor, não utilize nosso
									Serviço.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									2. Informações que Coletamos
								</h2>
								<p className="mt-2 text-muted-foreground">
									Coletamos vários tipos de informações para fornecer e melhorar
									nosso Serviço para você:
								</p>
								<h3 className="mt-3 font-medium text-lg">
									2.1 Informações Pessoais
								</h3>
								<p className="mt-2 text-muted-foreground">
									Ao se registrar ou usar nosso Serviço, podemos solicitar que
									você nos forneça certas informações pessoalmente
									identificáveis que podem ser usadas para contatá-lo ou
									identificá-lo ("Dados Pessoais"). As informações pessoalmente
									identificáveis podem incluir, mas não se limitam a:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Endereço de e-mail</li>
									<li>Nome e sobrenome</li>
									<li>Número de telefone</li>
									<li>
										Endereço, estado, província, CEP/código postal, cidade
									</li>
									<li>Cookies e dados de uso</li>
									<li>
										Informações de perfil de redes sociais quando você se
										conecta através delas
									</li>
								</ul>

								<h3 className="mt-3 font-medium text-lg">
									2.2 Dados de Uso e Analytics
								</h3>
								<p className="mt-2 text-muted-foreground">
									Também coletamos informações sobre como o Serviço é acessado e
									usado ("Dados de Uso"). Esses Dados de Uso podem incluir
									informações como o endereço de Protocolo de Internet do seu
									computador (por exemplo, endereço IP), tipo de navegador,
									versão do navegador, as páginas do nosso Serviço que você
									visita, a hora e data da sua visita, o tempo gasto nessas
									páginas, identificadores exclusivos de dispositivos e outros
									dados de diagnóstico.
								</p>
								<p className="mt-2 text-muted-foreground">
									Especificamente, coletamos dados detalhados de analytics para
									melhorar nossos serviços:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Dados de Cliques:</strong> Registramos cliques em
										links para fornecer estatísticas aos usuários
									</li>
									<li>
										<strong>Visualizações de Perfil:</strong> Contabilizamos
										visualizações de perfis públicos
									</li>
									<li>
										<strong>Origem do Tráfego:</strong> Identificamos de onde os
										visitantes chegam (Instagram, WhatsApp, TikTok, Facebook,
										Twitter/X, LinkedIn, Telegram, YouTube, etc.)
									</li>
									<li>
										<strong>Detecção de Dispositivo:</strong> Identificamos o
										tipo de dispositivo (mobile, tablet, desktop) de forma
										anonimizada
									</li>
									<li>
										<strong>Sistema Operacional:</strong> Coletamos informações
										sobre o sistema operacional usado
									</li>
									<li>
										<strong>User-Agent:</strong> Analisamos o User-Agent para
										melhor detecção de plataformas e dispositivos
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Todos esses dados são coletados respeitando suas preferências
									de cookies e podem ser desabilitados através das configurações
									de privacidade.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									2.3 Dados de Localização
								</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos usar e armazenar informações sobre sua localização se
									você nos der permissão para isso ("Dados de Localização").
									Usamos esses dados para fornecer recursos do nosso Serviço e
									para melhorar e personalizar nosso Serviço.
								</p>
								<p className="mt-2 text-muted-foreground">
									Você pode ativar ou desativar os serviços de localização
									quando usa nosso Serviço a qualquer momento através das
									configurações do seu dispositivo.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									2.4 Dados de Rastreamento e Cookies
								</h3>
								<p className="mt-2 text-muted-foreground">
									Usamos cookies e tecnologias de rastreamento similares para
									rastrear a atividade em nosso Serviço e armazenar certas
									informações. Implementamos um sistema de consentimento de
									cookies em conformidade com a LGPD.
								</p>
								<p className="mt-2 text-muted-foreground">
									Cookies são arquivos com pequena quantidade de dados que podem
									incluir um identificador exclusivo anônimo. Os cookies são
									enviados para o seu navegador a partir de um site e
									armazenados no seu dispositivo. Outras tecnologias de
									rastreamento também são usadas, como beacons, tags e scripts
									para coletar e rastrear informações e para melhorar e analisar
									nosso Serviço.
								</p>
								<p className="mt-2 text-muted-foreground">
									Você pode instruir seu navegador a recusar todos os cookies ou
									indicar quando um cookie está sendo enviado. No entanto, se
									você não aceitar cookies, pode não conseguir usar algumas
									partes do nosso Serviço. Você também pode gerenciar suas
									preferências através do nosso banner de cookies.
								</p>
								<p className="mt-2 text-muted-foreground">
									Tipos de Cookies que usamos:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Cookies Essenciais:</strong> Necessários para o
										funcionamento básico do site, autenticação e segurança
										(sempre ativos)
									</li>
									<li>
										<strong>Cookies Funcionais:</strong> Armazenam preferências
										de tema, idioma e configurações de usuário
									</li>
									<li>
										<strong>Cookies de Analytics:</strong> Coletam dados sobre
										visualizações de perfil, cliques, origem do tráfego, tipo de
										dispositivo e localização por país
									</li>
									<li>
										<strong>Cookies de Marketing:</strong> Usados para
										personalização de conteúdo e publicidade direcionada
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									<strong>Importante:</strong> Você pode personalizar suas
									preferências de cookies a qualquer momento através das
									configurações de privacidade da plataforma. Os dados de
									analytics só são coletados com seu consentimento explícito.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									3. Uso das Informações
								</h2>
								<p className="mt-2 text-muted-foreground">
									A Bionk usa as informações coletadas para diversos fins:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Para fornecer e manter nosso Serviço</li>
									<li>Para notificá-lo sobre mudanças em nosso Serviço</li>
									<li>
										Para permitir que você participe de recursos interativos do
										nosso Serviço quando você optar por fazê-lo
									</li>
									<li>Para fornecer suporte ao cliente</li>
									<li>
										Para coletar análises ou informações valiosas para que
										possamos melhorar nosso Serviço
									</li>
									<li>Para monitorar o uso do nosso Serviço</li>
									<li>Para detectar, prevenir e resolver problemas técnicos</li>
									<li>
										Para cumprir qualquer outro propósito para o qual você
										forneceu as informações
									</li>
									<li>
										Para cumprir nossas obrigações e fazer valer nossos direitos
										decorrentes de quaisquer contratos firmados entre você e
										nós, incluindo os Termos e Condições
									</li>
									<li>
										Para fornecer-lhe avisos sobre sua conta e/ou assinatura,
										incluindo avisos de expiração e renovação, e-mails de
										instruções, etc.
									</li>
									<li>
										Para fornecer-lhe notícias, ofertas especiais e informações
										gerais sobre outros bens, serviços e eventos que oferecemos
										que são semelhantes aos que você já comprou ou perguntou, a
										menos que você tenha optado por não receber tais informações
									</li>
									<li>
										De qualquer outra forma que possamos descrever quando você
										fornecer as informações
									</li>
									<li>Para qualquer outro propósito com o seu consentimento</li>
								</ul>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									4. Compartilhamento de Dados
								</h2>
								<p className="mt-2 text-muted-foreground">
									Podemos compartilhar suas informações pessoais nas seguintes
									situações:
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.1 Com Provedores de Serviços
								</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos compartilhar suas informações com provedores de
									serviços terceirizados que usamos para apoiar nosso negócio,
									como processadores de pagamento, provedores de análise de
									dados, provedores de e-mail, provedores de hospedagem,
									provedores de serviço ao cliente e provedores de marketing.
									Esses terceiros têm acesso às suas Informações Pessoais apenas
									para realizar essas tarefas em nosso nome e são obrigados a
									não divulgar ou usar as informações para qualquer outro
									propósito.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.2 Para Transferências de Negócios
								</h3>
								<p className="mt-2 text-muted-foreground">
									Se a Bionk estiver envolvida em uma fusão, aquisição ou venda
									de ativos, suas Informações Pessoais podem ser transferidas.
									Forneceremos aviso antes que suas Informações Pessoais sejam
									transferidas e se tornem sujeitas a uma Política de
									Privacidade diferente.
								</p>

								<h3 className="mt-3 font-medium text-lg">4.3 Com Afiliados</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos compartilhar suas informações com nossas afiliadas,
									caso em que exigiremos que essas afiliadas honrem esta
									Política de Privacidade. As afiliadas incluem nossa empresa
									controladora e quaisquer outras subsidiárias, parceiros de
									joint venture ou outras empresas que controlamos ou que estão
									sob controle comum conosco.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.4 Com Parceiros de Negócios
								</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos compartilhar suas informações com nossos parceiros de
									negócios para oferecer certos produtos, serviços ou promoções
									a você.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.5 Com Outros Usuários
								</h3>
								<p className="mt-2 text-muted-foreground">
									Quando você compartilha informações pessoais ou interage nas
									áreas públicas com outros usuários, essas informações podem
									ser visualizadas por todos os usuários e podem ser
									distribuídas publicamente fora do Serviço. Se você interagir
									com outros usuários ou se registrar através de uma rede social
									de terceiros, seus contatos na rede social de terceiros podem
									ver seu nome, perfil, imagens e descrição da sua atividade.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.6 Com Seu Consentimento
								</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos divulgar suas Informações Pessoais para qualquer outro
									propósito com o seu consentimento.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									4.7 Por Exigência Legal
								</h3>
								<p className="mt-2 text-muted-foreground">
									Podemos divulgar suas Informações Pessoais em boa fé,
									acreditando que tal ação é necessária para:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Cumprir uma obrigação legal</li>
									<li>
										Proteger e defender os direitos ou propriedade da Bionk
									</li>
									<li>
										Prevenir ou investigar possíveis irregularidades em conexão
										com o Serviço
									</li>
									<li>
										Proteger a segurança pessoal dos usuários do Serviço ou do
										público
									</li>
									<li>Proteger contra responsabilidade legal</li>
								</ul>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									7. Seus Direitos de Privacidade (LGPD)
								</h2>
								<p className="mt-2 text-muted-foreground">
									De acordo com a Lei Geral de Proteção de Dados (LGPD), você
									tem os seguintes direitos em relação aos seus dados pessoais:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										<strong>Confirmação da existência de tratamento:</strong>{" "}
										Direito de obter confirmação sobre o tratamento de seus
										dados pessoais
									</li>
									<li>
										<strong>Acesso aos dados:</strong> Direito de acessar seus
										dados pessoais que estão sendo tratados
									</li>
									<li>
										<strong>Correção de dados:</strong> Direito de solicitar a
										correção de dados incompletos, inexatos ou desatualizados
									</li>
									<li>
										<strong>Anonimização ou eliminação:</strong> Direito de
										solicitar a anonimização, bloqueio ou eliminação de dados
										desnecessários ou excessivos
									</li>
									<li>
										<strong>Portabilidade:</strong> Direito de solicitar a
										portabilidade dos dados a outro fornecedor de serviço
									</li>
									<li>
										<strong>Eliminação (Direito ao Esquecimento):</strong>{" "}
										Direito de solicitar a eliminação dos dados tratados com seu
										consentimento
									</li>
									<li>
										<strong>Informação sobre compartilhamento:</strong> Direito
										de ser informado sobre entidades com as quais seus dados
										foram compartilhados
									</li>
									<li>
										<strong>Revogação do consentimento:</strong> Direito de
										revogar o consentimento a qualquer momento
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Para exercer qualquer um desses direitos, você pode:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Usar as configurações de privacidade disponíveis em sua
										conta
									</li>
									<li>
										Utilizar a funcionalidade de exclusão de conta nas
										configurações
									</li>
									<li>
										Entrar em contato conosco através dos canais de suporte
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									Responderemos às suas solicitações dentro do prazo
									estabelecido pela LGPD (15 dias, prorrogáveis por mais 15
									dias).
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">8. Segurança de Dados</h2>
								<p className="mt-2 text-muted-foreground">
									A segurança de seus dados é importante para nós, mas lembre-se
									que nenhum método de transmissão pela Internet ou método de
									armazenamento eletrônico é 100% seguro. Embora nos esforcemos
									para usar meios comercialmente aceitáveis para proteger suas
									Informações Pessoais, não podemos garantir sua segurança
									absoluta.
								</p>
								<p className="mt-2 text-muted-foreground">
									Implementamos medidas de segurança técnicas, administrativas e
									físicas projetadas para proteger suas informações pessoais
									contra acesso não autorizado, uso ou divulgação. Estas medidas
									incluem:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>Criptografia de dados sensíveis</li>
									<li>Firewalls e sistemas de detecção de intrusão</li>
									<li>Controles de acesso para funcionários e contratados</li>
									<li>
										Monitoramento regular de nossos sistemas para possíveis
										vulnerabilidades
									</li>
								</ul>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									6. Exclusão de Dados e Direito ao Esquecimento
								</h2>
								<p className="mt-2 text-muted-foreground">
									Em conformidade com a LGPD, você tem o direito de solicitar a
									exclusão de seus dados pessoais. Oferecemos duas formas de
									exclusão:
								</p>

								<h3 className="mt-3 font-medium text-lg">
									6.1 Exclusão de Conta pelo Usuário
								</h3>
								<p className="mt-2 text-muted-foreground">
									Você pode excluir sua conta a qualquer momento através das
									configurações da sua conta. Ao solicitar a exclusão:
								</p>
								<ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
									<li>
										Todos os seus dados pessoais serão removidos permanentemente
									</li>
									<li>
										Seu perfil e links associados serão desativados
										imediatamente
									</li>
									<li>Dados de analytics e visualizações serão anonimizados</li>
									<li>Assinaturas ativas serão canceladas automaticamente</li>
									<li>
										Notificações de exclusão serão enviadas para nossos sistemas
										internos
									</li>
								</ul>
								<p className="mt-2 text-muted-foreground">
									<strong>Prazo de Processamento:</strong> A exclusão é
									processada imediatamente, mas pode levar até 30 dias para ser
									completamente removida de todos os nossos sistemas e backups.
								</p>
								<p className="mt-2 text-muted-foreground">
									<strong>Importante:</strong> A exclusão da conta é
									irreversível. Certifique-se de fazer backup de qualquer
									informação importante antes de prosseguir.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									6.2 Solicitação de Exclusão de Dados Específicos
								</h3>
								<p className="mt-2 text-muted-foreground">
									Você também pode solicitar a exclusão de dados específicos sem
									excluir toda a conta. Para isso, entre em contato conosco
									através dos canais de suporte disponíveis.
								</p>

								<h3 className="mt-3 font-medium text-lg">
									6.3 Retenção de Dados Legais
								</h3>
								<p className="mt-2 text-muted-foreground">
									Alguns dados podem ser mantidos por períodos específicos
									quando exigido por lei, regulamentação ou para fins de
									segurança e prevenção de fraudes, mesmo após a solicitação de
									exclusão.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									9. Privacidade Infantil
								</h2>
								<p className="mt-2 text-muted-foreground">
									Nosso Serviço não se dirige a menores de 13 anos ("Crianças").
								</p>
								<p className="mt-2 text-muted-foreground">
									Não coletamos intencionalmente informações pessoalmente
									identificáveis de crianças menores de 13 anos. Se você é pai
									ou responsável e está ciente de que seu filho nos forneceu
									Dados Pessoais, entre em contato conosco. Se tomarmos
									conhecimento de que coletamos Dados Pessoais de crianças sem
									verificação do consentimento dos pais, tomamos medidas para
									remover essas informações de nossos servidores.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									10. Transferências Internacionais de Dados
								</h2>
								<p className="mt-2 text-muted-foreground">
									Suas informações, incluindo Dados Pessoais, podem ser
									transferidas para — e mantidas em — computadores localizados
									fora do seu estado, província, país ou outra jurisdição
									governamental onde as leis de proteção de dados podem ser
									diferentes das da sua jurisdição.
								</p>
								<p className="mt-2 text-muted-foreground">
									Se você está localizado fora do Brasil e opta por nos fornecer
									informações, observe que transferimos os dados, incluindo
									Dados Pessoais, para o Brasil e os processamos lá.
								</p>
								<p className="mt-2 text-muted-foreground">
									Seu consentimento com esta Política de Privacidade, seguido
									pelo envio de tais informações, representa sua concordância
									com essa transferência.
								</p>
								<p className="mt-2 text-muted-foreground">
									A Bionk tomará todas as medidas razoavelmente necessárias para
									garantir que seus dados sejam tratados com segurança e de
									acordo com esta Política de Privacidade e nenhuma
									transferência de seus Dados Pessoais ocorrerá para uma
									organização ou país, a menos que existam controles adequados
									em vigor, incluindo a segurança de seus dados e outras
									informações pessoais.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									11. Links para Outros Sites
								</h2>
								<p className="mt-2 text-muted-foreground">
									Nosso Serviço pode conter links para outros sites que não são
									operados por nós. Se você clicar em um link de terceiros, você
									será direcionado para o site desse terceiro. Recomendamos
									fortemente que você revise a Política de Privacidade de cada
									site que visitar.
								</p>
								<p className="mt-2 text-muted-foreground">
									Não temos controle e não assumimos responsabilidade pelo
									conteúdo, políticas de privacidade ou práticas de quaisquer
									sites ou serviços de terceiros.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">
									12. Alterações a Esta Política de Privacidade
								</h2>
								<p className="mt-2 text-muted-foreground">
									Podemos atualizar nossa Política de Privacidade de tempos em
									tempos. Notificaremos você sobre quaisquer alterações
									publicando a nova Política de Privacidade nesta página.
								</p>
								<p className="mt-2 text-muted-foreground">
									Informaremos você por e-mail e/ou um aviso proeminente em
									nosso Serviço, antes que a alteração se torne efetiva e
									atualizaremos a "data de vigência" no topo desta Política de
									Privacidade.
								</p>
								<p className="mt-2 text-muted-foreground">
									Recomendamos que você revise esta Política de Privacidade
									periodicamente para quaisquer alterações. Alterações a esta
									Política de Privacidade são efetivas quando são publicadas
									nesta página.
								</p>
							</section>

							<section>
								<h2 className="font-semibold text-xl">13. Contato</h2>
								<p className="mt-2 text-muted-foreground">
									Se você tiver alguma dúvida sobre esta Política de
									Privacidade, entre em contato conosco:
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

/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import Footer from "@/components/Footer"
import HeaderMobile from "@/components/HeaderMobile"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "Bionk | Política de Privacidade",
  description: "Saiba como a Bionk protege seus dados. Nossa Política de Privacidade explica de forma clara como coletamos, usamos e protegemos suas informações.",
};

export default function PoliticaDePrivacidade() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background">
      <header>
       <Header />
       <HeaderMobile />
      </header>
      <main className="flex-1 pt-28 px-10 md:px-0">
        <div className="container py-6 md:py-8 lg:py-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
              <p className="text-muted-foreground">Última atualização: 26/03/2025</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">1. Introdução</h2>
                <p className="mt-2 text-muted-foreground">
                  A Bionk ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de
                  Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você
                  utiliza nosso serviço de link na bio, aplicativo móvel e website (coletivamente, o "Serviço").
                </p>
                <p className="mt-2 text-muted-foreground">
                  Por favor, leia esta Política de Privacidade cuidadosamente. Ao acessar ou usar nosso Serviço, você
                  concorda com a coleta e uso de informações de acordo com esta política. Se você não concordar com
                  nossa política, por favor, não utilize nosso Serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Informações que Coletamos</h2>
                <p className="mt-2 text-muted-foreground">
                  Coletamos vários tipos de informações para fornecer e melhorar nosso Serviço para você:
                </p>
                <h3 className="mt-3 text-lg font-medium">2.1 Informações Pessoais</h3>
                <p className="mt-2 text-muted-foreground">
                  Ao se registrar ou usar nosso Serviço, podemos solicitar que você nos forneça certas informações
                  pessoalmente identificáveis que podem ser usadas para contatá-lo ou identificá-lo ("Dados Pessoais").
                  As informações pessoalmente identificáveis podem incluir, mas não se limitam a:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Endereço de e-mail</li>
                  <li>Nome e sobrenome</li>
                  <li>Número de telefone</li>
                  <li>Endereço, estado, província, CEP/código postal, cidade</li>
                  <li>Cookies e dados de uso</li>
                  <li>Informações de perfil de redes sociais quando você se conecta através delas</li>
                </ul>

                <h3 className="mt-3 text-lg font-medium">2.2 Dados de Uso</h3>
                <p className="mt-2 text-muted-foreground">
                  Também coletamos informações sobre como o Serviço é acessado e usado ("Dados de Uso"). Esses Dados de
                  Uso podem incluir informações como o endereço de Protocolo de Internet do seu computador (por exemplo,
                  endereço IP), tipo de navegador, versão do navegador, as páginas do nosso Serviço que você visita, a
                  hora e data da sua visita, o tempo gasto nessas páginas, identificadores exclusivos de dispositivos e
                  outros dados de diagnóstico.
                </p>

                <h3 className="mt-3 text-lg font-medium">2.3 Dados de Localização</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos usar e armazenar informações sobre sua localização se você nos der permissão para isso ("Dados
                  de Localização"). Usamos esses dados para fornecer recursos do nosso Serviço e para melhorar e
                  personalizar nosso Serviço.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Você pode ativar ou desativar os serviços de localização quando usa nosso Serviço a qualquer momento
                  através das configurações do seu dispositivo.
                </p>

                <h3 className="mt-3 text-lg font-medium">2.4 Dados de Rastreamento e Cookies</h3>
                <p className="mt-2 text-muted-foreground">
                  Usamos cookies e tecnologias de rastreamento similares para rastrear a atividade em nosso Serviço e
                  armazenar certas informações.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Cookies são arquivos com pequena quantidade de dados que podem incluir um identificador exclusivo
                  anônimo. Os cookies são enviados para o seu navegador a partir de um site e armazenados no seu
                  dispositivo. Outras tecnologias de rastreamento também são usadas, como beacons, tags e scripts para
                  coletar e rastrear informações e para melhorar e analisar nosso Serviço.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Você pode instruir seu navegador a recusar todos os cookies ou indicar quando um cookie está sendo
                  enviado. No entanto, se você não aceitar cookies, pode não conseguir usar algumas partes do nosso
                  Serviço.
                </p>
                <p className="mt-2 text-muted-foreground">Exemplos de Cookies que usamos:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>
                    <strong>Cookies de Sessão:</strong> Usamos Cookies de Sessão para operar nosso Serviço.
                  </li>
                  <li>
                    <strong>Cookies de Preferência:</strong> Usamos Cookies de Preferência para lembrar suas
                    preferências e várias configurações.
                  </li>
                  <li>
                    <strong>Cookies de Segurança:</strong> Usamos Cookies de Segurança para fins de segurança.
                  </li>
                  <li>
                    <strong>Cookies de Publicidade:</strong> Cookies de Publicidade são usados para apresentar anúncios
                    que podem ser relevantes para você e seus interesses.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Uso das Informações</h2>
                <p className="mt-2 text-muted-foreground">A Bionk usa as informações coletadas para diversos fins:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Para fornecer e manter nosso Serviço</li>
                  <li>Para notificá-lo sobre mudanças em nosso Serviço</li>
                  <li>
                    Para permitir que você participe de recursos interativos do nosso Serviço quando você optar por
                    fazê-lo
                  </li>
                  <li>Para fornecer suporte ao cliente</li>
                  <li>Para coletar análises ou informações valiosas para que possamos melhorar nosso Serviço</li>
                  <li>Para monitorar o uso do nosso Serviço</li>
                  <li>Para detectar, prevenir e resolver problemas técnicos</li>
                  <li>Para cumprir qualquer outro propósito para o qual você forneceu as informações</li>
                  <li>
                    Para cumprir nossas obrigações e fazer valer nossos direitos decorrentes de quaisquer contratos
                    firmados entre você e nós, incluindo os Termos e Condições
                  </li>
                  <li>
                    Para fornecer-lhe avisos sobre sua conta e/ou assinatura, incluindo avisos de expiração e renovação,
                    e-mails de instruções, etc.
                  </li>
                  <li>
                    Para fornecer-lhe notícias, ofertas especiais e informações gerais sobre outros bens, serviços e
                    eventos que oferecemos que são semelhantes aos que você já comprou ou perguntou, a menos que você
                    tenha optado por não receber tais informações
                  </li>
                  <li>De qualquer outra forma que possamos descrever quando você fornecer as informações</li>
                  <li>Para qualquer outro propósito com o seu consentimento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Compartilhamento de Dados</h2>
                <p className="mt-2 text-muted-foreground">
                  Podemos compartilhar suas informações pessoais nas seguintes situações:
                </p>

                <h3 className="mt-3 text-lg font-medium">4.1 Com Provedores de Serviços</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos compartilhar suas informações com provedores de serviços terceirizados que usamos para apoiar
                  nosso negócio, como processadores de pagamento, provedores de análise de dados, provedores de e-mail,
                  provedores de hospedagem, provedores de serviço ao cliente e provedores de marketing. Esses terceiros
                  têm acesso às suas Informações Pessoais apenas para realizar essas tarefas em nosso nome e são
                  obrigados a não divulgar ou usar as informações para qualquer outro propósito.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.2 Para Transferências de Negócios</h3>
                <p className="mt-2 text-muted-foreground">
                  Se a Bionk estiver envolvida em uma fusão, aquisição ou venda de ativos, suas Informações Pessoais
                  podem ser transferidas. Forneceremos aviso antes que suas Informações Pessoais sejam transferidas e se
                  tornem sujeitas a uma Política de Privacidade diferente.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.3 Com Afiliados</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos compartilhar suas informações com nossas afiliadas, caso em que exigiremos que essas afiliadas
                  honrem esta Política de Privacidade. As afiliadas incluem nossa empresa controladora e quaisquer
                  outras subsidiárias, parceiros de joint venture ou outras empresas que controlamos ou que estão sob
                  controle comum conosco.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.4 Com Parceiros de Negócios</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos compartilhar suas informações com nossos parceiros de negócios para oferecer certos produtos,
                  serviços ou promoções a você.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.5 Com Outros Usuários</h3>
                <p className="mt-2 text-muted-foreground">
                  Quando você compartilha informações pessoais ou interage nas áreas públicas com outros usuários, essas
                  informações podem ser visualizadas por todos os usuários e podem ser distribuídas publicamente fora do
                  Serviço. Se você interagir com outros usuários ou se registrar através de uma rede social de
                  terceiros, seus contatos na rede social de terceiros podem ver seu nome, perfil, imagens e descrição
                  da sua atividade.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.6 Com Seu Consentimento</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos divulgar suas Informações Pessoais para qualquer outro propósito com o seu consentimento.
                </p>

                <h3 className="mt-3 text-lg font-medium">4.7 Por Exigência Legal</h3>
                <p className="mt-2 text-muted-foreground">
                  Podemos divulgar suas Informações Pessoais em boa fé, acreditando que tal ação é necessária para:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Cumprir uma obrigação legal</li>
                  <li>Proteger e defender os direitos ou propriedade da Bionk</li>
                  <li>Prevenir ou investigar possíveis irregularidades em conexão com o Serviço</li>
                  <li>Proteger a segurança pessoal dos usuários do Serviço ou do público</li>
                  <li>Proteger contra responsabilidade legal</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Segurança de Dados</h2>
                <p className="mt-2 text-muted-foreground">
                  A segurança de seus dados é importante para nós, mas lembre-se que nenhum método de transmissão pela
                  Internet ou método de armazenamento eletrônico é 100% seguro. Embora nos esforcemos para usar meios
                  comercialmente aceitáveis para proteger suas Informações Pessoais, não podemos garantir sua segurança
                  absoluta.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Implementamos medidas de segurança técnicas, administrativas e físicas projetadas para proteger suas
                  informações pessoais contra acesso não autorizado, uso ou divulgação. Estas medidas incluem:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Criptografia de dados sensíveis</li>
                  <li>Firewalls e sistemas de detecção de intrusão</li>
                  <li>Controles de acesso para funcionários e contratados</li>
                  <li>Monitoramento regular de nossos sistemas para possíveis vulnerabilidades</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Seus Direitos de Privacidade</h2>
                <p className="mt-2 text-muted-foreground">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD) e outras leis de proteção de dados aplicáveis,
                  você tem certos direitos em relação às suas informações pessoais:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>
                    <strong>Direito de acesso:</strong> Você tem o direito de solicitar cópias de suas informações
                    pessoais.
                  </li>
                  <li>
                    <strong>Direito de retificação:</strong> Você tem o direito de solicitar que corrijamos qualquer
                    informação que você acredite ser imprecisa. Você também tem o direito de solicitar que completemos
                    informações que você acredita estarem incompletas.
                  </li>
                  <li>
                    <strong>Direito ao esquecimento:</strong> Você tem o direito de solicitar que apaguemos suas
                    informações pessoais, sob certas condições.
                  </li>
                  <li>
                    <strong>Direito à restrição de processamento:</strong> Você tem o direito de solicitar que
                    restrinjamos o processamento de suas informações pessoais, sob certas condições.
                  </li>
                  <li>
                    <strong>Direito à portabilidade de dados:</strong> Você tem o direito de solicitar que transfiramos
                    os dados que coletamos para outra organização, ou diretamente para você, sob certas condições.
                  </li>
                  <li>
                    <strong>Direito de oposição:</strong> Você tem o direito de se opor ao nosso processamento de suas
                    informações pessoais, sob certas condições.
                  </li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  Se você deseja exercer qualquer desses direitos, entre em contato conosco através das informações de
                  contato fornecidas no final desta política. Responderemos à sua solicitação dentro do prazo exigido
                  pela lei aplicável.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Privacidade Infantil</h2>
                <p className="mt-2 text-muted-foreground">
                  Nosso Serviço não se dirige a menores de 13 anos ("Crianças").
                </p>
                <p className="mt-2 text-muted-foreground">
                  Não coletamos intencionalmente informações pessoalmente identificáveis de crianças menores de 13 anos.
                  Se você é pai ou responsável e está ciente de que seu filho nos forneceu Dados Pessoais, entre em
                  contato conosco. Se tomarmos conhecimento de que coletamos Dados Pessoais de crianças sem verificação
                  do consentimento dos pais, tomamos medidas para remover essas informações de nossos servidores.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Transferências Internacionais de Dados</h2>
                <p className="mt-2 text-muted-foreground">
                  Suas informações, incluindo Dados Pessoais, podem ser transferidas para — e mantidas em — computadores
                  localizados fora do seu estado, província, país ou outra jurisdição governamental onde as leis de
                  proteção de dados podem ser diferentes das da sua jurisdição.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Se você está localizado fora do Brasil e opta por nos fornecer informações, observe que transferimos
                  os dados, incluindo Dados Pessoais, para o Brasil e os processamos lá.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Seu consentimento com esta Política de Privacidade, seguido pelo envio de tais informações, representa
                  sua concordância com essa transferência.
                </p>
                <p className="mt-2 text-muted-foreground">
                  A Bionk tomará todas as medidas razoavelmente necessárias para garantir que seus dados sejam tratados
                  com segurança e de acordo com esta Política de Privacidade e nenhuma transferência de seus Dados
                  Pessoais ocorrerá para uma organização ou país, a menos que existam controles adequados em vigor,
                  incluindo a segurança de seus dados e outras informações pessoais.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. Links para Outros Sites</h2>
                <p className="mt-2 text-muted-foreground">
                  Nosso Serviço pode conter links para outros sites que não são operados por nós. Se você clicar em um
                  link de terceiros, você será direcionado para o site desse terceiro. Recomendamos fortemente que você
                  revise a Política de Privacidade de cada site que visitar.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Não temos controle e não assumimos responsabilidade pelo conteúdo, políticas de privacidade ou
                  práticas de quaisquer sites ou serviços de terceiros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">10. Alterações a Esta Política de Privacidade</h2>
                <p className="mt-2 text-muted-foreground">
                  Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre
                  quaisquer alterações publicando a nova Política de Privacidade nesta página.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Informaremos você por e-mail e/ou um aviso proeminente em nosso Serviço, antes que a alteração se
                  torne efetiva e atualizaremos a "data de vigência" no topo desta Política de Privacidade.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.
                  Alterações a esta Política de Privacidade são efetivas quando são publicadas nesta página.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">11. Contato</h2>
                <p className="mt-2 text-muted-foreground">
                  Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
                </p>
                <p className="mt-2 text-muted-foreground">
                  Bionk
                  <br />
                  Brasil
                  <br />
                  Email: suporte@bionk.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


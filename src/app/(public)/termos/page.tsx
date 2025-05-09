/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/layout/Header"
import HeaderMobile from "@/components/layout/HeaderMobile"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Bionk | Termos e Condições",
  description: "Leia os Termos e Condições da Bionk. Entenda seus direitos, deveres e como nossa plataforma funciona de forma transparente e segura.",
};

export default function TermosECondicoes() {
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
              <h1 className="text-3xl font-bold tracking-tight">Termos e Condições</h1>
              <p className="text-muted-foreground">Última atualização: 26/03/2025</p>
            </div>
            <Separator />
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">1. Introdução</h2>
                <p className="mt-2 text-muted-foreground">
                  Bem-vindo ao Bionk ("nós", "nosso" ou "nos"). Estes Termos e Condições ("Termos") regem seu acesso e
                  uso da plataforma Bionk, incluindo quaisquer aplicativos móveis, sites, software e serviços associados
                  (coletivamente, o "Serviço"). Ao acessar ou usar o Serviço, você concorda em estar vinculado a estes
                  Termos. Se você não concordar com estes Termos, não poderá acessar ou usar o Serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Aceitação dos Termos</h2>
                <p className="mt-2 text-muted-foreground">
                  Ao criar uma conta, acessar ou usar nosso Serviço, você reconhece que leu, entendeu e concorda em
                  estar vinculado a estes Termos. Se você estiver usando o Serviço em nome de uma empresa, organização
                  ou outra entidade, você declara e garante que tem autoridade para vincular essa entidade a estes
                  Termos, e referências a "você" e "seu" referem-se tanto a você individualmente quanto a essa entidade.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Alterações nos Termos</h2>
                <p className="mt-2 text-muted-foreground">
                  Reservamo-nos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações materiais
                  nestes Termos, forneceremos aviso através do nosso Serviço ou por outros meios. Seu uso contínuo do
                  Serviço após as alterações terem sido feitas constituirá sua aceitação das alterações. Se você não
                  concordar com as alterações, deverá parar de usar o Serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Registro de Conta e Segurança</h2>
                <p className="mt-2 text-muted-foreground">
                  Para usar certos recursos do Serviço, você pode precisar criar uma conta. Você concorda em fornecer
                  informações precisas, atuais e completas durante o processo de registro e em atualizar essas
                  informações para mantê-las precisas, atuais e completas. Você é responsável por proteger sua senha e
                  por todas as atividades que ocorrem em sua conta. Você concorda em nos notificar imediatamente sobre
                  qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança. Não podemos e não
                  seremos responsáveis por qualquer perda ou dano decorrente de sua falha em cumprir os requisitos
                  acima.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Conteúdo do Usuário</h2>
                <p className="mt-2 text-muted-foreground">
                  Nosso Serviço permite que você crie, carregue, armazene e compartilhe conteúdo, incluindo texto,
                  links, imagens e outros materiais (coletivamente, "Conteúdo do Usuário"). Você mantém todos os
                  direitos e é o único responsável pelo Conteúdo do Usuário que você publica no Serviço.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Ao criar, carregar, postar ou compartilhar Conteúdo do Usuário no ou através do Serviço, você nos
                  concede uma licença mundial, não exclusiva, livre de royalties (com o direito de sublicenciar) para
                  usar, copiar, reproduzir, processar, adaptar, modificar, publicar, transmitir, exibir e distribuir tal
                  Conteúdo do Usuário em qualquer e todos os meios ou métodos de distribuição agora conhecidos ou
                  posteriormente desenvolvidos. Esta licença nos permite disponibilizar seu Conteúdo do Usuário para o
                  resto do mundo e permitir que outros façam o mesmo.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Política de Uso Aceitável</h2>
                <p className="mt-2 text-muted-foreground">Você concorda em não usar o Serviço para:</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Violar qualquer lei ou regulamento aplicável</li>
                  <li>Infringir os direitos de propriedade intelectual de terceiros</li>
                  <li>Transmitir qualquer material que seja difamatório, ofensivo ou de outra forma censurável</li>
                  <li>Enviar comunicações comerciais não solicitadas (spam)</li>
                  <li>Carregar ou transmitir vírus, malware ou outro código malicioso</li>
                  <li>Tentar obter acesso não autorizado ao Serviço ou sistemas relacionados</li>
                  <li>Interferir ou interromper a integridade ou o desempenho do Serviço</li>
                  <li>Coletar ou colher dados de usuários sem permissão</li>
                  <li>Personificar outra pessoa ou entidade</li>
                  <li>Usar o Serviço para qualquer finalidade ilegal ou não autorizada</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Direitos de Propriedade Intelectual</h2>
                <p className="mt-2 text-muted-foreground">
                  O Serviço e seu conteúdo original (excluindo o Conteúdo do Usuário), recursos e funcionalidades são e
                  permanecerão propriedade exclusiva do Bionk e seus licenciadores. O Serviço é protegido por direitos
                  autorais, marcas registradas e outras leis tanto do Brasil quanto de países estrangeiros.
                  Nossas marcas registradas e identidade visual não podem ser usadas em conexão com qualquer produto ou
                  serviço sem o consentimento prévio por escrito do Bionk.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. DMCA e Política de Direitos Autorais</h2>
                <p className="mt-2 text-muted-foreground">
                  Respeitamos os direitos de propriedade intelectual de terceiros e esperamos que os usuários do Serviço
                  façam o mesmo. Responderemos a notificações de alegadas violações de direitos autorais que estejam em
                  conformidade com a lei aplicável e sejam devidamente fornecidas a nós. Se você acredita que seu
                  conteúdo foi copiado de uma maneira que constitui violação de direitos autorais, forneça-nos as
                  seguintes informações:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                  <li>
                    Uma assinatura física ou eletrônica do proprietário dos direitos autorais ou uma pessoa autorizada a
                    agir em seu nome
                  </li>
                  <li>Identificação da obra protegida por direitos autorais que alegadamente foi violada</li>
                  <li>
                    Identificação do material que supostamente está infringindo ou que é objeto de atividade infratora e
                    que deve ser removido
                  </li>
                  <li>
                    Informações razoavelmente suficientes para nos permitir contatá-lo, como endereço, número de
                    telefone e endereço de e-mail
                  </li>
                  <li>
                    Uma declaração sua de que você acredita de boa-fé que o uso do material da maneira reclamada não é
                    autorizado pelo proprietário dos direitos autorais, seu agente ou a lei
                  </li>
                  <li>
                    Uma declaração de que as informações na notificação são precisas e, sob pena de perjúrio, que você
                    está autorizado a agir em nome do proprietário dos direitos autorais
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. Política de Privacidade</h2>
                <p className="mt-2 text-muted-foreground">
                  Consulte nossa Política de Privacidade para obter informações sobre como coletamos, usamos e
                  divulgamos informações de nossos usuários. Ao usar o Serviço, você concorda com a coleta e uso de
                  informações de acordo com nossa Política de Privacidade.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">10. Links e Serviços de Terceiros</h2>
                <p className="mt-2 text-muted-foreground">
                  O Serviço pode conter links para sites ou serviços de terceiros que não são de propriedade ou
                  controlados pelo Bionk. Não temos controle sobre, e não assumimos responsabilidade pelo conteúdo,
                  políticas de privacidade ou práticas de quaisquer sites ou serviços de terceiros. Você reconhece e
                  concorda ainda que o Bionk não será responsável, direta ou indiretamente, por qualquer dano ou perda
                  causada ou alegadamente causada por ou em conexão com o uso ou confiança em qualquer conteúdo, bens ou
                  serviços disponíveis em ou através de tais sites ou serviços.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">11. Rescisão</h2>
                <p className="mt-2 text-muted-foreground">
                  Podemos encerrar ou suspender sua conta e impedir o acesso ao Serviço imediatamente, sem aviso prévio
                  ou responsabilidade, sob nosso exclusivo critério, por qualquer motivo e sem limitação, incluindo, mas
                  não se limitando a, uma violação dos Termos. Se você deseja encerrar sua conta, você pode simplesmente
                  descontinuar o uso do Serviço ou excluir sua conta através da página de configurações. Todas as
                  disposições dos Termos que, por sua natureza, devem sobreviver à rescisão, sobreviverão à rescisão,
                  incluindo, sem limitação, disposições de propriedade, isenções de garantia, indenização e limitações
                  de responsabilidade.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">12. Indenização</h2>
                <p className="mt-2 text-muted-foreground">
                  Você concorda em defender, indenizar e isentar o Bionk, sua empresa controladora, diretores,
                  administradores, funcionários e agentes, de e contra quaisquer reclamações, danos, obrigações, perdas,
                  responsabilidades, custos ou dívidas e despesas (incluindo, mas não se limitando a honorários
                  advocatícios) decorrentes de: (i) seu uso e acesso ao Serviço; (ii) sua violação de qualquer termo
                  destes Termos; (iii) sua violação de qualquer direito de terceiros, incluindo, sem limitação, qualquer
                  direito autoral, propriedade ou direito de privacidade; ou (iv) qualquer alegação de que seu Conteúdo
                  do Usuário causou danos a terceiros. Esta obrigação de defesa e indenização sobreviverá a estes Termos
                  e ao seu uso do Serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">13. Limitação de Responsabilidade</h2>
                <p className="mt-2 text-muted-foreground">
                  Em nenhum caso o Bionk, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou
                  afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou
                  punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas
                  intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade de acessar ou usar o Serviço; (ii)
                  qualquer conduta ou conteúdo de terceiros no Serviço; (iii) qualquer conteúdo obtido do Serviço; e
                  (iv) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo, seja com base em
                  garantia, contrato, ato ilícito (incluindo negligência) ou qualquer outra teoria legal,
                  independentemente de termos sido informados da possibilidade de tais danos, e mesmo que um recurso
                  estabelecido aqui seja considerado como tendo falhado em seu propósito essencial.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">14. Isenção de Responsabilidade</h2>
                <p className="mt-2 text-muted-foreground">
                  Seu uso do Serviço é por sua conta e risco. O Serviço é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL".
                  O Serviço é fornecido sem garantias de qualquer tipo, sejam expressas ou implícitas, incluindo, mas
                  não se limitando a, garantias implícitas de comercialização, adequação a um propósito específico, não
                  violação ou curso de desempenho. O Bionk, suas subsidiárias, afiliadas e seus licenciadores não
                  garantem que a) o Serviço funcionará ininterruptamente, de forma segura ou disponível em qualquer
                  momento ou local específico; b) quaisquer erros ou defeitos serão corrigidos; c) o Serviço está livre
                  de vírus ou outros componentes prejudiciais; ou d) os resultados do uso do Serviço atenderão aos seus
                  requisitos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">15. Lei Aplicável</h2>
                <p className="mt-2 text-muted-foreground">
                  Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas
                  disposições sobre conflitos de leis. Nossa falha em fazer cumprir qualquer direito ou disposição
                  destes Termos não será considerada uma renúncia a esses direitos. Se qualquer disposição destes Termos
                  for considerada inválida ou inexequível por um tribunal, as disposições restantes destes Termos
                  permanecerão em vigor. Estes Termos constituem o acordo completo entre nós em relação ao nosso Serviço
                  e substituem e substituem quaisquer acordos anteriores que possamos ter tido entre nós em relação ao
                  Serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">16. Resolução de Disputas</h2>
                <p className="mt-2 text-muted-foreground">
                  Quaisquer disputas decorrentes ou relacionadas a estes Termos ou ao Serviço serão resolvidas por meio
                  de arbitragem vinculativa de acordo com as regras do Centro de Arbitragem e Mediação da Câmara de
                  Comércio Brasil-Canadá. A arbitragem será conduzida em São Paulo, SP. A decisão do árbitro será final
                  e vinculativa, e o julgamento sobre a sentença proferida pelo árbitro poderá ser registrado em
                  qualquer tribunal com jurisdição sobre o assunto. Não obstante o acima exposto, podemos buscar medida
                  cautelar ou outro recurso equitativo para proteger nossos direitos de propriedade intelectual em
                  qualquer tribunal de jurisdição competente.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">17. Informações de Contato</h2>
                <p className="mt-2 text-muted-foreground">
                  Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em:
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
      <Footer />
    </div>
  )
}


/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next"
import {
    BookOpen,
    Palette,
    Zap,
    HelpCircle,
    MessageSquare,
    TrendingUp,
    Bell,
    User,
    Mail,
    FileText,
    Send,
    Settings,
    UserPlus,
    Layout,
    Share2,
    PaintBucket,
    Image as ImageIcon,
    List,
    Sparkles,
    Type,
    Link2,
    BarChart2,
    Clock,
    Users,
    DollarSign,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Footer from "@/components/layout/Footer"
import HeaderAjuda from "./header-ajuda"

export const metadata: Metadata = {
  title: "Bionk | Central de ajuda",
  description: "Encontre respostas imediatas na Central de Ajuda da Bionk. Tutoriais, FAQs, contato de suporte e soluções passo a passo para resolver seus problemas. Estamos aqui para ajudar!",
};

export default function HelpCenter() {
  return (
    <div>
      <HeaderAjuda />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>Primeiros Passos</CardTitle>
              </div>
              <CardDescription>Aprenda o básico para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/como-criar-uma-conta">Como criar sua conta</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/configurando-seu-perfil">Configurando seu perfil</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/adicionando-seu-primeiro-link">Adicionando seu primeiro link</Link >
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                  <Layout className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/personalizando-sua-pagina">Personalizando sua página</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/compartilhando-seu-bionk">Compartilhando seu Bionk</Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle>Personalização</CardTitle>
              </div>
              <CardDescription>Torne sua página única</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm hover:text-purple-600 cursor-pointer transition-colors">
                  <PaintBucket className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/alterando-cores-e-temas">Alterando cores e temas</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-purple-600 cursor-pointer transition-colors">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/adicionando-imagens-e-icones">Adicionando imagens e ícones</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-purple-600 cursor-pointer transition-colors">
                  <List className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/organizando-seus-links">Organizando seus links</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-purple-600 cursor-pointer transition-colors">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/usando-animacoes-e-efeitos">Usando animações e efeitos</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-purple-600 cursor-pointer transition-colors">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/fontes-e-estilos-de-texto">Fontes e estilos de texto</Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle>Recursos Avançados</CardTitle>
              </div>
              <CardDescription>Maximize sua presença online</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm hover:text-green-600 cursor-pointer transition-colors">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/analise-de-cliques-e-visitas">Análise de cliques e visitas</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-green-600 cursor-pointer transition-colors">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/programando-publicacao-de-links">Programando publicação de links</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-green-600 cursor-pointer transition-colors">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/recursos-para-criadores-de-conteudo">Recursos para criadores de conteúdo</Link>
                </li>
                <li className="flex items-center gap-2 text-sm hover:text-green-600 cursor-pointer transition-colors">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Link href="/ajuda/guia/monetizacao-e-links-de-afiliados">Monetização e links de afiliados</Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="mb-10">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="faq" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Contato</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>Respostas para as dúvidas mais comuns</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Como posso alterar meu nome de usuário?</AccordionTrigger>
                    <AccordionContent>
                      Para alterar seu nome de usuário, acesse as configurações do seu perfil, clique em "Editar perfil" e
                      atualize o campo "Nome de usuário". Lembre-se que seu nome de usuário deve ser único e será usado na
                      URL da sua página.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Posso adicionar mais de um link para a mesma rede social?</AccordionTrigger>
                    <AccordionContent>
                      Sim, você pode adicionar quantos links desejar, mesmo que sejam para a mesma plataforma. Isso é útil
                      para quem tem múltiplos perfis ou canais em uma mesma rede social.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Como posso ver quantas pessoas clicaram nos meus links?</AccordionTrigger>
                    <AccordionContent>
                      Acesse a seção "Análises" no painel de controle para visualizar estatísticas detalhadas sobre
                      cliques, visitas e interações com sua página e links individuais.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>É possível programar a publicação de links?</AccordionTrigger>
                    <AccordionContent>
                      Sim, com nossa função de agendamento, você pode programar quando um link ficará visível em sua
                      página. Isso é ideal para promoções temporárias ou lançamentos.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Posso personalizar os ícones dos meus links?</AccordionTrigger>
                    <AccordionContent>
                      Absolutamente! Você pode escolher entre nossa biblioteca de ícones ou fazer upload de imagens
                      personalizadas para cada um dos seus links.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Entre em Contato</CardTitle>
                <CardDescription>Não encontrou o que procurava? Fale conosco</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className=" text-sm font-medium mb-1 flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Nome</span>
                      </label>
                      <Input id="name" placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label htmlFor="email" className=" text-sm font-medium mb-1 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className=" text-sm font-medium mb-1 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Assunto</span>
                    </label>
                    <Input id="subject" placeholder="Sobre o que você precisa de ajuda?" />
                  </div>
                  <div>
                    <label htmlFor="message" className=" text-sm font-medium mb-1 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Mensagem</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Descreva detalhadamente sua dúvida ou problema..."
                    ></textarea>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Enviar Mensagem</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-amber-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle>Artigos Populares</CardTitle>
              </div>
              <CardDescription>Conteúdo mais acessado pelos usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <Link href="/ajuda/artigo/como-criar-um-link-na-bio-que-converte" className="text-sm hover:text-amber-600 cursor-pointer transition-colors">
                    Como criar um link na bio que converte
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <Link href="/ajuda/artigo/10-dicas-para-aumentar-seus-seguidores" className="text-sm hover:text-amber-600 cursor-pointer transition-colors">
                    10 dicas para aumentar seus seguidores
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <Link href="/ajuda/artigo/como-usar-analises-para-melhorar-seu-desempenho" className="text-sm hover:text-amber-600 cursor-pointer transition-colors">
                    Como usar análises para melhorar seu desempenho
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <Link href="/ajuda/artigo/integrando-seu-link-na-bio-com-o-instagram" className="text-sm hover:text-amber-600 cursor-pointer transition-colors">
                    Integrando seu link na bio com o Instagram
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    5
                  </span>
                  <Link href="/ajuda/artigo/melhores-praticas-para-criadores-de-conteudo" className="text-sm hover:text-amber-600 cursor-pointer transition-colors">
                    Melhores práticas para criadores de conteúdo
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-cyan-500 hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-cyan-600" />
                </div>
                <CardTitle>Atualizações Recentes</CardTitle>
              </div>
              <CardDescription>Novidades e melhorias na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4 text-cyan-600" />
                    <span>Novos temas e opções de personalização</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Adicionamos 15 novos temas e mais opções de personalização para sua página.
                  </p>
                  <p className="text-xs text-cyan-600 mt-1 ml-6">Há 2 dias</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-cyan-600" />
                    <span>Melhorias na análise de dados</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Agora você pode ver dados demográficos e comportamentais dos seus visitantes.
                  </p>
                  <p className="text-xs text-cyan-600 mt-1 ml-6">Há 1 semana</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-cyan-600" />
                    <span>Integração com TikTok</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Agora é possível conectar diretamente sua conta do TikTok e exibir seus vídeos.
                  </p>
                  <p className="text-xs text-cyan-600 mt-1 ml-6">Há 2 semanas</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-600" />
                    <span>Novo recurso de agendamento</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Programe quando seus links ficarão visíveis em sua página.
                  </p>
                  <p className="text-xs text-cyan-600 mt-1 ml-6">Há 1 mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}


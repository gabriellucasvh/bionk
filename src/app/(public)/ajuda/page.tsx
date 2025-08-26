/* eslint-disable react/no-unescaped-entities */

import Footer from "@/components/layout/Footer";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BarChart2,
	BookOpen,
	Clock,
	DollarSign,
	HelpCircle,
	Image as ImageIcon,
	Layout,
	Link2,
	List,
	PaintBucket,
	Palette,
	Settings,
	Share2,
	Sparkles,
	TrendingUp,
	Type,
	UserPlus,
	Users,
	Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import HeaderAjuda from "./header-ajuda";

export const metadata: Metadata = {
	title: "Bionk | Central de ajuda",
	description:
		"Encontre respostas imediatas na Central de Ajuda da Bionk. Tutoriais, FAQs, contato de suporte e soluções passo a passo para resolver seus problemas. Estamos aqui para ajudar!",
};

export default function HelpCenter() {
	return (
		<div>
			<HeaderAjuda />
			<div className="container mx-auto max-w-6xl px-4 py-8">
				<div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
					<Card className="border-l-4 border-l-blue-500 transition-all hover:shadow-md">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<div className="rounded-full bg-blue-100 p-2">
									<BookOpen className="h-5 w-5 text-blue-600" />
								</div>
								<CardTitle>Primeiros Passos</CardTitle>
							</div>
							<CardDescription>Aprenda o básico para começar</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600">
									<UserPlus className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/como-criar-uma-conta">
										Como criar sua conta
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600">
									<Settings className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/configurando-seu-perfil">
										Configurando seu perfil
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600">
									<Link2 className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/adicionando-seu-primeiro-link">
										Adicionando seu primeiro link
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600">
									<Layout className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/personalizando-sua-pagina">
										Personalizando sua página
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600">
									<Share2 className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/compartilhando-seu-bionk">
										Compartilhando seu Bionk
									</Link>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-purple-500 transition-all hover:shadow-md">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<div className="rounded-full bg-purple-100 p-2">
									<Palette className="h-5 w-5 text-purple-600" />
								</div>
								<CardTitle>Personalização</CardTitle>
							</div>
							<CardDescription>Torne sua página única</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-purple-600">
									<PaintBucket className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/alterando-cores-e-temas">
										Alterando cores e temas
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-purple-600">
									<ImageIcon className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/adicionando-imagens-e-icones">
										Adicionando imagens e ícones
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-purple-600">
									<List className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/organizando-seus-links">
										Organizando seus links
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-purple-600">
									<Sparkles className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/usando-animacoes-e-efeitos">
										Usando animações e efeitos
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-purple-600">
									<Type className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/fontes-e-estilos-de-texto">
										Fontes e estilos de texto
									</Link>
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-green-500 transition-all hover:shadow-md">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<div className="rounded-full bg-green-100 p-2">
									<Zap className="h-5 w-5 text-green-600" />
								</div>
								<CardTitle>Recursos Avançados</CardTitle>
							</div>
							<CardDescription>Maximize sua presença online</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-green-600">
									<BarChart2 className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/analise-de-cliques-e-visitas">
										Análise de cliques e visitas
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-green-600">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/programando-publicacao-de-links">
										Programando publicação de links
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-green-600">
									<Users className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/recursos-para-criadores-de-conteudo">
										Recursos para criadores de conteúdo
									</Link>
								</li>
								<li className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-green-600">
									<DollarSign className="h-4 w-4 text-muted-foreground" />
									<Link href="/ajuda/guia/monetizacao-e-links-de-afiliados">
										Monetização e links de afiliados
									</Link>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>

				{/* Apenas FAQ direto */}
				<Card className="mb-10">
					<CardHeader>
						<div className="flex items-center gap-2">
							<HelpCircle className="h-5 w-5" />
							<CardTitle>Perguntas Frequentes</CardTitle>
						</div>
						<CardDescription>
							Respostas para as dúvidas mais comuns
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Accordion className="w-full" collapsible type="single">
							<AccordionItem value="item-1">
								<AccordionTrigger>
									Como posso alterar meu nome de usuário?
								</AccordionTrigger>
								<AccordionContent>
									Para alterar seu nome de usuário, acesse as configurações do
									seu perfil, clique em "Editar perfil" e atualize o campo "Nome
									de usuário". Lembre-se que seu nome de usuário deve ser único
									e será usado na URL da sua página.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>
									Posso adicionar mais de um link para a mesma rede social?
								</AccordionTrigger>
								<AccordionContent>
									Sim, você pode adicionar quantos links desejar, mesmo que
									sejam para a mesma plataforma. Isso é útil para quem tem
									múltiplos perfis ou canais em uma mesma rede social.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>
									Como posso ver quantas pessoas clicaram nos meus links?
								</AccordionTrigger>
								<AccordionContent>
									Acesse a seção "Análises" no painel de controle para
									visualizar estatísticas detalhadas sobre cliques, visitas e
									interações com sua página e links individuais.
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-4">
								<AccordionTrigger>
									É possível programar a publicação de links?
								</AccordionTrigger>
								<AccordionContent>
									Sim, com nossa função de agendamento, você pode programar
									quando um link ficará visível em sua página. Isso é ideal para
									promoções temporárias ou lançamentos.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-amber-500 transition-all hover:shadow-md">
					<CardHeader>
						<div className="flex items-center gap-2">
							<div className="rounded-full bg-amber-100 p-2">
								<TrendingUp className="h-5 w-5 text-amber-600" />
							</div>
							<CardTitle>Artigos Populares</CardTitle>
						</div>
						<CardDescription>
							Conteúdo mais acessado pelos usuários
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-3">
							<li className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 text-xs">
									1
								</span>
								<Link
									className="cursor-pointer text-sm transition-colors hover:text-amber-600"
									href="/ajuda/artigo/como-criar-um-link-na-bio-que-converte"
								>
									Como criar um link na bio que converte
								</Link>
							</li>
							<li className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 text-xs">
									2
								</span>
								<Link
									className="cursor-pointer text-sm transition-colors hover:text-amber-600"
									href="/ajuda/artigo/10-dicas-para-aumentar-seus-seguidores"
								>
									10 dicas para aumentar seus seguidores
								</Link>
							</li>
							<li className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 text-xs">
									3
								</span>
								<Link
									className="cursor-pointer text-sm transition-colors hover:text-amber-600"
									href="/ajuda/artigo/como-usar-analises-para-melhorar-seu-desempenho"
								>
									Como usar análises para melhorar seu desempenho
								</Link>
							</li>
							<li className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 text-xs">
									4
								</span>
								<Link
									className="cursor-pointer text-sm transition-colors hover:text-amber-600"
									href="/ajuda/artigo/integrando-seu-link-na-bio-com-o-instagram"
								>
									Integrando seu link na bio com o Instagram
								</Link>
							</li>
							<li className="flex items-center gap-2">
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-600 text-xs">
									5
								</span>
								<Link
									className="cursor-pointer text-sm transition-colors hover:text-amber-600"
									href="/ajuda/artigo/melhores-praticas-para-criadores-de-conteudo"
								>
									Melhores práticas para criadores de conteúdo
								</Link>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
}

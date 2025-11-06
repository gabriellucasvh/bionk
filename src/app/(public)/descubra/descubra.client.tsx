"use client";

import {
	Blend,
	ChartNoAxesCombined,
	Globe,
	PartyPopper,
	Plus,
	Rocket,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BaseButton } from "@/components/buttons/BaseButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeaderMobile from "@/components/layout/HeaderMobile";
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

const featureCards = [
	{
		icon: <Plus className="h-8 w-8 text-lime-300" />,
		title: "Crie seu Link in Bio gratuito com o Bionk",
		desc: "Obtenha um link exclusivo que centraliza todo o seu conteúdo, permitindo que seus seguidores acessem suas publicações de forma simples e intuitiva.",
	},
	{
		icon: <Blend className="text-lime-300" />,
		title: "Atualize seu link em todas as redes sociais",
		desc: "Personalize seu URL e utilize-o em qualquer plataforma, reunindo seu conteúdo de forma prática para facilitar o acesso dos seus seguidores.",
	},
	{
		icon: <PartyPopper className="text-lime-300" />,
		title: "Expanda seu alcance e engajamento",
		desc: "Conecte seu público a todas as suas postagens e oportunidades, transformando seu perfil em uma central dinâmica de conteúdos e interações.",
	},
];

const analyticsFeatures = [
	{
		icon: (
			<ChartNoAxesCombined className="flex-shrink-0 p-4 text-white" size={50} />
		),
		title: "Estatísticas em tempo real",
		desc: "Acompanhe visitantes, cliques e conversões em tempo real com painéis detalhados.",
	},
	{
		icon: <Rocket className="flex-shrink-0 p-4 text-white" size={50} />,
		title: "Análise de Desempenho",
		desc: "Identifique quais links e conteúdos geram mais engajamento para otimizar sua estratégia.",
	},
	{
		icon: <Globe className="flex-shrink-0 p-4 text-white" size={50} />,
		title: "Dados Demográficos",
		desc: "Conheça a localização, dispositivos e comportamento do seu público para decisões mais inteligentes.",
	},
];

const faqItems = [
	{
		value: "item-1",
		trigger: "O que é a Bionk?",
		content:
			"A Bionk é uma plataforma inovadora de link in bio que centraliza todos os seus links e conteúdos em uma única página. Desenvolvida para facilitar a gestão e a divulgação de suas redes sociais, a plataforma oferece uma interface intuitiva e recursos que permitem a personalização completa da sua página.",
	},
	{
		value: "item-2",
		trigger: "Como faço para criar uma conta?",
		content:
			"Para criar uma conta na Bionk, acesse a página de cadastro e preencha seus dados com um email válido. Após confirmar sua conta através da verificação enviado para o seu email, você terá acesso a um painel intuitivo onde poderá configurar sua página, gerenciar seus links e aproveitar todas as funcionalidades disponíveis.",
	},
	{
		value: "item-3",
		trigger: "Como posso personalizar minha página?",
		content:
			"A Bionk oferece diversas opções de customização para que sua página reflita sua identidade visual. Você pode alterar cores, fontes e layouts, além de inserir imagens, vídeos e botões de ação. Dessa forma, é possível criar uma experiência única e atrativa que se destaca e engaja seus visitantes.",
	},
	{
		value: "item-5",
		trigger: "Qual é o modelo de monetização da Bionk?",
		content:
			"A Bionk disponibiliza um modelo freemium, permitindo que você utilize funcionalidades básicas gratuitamente. Para acessar recursos avançados, como análises detalhadas e opções de customização extras, são oferecidos planos ultra. Assim, você pode escolher a solução que melhor se adapta às suas necessidades e objetivos de crescimento.",
	},
	{
		value: "item-6",
		trigger: "A plataforma é segura?",
		content:
			"A segurança dos seus dados é uma prioridade na Bionk. Utilizamos tecnologias de criptografia avançadas e protocolos de segurança robustos para proteger as informações dos usuários. Além disso, nossa equipe realiza monitoramento contínuo e atualizações constantes, garantindo que a plataforma esteja sempre protegida contra possíveis ameaças.",
	},
	{
		value: "item-7",
		trigger: "Como posso acompanhar o desempenho dos meus links?",
		content:
			"A Bionk oferece ferramentas analíticas integradas que permitem monitorar o desempenho dos seus links em tempo real. Você pode visualizar métricas detalhadas, como número de cliques, fontes de tráfego e comportamento dos visitantes. Essas informações são essenciais para ajustar suas estratégias e maximizar o impacto da sua presença digital.",
	},
	{
		value: "item-8",
		trigger: "Como posso obter suporte técnico?",
		content:
			"Nosso suporte técnico está disponível através de múltiplos canais, incluindo email, chat e fóruns de ajuda. Além disso, você terá acesso a uma base de conhecimento completa com tutoriais e FAQs que auxiliam na resolução de problemas e no melhor aproveitamento das funcionalidades da plataforma.",
	},
];

const DescubraClient = () => {
	const router = useRouter();
	return (
		<div className="min-h-screen bg-purple-800">
			<Header />
			<HeaderMobile />
			<section className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pt-10 text-lime-200 md:px-20 lg:flex-row lg:px-40">
				<div className="w-full space-y-4 pt-16 text-left lg:w-1/2 xl:pt-0">
					<h1 className="title text-4xl md:text-6xl">
						A melhor ferramenta de link in bio para suas redes sociais
					</h1>
					<p className="text-lg leading-tight md:text-2xl">
						Reúna tudo aquilo que é essencial em um só lugar e facilite o acesso
						ao seu conteúdo com estilo e praticidade.
					</p>
					<BaseButton onClick={() => router.push("/registro")}>
						Cadastre-se gratuitamente agora!
					</BaseButton>
				</div>

				<div className="relative my-10 aspect-[4/3] w-full max-w-xs p-35 sm:max-w-md lg:max-w-lg">
					<Image
						alt="Instagram Logo"
						className="floating-logo"
						height={80}
						id="insta-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634934/Instagram_qekxxt.png"
						width={80}
					/>
					<Image
						alt="Snapchat Logo"
						className="floating-logo"
						height={90}
						id="snap-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 45px, (max-width: 1024px) 65px, 90px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634935/Snapchat_ppf2h5.png"
						width={90}
					/>
					<Image
						alt="Spotify Logo"
						className="floating-logo"
						height={70}
						id="spotify-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 35px, (max-width: 1024px) 55px, 70px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634936/Spotify_k5trud.png"
						width={70}
					/>
					<Image
						alt="TikTok Logo"
						className="floating-logo"
						height={85}
						id="tiktok-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 42px, (max-width: 1024px) 62px, 85px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634938/TikTok_uw2fqb.png"
						width={85}
					/>
					<Image
						alt="Whatsapp Logo"
						className="floating-logo"
						height={75}
						id="whatsapp-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 37px, (max-width: 1024px) 57px, 75px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634939/Whatsapp_cf7s6o.svg"
						width={75}
					/>
					<Image
						alt="Telegram Logo"
						className="floating-logo"
						height={80}
						id="telegram-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634937/Telegram_hlo0sb.png"
						width={80}
					/>
					<Image
						alt="YouTube Logo"
						className="floating-logo"
						height={90}
						id="youtube-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 45px, (max-width: 1024px) 65px, 90px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634940/YouTube_ect7zy.png"
						width={90}
					/>
					<Image
						alt="Twitch Logo"
						className="floating-logo"
						height={85}
						id="twitch-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 42px, (max-width: 1024px) 62px, 85px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634938/Twitch_hnd1ff.png"
						width={85}
					/>
					<Image
						alt="Facebook Logo"
						className="floating-logo"
						height={80}
						id="facebook-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 40px, (max-width: 1024px) 60px, 80px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634933/Facebook_awxfp5.png"
						width={80}
					/>
					<Image
						alt="Pinterest Logo"
						className="floating-logo"
						height={75}
						id="pinterest-logo"
						priority
						quality={100}
						sizes="(max-width: 640px) 37px, (max-width: 1024px) 57px, 75px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634934/Pinterest_o6vstp.png"
						width={75}
					/>
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 rounded-t-3xl bg-white px-6 py-16 text-black md:px-20 lg:px-40">
				<div className="space-y-3 text-center">
					<h2 className="title text-3xl md:text-5xl">
						Sem complicações, sem limites.
					</h2>
					<p className="font-medium text-muted-foreground">
						Configure, personalize e gerencie seu Bionk com facilidade, sem
						precisar de conhecimentos técnicos.
					</p>
				</div>
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{featureCards.map((item) => (
						<Card className="border-2 border-purple-700" key={item.title}>
							<CardContent>
								<CardHeader className="my-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 p-4">
									{item.icon}
								</CardHeader>
								<CardTitle className="mb-6 font-semibold text-xl md:text-2xl">
									{item.title}
								</CardTitle>
								<CardDescription className="font-medium text-lg">
									{item.desc}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col-reverse items-center justify-between gap-10 bg-violet-950 px-6 py-16 text-purple-300 md:px-20 lg:flex-row lg:px-40">
				<div>
					<Image
						alt="Painel de Analytics da plataforma Bionk"
						className="w-full max-w-xs sm:max-w-md lg:max-w-lg"
						height={400}
						loading="lazy"
						quality={100}
						sizes="(max-width: 640px) 320px, (max-width: 1024px) 448px, 512px"
						src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755634933/analytics_helc3k.png"
						width={400}
					/>
				</div>
				<div className="w-full text-center lg:w-1/2 lg:text-left">
					<h2 className="title mb-6 text-3xl text-white md:text-4xl">
						Entenda seu público e otimize sua estratégia
					</h2>
					<p className="mb-8 font-medium text-white">
						Acompanhe métricas detalhadas sobre acessos, cliques e comportamento
						dos visitantes para tomar decisões mais inteligentes e aprimorar sua
						estratégia digital.
					</p>
					<div className="space-y-6">
						{analyticsFeatures.map((item) => (
							<div
								className="flex flex-col items-center gap-5 sm:flex-row"
								key={item.title}
							>
								<div className="rounded-full bg-violet-400 p-2">
									{item.icon}
								</div>
								<div className="text-center sm:text-left">
									<h3 className="font-bold text-lg">{item.title}</h3>
									<p className="text-white">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
					<div className="mt-8 flex justify-center lg:justify-start">
						<BaseButton onClick={() => router.push("/registro")}>
							Cadastre-se gratuitamente agora!
						</BaseButton>
					</div>
				</div>
			</section>

			<section className="flex min-h-screen w-full flex-col items-center justify-center gap-10 bg-white px-4 py-16 md:px-20 lg:px-40">
				<div className="w-full px-2 text-center md:px-0">
					<h2 className="title mb-6 text-3xl text-black md:text-4xl">
						Dúvidas? Nós temos as respostas!
					</h2>
					<p className="mb-8 font-medium text-muted-foreground">
						Encontre tudo o que você precisa saber sobre como usar e
						personalizar seu Link in Bio de forma simples e rápida.
					</p>
				</div>
				<Card className="w-full border-none bg-transparent text-white shadow-none">
					<CardContent>
						<Accordion
							className="flex w-full flex-col items-center justify-center"
							collapsible
							type="single"
						>
							{faqItems.map((faq) => (
								<AccordionItem
									className="mb-4 w-full max-w-7xl rounded-3xl border-2 border-teal-800 bg-purple-900 px-6 py-6 transition-colors duration-300 hover:border-2 hover:border-lime-600 md:px-10"
									key={faq.value}
									value={faq.value}
								>
									<AccordionTrigger className="flex items-center text-left text-lg md:text-2xl">
										{faq.trigger}
									</AccordionTrigger>
									<AccordionContent className="text-sm md:text-lg">
										{faq.content}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</CardContent>
				</Card>
			</section>

			<Footer />
		</div>
	);
};

export default DescubraClient;

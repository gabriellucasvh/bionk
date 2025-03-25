"use client"

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'
import React from 'react'
import SimpleBtn from './simple-button'
import { Blend, ChartNoAxesCombined, Globe, PartyPopper, Plus, Rocket } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import HeaderMobile from '@/components/HeaderMobile'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"



const DescubraClient = () => {
    const router = useRouter()
    return (
        <div className='min-h-screen bg-green-800 font-gsans'>
            <Header />
            <HeaderMobile />
            <section className='min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 text-lime-200 px-6 md:px-20 lg:px-40'>
                <div className='w-full lg:w-1/2 space-y-4 text-left pt-16 md:pt-0'>
                    <h1 className='font-bold text-4xl md:text-6xl'>A melhor ferramenta de link in bio para todas as suas redes sociais</h1>
                    <p className='leading-tight text-lg md:text-2xl'>Reúna tudo aquilo que é essencial em um só lugar e facilite o acesso ao seu conteúdo com estilo e praticidade.</p>
                    <SimpleBtn className='font-medium' onClick={() => router.push("/registro")}>
                        Cadastre-se gratuitamente agora!
                    </SimpleBtn>
                </div>
                <div>
                    <Image src="/warning.svg" alt='error' width={300} height={300} className='w-full max-w-xs sm:max-w-md lg:max-w-lg' />
                </div>
            </section>
            <section className='min-h-screen bg-white rounded-t-3xl flex flex-col w-full items-center justify-center space-y-8 text-black px-6 md:px-20 lg:px-40 py-16'>
                <div className='text-center space-y-3'>
                    <h2 className='font-bold text-3xl md:text-5xl'>Sem complicações, sem limites.</h2>
                    <p className='text-muted-foreground font-medium'>Configure, personalize e gerencie seu Bionk com facilidade, sem precisar de conhecimentos técnicos.</p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
                    {[{
                        icon: <Plus className='text-lime-300 h-8 w-8' />,
                        title: 'Crie seu Link in Bio gratuito com o Bionk',
                        desc: 'Obtenha um link exclusivo que centraliza todo o seu conteúdo, permitindo que seus seguidores acessem suas publicações de forma simples e intuitiva.'
                    }, {
                        icon: <Blend className='text-lime-300' />,
                        title: 'Atualize seu link em todas as redes sociais',
                        desc: 'Personalize seu URL e utilize-o em qualquer plataforma, reunindo seu conteúdo de forma prática para facilitar o acesso dos seus seguidores.'
                    }, {
                        icon: <PartyPopper className='text-lime-300' />,
                        title: 'Expanda seu alcance e engajamento',
                        desc: 'Conecte seu público a todas as suas postagens e oportunidades, transformando seu perfil em uma central dinâmica de conteúdos e interações.'
                    }].map((item, idx) => (
                        <Card key={idx} className='border-2 border-green-700'>
                            <CardContent>
                                <CardHeader className='flex items-center justify-center my-5 bg-green-600 p-4 rounded-full w-14 h-14'>
                                    {item.icon}
                                </CardHeader>
                                <CardTitle className='text-xl md:text-2xl mb-6 font-semibold'>{item.title}</CardTitle>
                                <CardDescription className='text-lg font-medium'>{item.desc}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            <section className='min-h-screen bg-emerald-950 flex flex-col-reverse lg:flex-row w-full items-center justify-center gap-10 text-emerald-300 px-6 md:px-20 lg:px-40 py-16'>
                <div>
                    <Image src="/warning.svg" alt='error' width={300} height={300} className='w-full max-w-xs sm:max-w-md lg:max-w-lg' />
                </div>
                <div className='w-full lg:w-1/2 text-center lg:text-left'>
                    <h2 className='font-bold text-3xl md:text-4xl mb-6'>Entenda seu público e otimize sua estratégia</h2>
                    <p className='text-emerald-400 font-medium mb-8'>Acompanhe métricas detalhadas sobre acessos, cliques e comportamento dos visitantes para tomar decisões mais inteligentes e aprimorar sua estratégia digital.</p>
                    <div className='space-y-6'>
                        {[{
                            icon: <ChartNoAxesCombined className='p-4 text-green-800 flex-shrink-0' size={50} />,
                            title: 'Estatísticas em tempo real',
                            desc: 'Acompanhe visitantes, cliques e conversões em tempo real com painéis detalhados.'
                        }, {
                            icon: <Rocket className='p-4 text-green-800 flex-shrink-0' size={50} />,
                            title: 'Análise de Desempenho',
                            desc: 'Identifique quais links e conteúdos geram mais engajamento para otimizar sua estratégia.'
                        }, {
                            icon: <Globe className='p-4 text-green-800 flex-shrink-0' size={50} />,
                            title: 'Dados Demográficos',
                            desc: 'Conheça a localização, dispositivos e comportamento do seu público para decisões mais inteligentes.'
                        }].map((item, idx) => (
                            <div key={idx} className='flex flex-col sm:flex-row items-center gap-5'>
                                <div className='rounded-full bg-lime-400 p-2'>
                                    {item.icon}
                                </div>
                                <div className='text-center sm:text-left'>
                                    <h3 className='font-bold text-lg'>{item.title}</h3>
                                    <p className='text-emerald-400'>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-center lg:justify-start mt-8'>
                        <SimpleBtn onClick={() => router.push("/registro")}>
                            Cadastre-se gratuitamente agora!
                        </SimpleBtn>
                    </div>
                </div>
            </section>
            <section className='min-h-screen bg-teal-800 flex flex-col w-full items-center justify-center gap-10 px-4 md:px-20 lg:px-40 py-16'>
                <div className='w-full text-center px-2 md:px-0'>
                    <h2 className='font-bold text-3xl md:text-4xl mb-6 text-lime-50'>Dúvidas? Nós temos as respostas!</h2>
                    <p className='font-medium mb-8 text-lime-100'>Encontre tudo o que você precisa saber sobre como usar e personalizar seu Link in Bio de forma simples e rápida.</p>
                </div>
                <Card className='w-full bg-transparent text-white border-none shadow-none'>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full flex flex-col items-center justify-center">
                            <AccordionItem value="item-1" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    O que é a Bionk?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    A Bionk é uma plataforma inovadora de link in bio que centraliza todos os seus links e conteúdos em uma única página. Desenvolvida para facilitar a gestão e a divulgação de suas redes sociais, a plataforma oferece uma interface intuitiva e recursos que permitem a personalização completa da sua página.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    Como faço para criar uma conta?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    Para criar uma conta na Bionk, acesse a página de cadastro e preencha seus dados com um email válido. Após confirmar sua conta através da verificação enviado para o seu email, você terá acesso a um painel intuitivo onde poderá configurar sua página, gerenciar seus links e aproveitar todas as funcionalidades disponíveis.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    Como posso personalizar minha página?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    A Bionk oferece diversas opções de customização para que sua página reflita sua identidade visual. Você pode alterar cores, fontes e layouts, além de inserir imagens, vídeos e botões de ação. Dessa forma, é possível criar uma experiência única e atrativa que se destaca e engaja seus visitantes.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    Qual é o modelo de monetização da Bionk?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    A Bionk disponibiliza um modelo freemium, permitindo que você utilize funcionalidades básicas gratuitamente. Para acessar recursos avançados, como análises detalhadas e opções de customização extras, são oferecidos planos premium. Assim, você pode escolher a solução que melhor se adapta às suas necessidades e objetivos de crescimento.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-6" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    A plataforma é segura?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    A segurança dos seus dados é uma prioridade na Bionk. Utilizamos tecnologias de criptografia avançadas e protocolos de segurança robustos para proteger as informações dos usuários. Além disso, nossa equipe realiza monitoramento contínuo e atualizações constantes, garantindo que a plataforma esteja sempre protegida contra possíveis ameaças.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-7" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    Como posso acompanhar o desempenho dos meus links?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    A Bionk oferece ferramentas analíticas integradas que permitem monitorar o desempenho dos seus links em tempo real. Você pode visualizar métricas detalhadas, como número de cliques, fontes de tráfego e comportamento dos visitantes. Essas informações são essenciais para ajustar suas estratégias e maximizar o impacto da sua presença digital.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-8" className="bg-teal-900 px-6 md:px-10 py-6 rounded-lg mb-4 border-2 border-teal-800 hover:border-2 hover:border-lime-600 transition-colors duration-300 w-full md:w-1/2">
                                <AccordionTrigger className="text-lg md:text-2xl flex items-center">
                                    Como posso obter suporte técnico?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm md:text-lg ">
                                    Nosso suporte técnico está disponível através de múltiplos canais, incluindo email, chat e fóruns de ajuda. Além disso, você terá acesso a uma base de conhecimento completa com tutoriais e FAQs que auxiliam na resolução de problemas e no melhor aproveitamento das funcionalidades da plataforma.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>

            </section>
            <Footer />
        </div>
    )
}

export default DescubraClient

"use client"

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'

const pricingPlans = [
    {
        name: 'Básico',
        description: 'Comece com ferramentas essenciais para impulsionar sua presença online.',
        monthlyPrice: 69,
        annualPrice: 49,
        link: 'https://github.com/ansub/syntaxUI',
        features: [
            'Estratégia de SEO e recomendações de tópicos',
            'Análise da concorrência para se destacar',
            'Pesquisa de palavras-chave integrada',
            'Acompanhe as últimas tendências do Google',
            'Blogs e redes sociais otimizados para SEO',
            'Análise técnica de SEO e relatórios',
            'Alcance mais de 100 regiões e idiomas',
        ],
    },
    {
        name: 'Profissional',
        description:
            'Desbloqueie recursos avançados e conteúdo premium para turbinar seu negócio.',
        monthlyPrice: 299,
        annualPrice: 199,
        link: 'https://github.com/ansub/syntaxUI',
        features: [
            'Tudo no plano Básico',
            'Receba 25 blogs premium',
            'Indexe até 1000 páginas',
            'Suporte premium',
            'SEO local',
            'Agente de SEO',
        ],
    },
    {
        name: 'Premium',
        description:
            'Personalização máxima e suporte dedicado para grandes empresas.',
        monthlyPrice: 2499,
        annualPrice: 1666,
        link: 'https://github.com/ansub/syntaxUI',
        features: [
            'Tudo no plano Profissional',
            'Blogs premium ilimitados',
            'Adicione sua própria chave de modelo de IA',
            'Suporte premium e sessões de treinamento',
        ],
    },
]

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<'M' | 'A'>('M')

    const Heading = () => (
        <div className="relative z-10 my-12 flex flex-col items-center justify-center gap-4">
            <div className="flex w-full flex-col items-start justify-center space-y-4 md:items-center">
                <div className="mb-2 inline-block rounded-full bg-green-500 px-2 py-[0.20rem] text-xs font-medium uppercase text-white dark:bg-green-500">
                    {' '}
                    Planos
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl dark:text-gray-200">
                    Preço justo, vantagem imbatível.
                </p>
                <p className="text-md max-w-xl text-gray-700 md:text-center dark:text-gray-300">
                    Comece a usar o Bionk hoje mesmo e leve seu negócio para o próximo nível.
                </p>
            </div>
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setBillingCycle('M')}
                    className={cn(
                        `rounded-lg px-4 py-2 text-sm font-medium `,
                        billingCycle === 'M'
                            ? 'relative bg-green-500 text-white cursor-pointer'
                            : 'text-gray-700 hover:text-white cursor-pointer hover:bg-green-500 dark:text-gray-300 dark:hover:text-black transition-colors duration-300',
                    )}
                >
                    Mensal
                    {billingCycle === 'M' && <BackgroundShift shiftKey="monthly" />}
                </button>
                <button
                    onClick={() => setBillingCycle('A')}
                    className={cn(
                        `rounded-lg px-4 py-2 text-sm font-medium `,
                        billingCycle === 'A'
                            ? 'relative bg-green-500 text-white cursor-pointer '
                            : 'text-gray-700 hover:text-white cursor-pointer hover:bg-green-500 dark:text-gray-300 dark:hover:text-black transition-colors duration-300',
                    )}
                >
                    Anual
                    {billingCycle === 'A' && <BackgroundShift shiftKey="annual" />}
                </button>
            </div>
        </div>
    )

    const PricingCards = () => (
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4 ">
            {pricingPlans.map((plan, index) => (
                <div
                    key={index}
                    className="w-full rounded-xl border-[1px] border-gray-300 p-6 text-left dark:border-gray-600"
                >
                    <p className="mb-1 mt-0 text-sm font-medium uppercase text-green-500">
                        {plan.name}
                    </p>
                    <p className="my-0 mb-6 text-sm text-gray-600">{plan.description}</p>
                    <div className="mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={billingCycle === 'M' ? 'monthly' : 'annual'}
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="my-0 text-3xl font-semibold text-gray-900 dark:text-gray-100"
                            >
                                <span>
                                    R${billingCycle === 'M' ? plan.monthlyPrice : plan.annualPrice}
                                </span>
                                <span className="text-sm font-medium">
                                    /{billingCycle === 'M' ? 'mês' : 'ano'}
                                </span>
                            </motion.p>
                        </AnimatePresence>
                        <motion.button
                            whileTap={{ scale: 0.985 }}
                            onClick={() => {
                                window.open(plan.link)
                            }}
                            className="mt-8 w-full rounded-lg bg-green-500 py-2 text-sm font-medium text-white hover:bg-green-500/90"
                        >
                            Vamos começar
                        </motion.button>
                    </div>
                    {plan.features.map((feature, idx) => (
                        <div key={idx} className="mb-3 flex items-center gap-2">
                            <Check className="text-green-500" size={18} />
                            <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )

    return (
        <section className="relative w-full overflow-hidden  py-12 text-black lg:px-2 lg:py-12 bg-white">
            <Heading />
            <PricingCards />
        </section>
    )
}

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
    <motion.span
        key={shiftKey}
        layoutId="bg-shift"
        className="absolute inset-0 -z-10 rounded-lg bg-green-500"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    />
)

export default function PricingPage() {
    return <Pricing />
}
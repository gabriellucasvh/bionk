"use client"

import { MotionButton, MotionP, MotionSpan } from '@/components/ui/motion'
import { cn } from '@/lib/utils'
import { AnimatePresence } from 'framer-motion'
import { Check, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const pricingPlans = [
    {
        name: 'Gratuito',
        description: 'Comece sua presença digital sem custos!',
        monthlyPrice: 0,
        annualPrice: 0,
        label: 'Comece gratuitamente',
        link: '/registro',
        features: [
            'Links ilimitados',
            'QR Codes para divulgação',
            'Personalização básica de cores e botões',
            'Estatísticas simples de visitas',
        ],
    },
    {
        name: 'Iniciante',
        description: 'Aprimore sua página e se destaque.',
        monthlyPrice: 10,
        annualPrice: 100,
        label: 'Assinar agora',
        link: '/registro',
        features: [
            'Tudo no plano Gratuito',
            'Agendamento de links',
            'Destaque para links principais',
            'Animações simples',
            'Estatísticas detalhadas',
        ],
    },
    {
        name: 'Profissional',
        description: 'Para quem quer personalização total e mais insights.',
        monthlyPrice: 22,
        annualPrice: 220,
        label: 'Assinar agora',
        link: '/registro',
        features: [
            'Tudo no plano Iniciante',
            'Personalização avançada',
            'Miniaturas e imagens nos links',
            'Coleta de e-mails e contatos',
            'Acompanhamento detalhado de acessos',
        ],
    },
    {
        name: 'Premium',
        description: 'Suporte prioritário e insights completos.',
        monthlyPrice: 65,
        annualPrice: 650,
        label: 'Assinar agora',
        link: '/registro',
        features: [
            'Tudo no plano Profissional',
            'Suporte prioritário',
            'Relatórios completos',
            'Acesso ao histórico completo de estatísticas',
        ],
    },
]

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<'M' | 'A'>('M')
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [isPromotionActive, setIsPromotionActive] = useState<boolean>(true)

    useEffect(() => {
        const promotionEndDate = new Date()
        promotionEndDate.setDate(promotionEndDate.getDate() + 7)

        const calculateTimeLeft = () => {
            const difference = +promotionEndDate - +new Date()
            let timeLeftOutput = ''

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24))
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((difference / 1000 / 60) % 60)
                const seconds = Math.floor((difference / 1000) % 60)

                timeLeftOutput = `${days}d ${hours}h ${minutes}m ${seconds}s`
                setIsPromotionActive(true)
            } else {
                timeLeftOutput = 'Promoção encerrada!'
                setIsPromotionActive(false)
            }
            return timeLeftOutput
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const Heading = () => (
        <div className="relative z-10 my-12 mt-20 flex flex-col items-center justify-center gap-4">
            {isPromotionActive && (
                <div className="mb-4 flex flex-col items-center rounded-lg border border-green-500 bg-green-50 p-4 text-center shadow-lg dark:bg-green-900/30 dark:border-green-700">
                    <PartyPopper className="mb-2 h-10 w-10 text-green-500 dark:text-green-400" />
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-300">
                        🎉 Semana de Lançamento! 🎉
                    </h2>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                        Aproveite! Todos os planos estão <strong>GRATUITOS</strong> por tempo limitado!
                    </p>
                    <p className="mt-2 text-lg font-semibold text-red-500 dark:text-red-400">
                        Tempo restante: {timeLeft}
                    </p>
                </div>
            )}
            <div className="flex w-full flex-col items-center justify-center space-y-4 text-center px-2">
                <div className="mt-2 inline-block rounded-full bg-green-500 px-2 py-[0.20rem] text-xs font-medium uppercase text-white">
                    Planos
                </div>
                <p className=" text-3xl font-bold  text-gray-800 sm:text-4xl dark:text-gray-200">
                    Escolha o melhor plano para você.
                </p>
                <p className="text-md max-w-xl text-gray-700 md:text-center dark:text-gray-300">
                    Comece agora com a Bionk e leve sua presença digital para o próximo nível.
                </p>
            </div>
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={() => setBillingCycle('M')}
                    className={cn(
                        `relative rounded-lg px-4 py-2 text-sm font-medium`,
                        billingCycle === 'M'
                            ? 'bg-green-500 text-white'
                            : 'text-gray-700 hover:text-white hover:bg-green-500 dark:text-gray-300 dark:hover:text-black transition-colors duration-300'
                    )}
                >
                    Mensal
                    {billingCycle === 'M' && <BackgroundShift shiftKey="monthly" />}
                </button>
                <button
                    onClick={() => setBillingCycle('A')}
                    className={cn(
                        `relative rounded-lg px-4 py-2 text-sm font-medium`,
                        billingCycle === 'A'
                            ? 'bg-green-500 text-white'
                            : 'text-gray-700 hover:text-white hover:bg-green-500 dark:text-gray-300 dark:hover:text-black transition-colors duration-300'
                    )}
                >
                    Anual
                    {billingCycle === 'A' && <BackgroundShift shiftKey="annual" />}
                </button>
            </div>
        </div>
    )

    const PricingCards = () => (
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4">
            {pricingPlans.map((plan, index) => (
                <div
                    key={index}
                    className={`w-full rounded-xl border-1 border-gray-300 p-6 text-left dark:border-gray-600 ${isPromotionActive && plan.name !== 'Gratuito' ? 'opacity-70' : ''}`}
                    style={plan.name === 'Profissional' && !isPromotionActive ? { border: '2px solid #22c55e' } : {}}
                >
                    <p className="mb-1 mt-0 text-sm font-medium uppercase text-green-500">
                        {plan.name}
                    </p>
                    <p className="my-0 mb-6 text-sm text-gray-600">{plan.description}</p>
                    <div className="mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <MotionP
                                key={billingCycle === 'M' ? 'monthly' : 'annual'}
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="my-0 text-3xl font-semibold text-gray-900 dark:text-gray-100"
                            >
                                {isPromotionActive && plan.monthlyPrice > 0 ? (
                                    <>
                                        <span className="line-through opacity-50">R${billingCycle === 'M' ? plan.monthlyPrice : plan.annualPrice}</span>
                                        <span className="ml-2 text-green-500">GRÁTIS!</span>
                                    </>
                                ) : (
                                    <>
                                        <span>R${billingCycle === 'M' ? plan.monthlyPrice : plan.annualPrice}</span>
                                        <span className="text-sm font-medium">
                                            /{billingCycle === 'M' ? 'mês' : 'ano'}
                                        </span>
                                    </>
                                )}
                            </MotionP>
                        </AnimatePresence>
                        <Link href={plan.link}>
                            <MotionButton
                                whileTap={{ scale: 0.985 }}
                                onClick={() => !isPromotionActive && window.open(plan.link)}
                                className={cn(
                                    "mt-8 w-full rounded-lg py-2 text-sm font-medium text-white",
                                    isPromotionActive && plan.name !== 'Gratuito'
                                        ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                        : 'bg-green-500 hover:bg-green-500/90'
                                )}
                                disabled={isPromotionActive && plan.name !== 'Gratuito'}
                            >
                                {isPromotionActive && plan.name !== 'Gratuito' ? 'Disponível Gratuitamente' : plan.label}
                            </MotionButton>
                        </Link>
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
        <section className="relative w-full overflow-hidden py-12 bg-white text-black lg:px-2 min-h-screen">
            <Heading />
            <PricingCards />
        </section>
    )
}

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
    <MotionSpan
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

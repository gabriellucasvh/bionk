"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const pricingPlans = [
	{
		name: "Free",
		nameColor: "text-green-500",
		buttonColor:
			"bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 transition-colors duration-500",
		description: "Comece sua presença digital sem custos!",
		monthlyPrice: 0,
		label: "Comece Gratuitamente",
		link: "/registro",
		features: [
			"Links ilimitados",
			"QR Codes para divulgação",
			"Personalização básica de cores e botões",
			"Estatísticas simples de visitas",
		],
	},
	{
		name: "Basic",
		nameColor: "text-yellow-500",
		buttonColor:
			"bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-colors duration-500",
		description: "Aprimore sua página e se destaque.",
		monthlyPrice: 10,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo do plano Free",
			"Agendamento de links",
			"Destaque para links principais",
			"Animações simples",
			"Estatísticas detalhadas",
		],
	},
	{
		name: "Pro",
		nameColor:
			"bg-gradient-to-r from-blue-600 w-min to-pink-300 inline-block text-transparent bg-clip-text",
		buttonColor:
			"bg-radial-[at_50%_75%] from-yellow-500 via-purple-500 to-blue-500 hover:bg-radial-[at_50%_75%] hover:from-blue-500 hover:via-purple-500 hover:to-yellow-500 transition-colors duration-700",
		description: "Para quem quer personalização total e mais insights.",
		monthlyPrice: 20,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo do plano Basic",
			"Personalização avançada",
			"Miniaturas e imagens nos links",
			"Coleta de e-mails e contatos",
			"Acompanhamento detalhado de acessos",
		],
		isBest: true,
	},
	{
		name: "Premium",
		nameColor: "text-blue-500",
		buttonColor:
			"bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-colors duration-500",
		description: "Suporte prioritário e insights completos.",
		monthlyPrice: 60,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo do plano Pro",
			"Suporte prioritário",
			"Relatórios completos",
			"Acesso ao histórico completo de estatísticas",
		],
	},
];

// 🔥 Lifetime separado
const customPlan = {
	name: "Pesonalizado",
	monthlyPrice: 888,
	description: "Entre em contato e monte um plano sob medida.",
	label: "Falar conosco",
	link: "/contato",
	features: [
		"Soluções sob medida",
		"Funcionalidades exclusivas",
		"Consultoria especializada",
		"Preços ajustados à sua necessidade",
	],
};

interface HeadingProps {
	billingCycle: "M" | "A";
	setBillingCycle: (cycle: "M" | "A") => void;
}

const Heading = ({ billingCycle, setBillingCycle }: HeadingProps) => (
	<div className="my-14 flex flex-col items-center gap-6">
		<div className="flex flex-col items-center gap-2 text-center">
			<h2 className="mt-4 font-extrabold text-4xl text-black lg:text-5xl">
				Escolha o melhor plano para você.
			</h2>
			<p className="mt-2 max-w-xl text-gray-400 text-xl">
				Comece agora com a Bionk e leve sua presença digital para o próximo
				nível.
			</p>
		</div>

		{/* Toggle animado (Mensal / Anual) */}
		<div className="relative flex w-fit items-center rounded-full bg-gray-200 p-1">
			<div
				className={`absolute h-[calc(100%-8px)] transform rounded-full bg-gray-100 shadow-md transition-all duration-300 ease-in-out ${
					billingCycle === "M" ? "left-1 w-20" : "left-[84px] w-32"
				}`}
			/>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "M"
						? "text-green-500"
						: "text-gray-400 hover:text-gray-500"
				}`}
				onClick={() => setBillingCycle("M")}
				type="button"
			>
				Mensal
			</button>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "A"
						? "text-green-500"
						: "text-gray-400 hover:text-gray-500"
				}`}
				onClick={() => setBillingCycle("A")}
				type="button"
			>
				Anual (20% off)
			</button>
		</div>
	</div>
);

interface PricingCardProps {
	plan: (typeof pricingPlans)[number];
	billingCycle: "M" | "A";
}

const PricingCard = ({ plan, billingCycle }: PricingCardProps) => {
	const price =
		billingCycle === "M"
			? plan.monthlyPrice
			: Math.round(plan.monthlyPrice * 0.8);

	return (
		<div
			className={cn(
				"flex flex-col rounded-2xl border border-gray-300 bg-gray-100 p-8 shadow-lg",
				plan.isBest && "relative"
			)}
		>
			{plan.isBest && (
				<span className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1 font-semibold text-white text-xs">
					Mais recomendado
				</span>
			)}
			<h3 className={`font-bold text-2xl text-black ${plan.nameColor}`}>
				{plan.name}
			</h3>
			<p className="mt-2 text-gray-400">{plan.description}</p>

			<p className="mt-6 font-extrabold text-4xl text-black">
				R${price}
				<span className="ml-1 font-medium text-base text-gray-400">/mês</span>
				{billingCycle === "A" && plan.monthlyPrice > 0 && (
					<span className="mt-1 block font-normal text-green-500 text-sm">
						(20% de desconto no anual)
					</span>
				)}
			</p>

			<Link
				className={`mt-6 block w-full rounded-xl py-3 text-center font-bold text-white ${plan.buttonColor}`}
				href={plan.link}
			>
				{plan.label}
			</Link>

			<div className="mt-8 space-y-3 text-left">
				{plan.features.map((feature) => (
					<div className="flex items-center gap-3" key={feature}>
						<Check className="text-green-500" size={18} />
						<span className="text-gray-600">{feature}</span>
					</div>
				))}
			</div>
		</div>
	);
};

// 🔥 Lifetime horizontal embaixo
const CustomPlan = () => (
	<div className="mx-auto mt-16 flex max-w-5xl flex-col items-center justify-between gap-8 rounded-2xl border border-gray-300 bg-gray-100 p-10 text-white shadow-lg lg:flex-row">
		<div className="flex flex-col gap-4">
			<h3 className={"font-extrabold text-3xl text-black"}>
				{customPlan.name}
			</h3>
			<p className="max-w-xl text-gray-400">{customPlan.description}</p>
			<div className="mt-4 space-y-2">
				{customPlan.features.map((feature) => (
					<div className="flex items-center gap-3" key={feature}>
						<Check className="text-green-500" size={18} />
						<span className="text-gray-600">{feature}</span>
					</div>
				))}
			</div>
		</div>
		<Link
			className="rounded-xl bg-green-600 px-8 py-4 font-bold text-white transition-colors hover:bg-green-500"
			href={customPlan.link}
		>
			{customPlan.label}
		</Link>
	</div>
);

const Pricing = () => {
	const [billingCycle, setBillingCycle] = useState<"M" | "A">("M");

	return (
		<section className="min-h-screen w-full bg-white px-6 py-16">
			<Heading billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
				{pricingPlans.map((plan) => (
					<PricingCard
						billingCycle={billingCycle}
						key={plan.name}
						plan={plan}
					/>
				))}
			</div>
			<CustomPlan />
		</section>
	);
};

export default function PricingPage() {
	return <Pricing />;
}

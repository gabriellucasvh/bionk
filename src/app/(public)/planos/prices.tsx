"use client";

import { cn } from "@/lib/utils";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const pricingPlans = [
	{
		name: "Free",
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
		topColor: "bg-lime-700",
		baseColor: "bg-lime-500",
	},
	{
		name: "Basic",
		description: "Aprimore sua página e se destaque.",
		monthlyPrice: 10,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo no plano Free",
			"Agendamento de links",
			"Destaque para links principais",
			"Animações simples",
			"Estatísticas detalhadas",
		],
		topColor: "bg-teal-700",
		baseColor: "bg-teal-800",
	},
	{
		name: "Pro",
		star: <Star className=" text-yellow-400" size={18} />,
		description: "Para quem quer personalização total e mais insights.",
		monthlyPrice: 20,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo no plano Basic",
			"Personalização avançada",
			"Miniaturas e imagens nos links",
			"Coleta de e-mails e contatos",
			"Acompanhamento detalhado de acessos",
		],
		topColor: "bg-green-800",
		baseColor: "bg-green-600",
		isPro: true,
	},
	{
		name: "Premium",
		description: "Suporte prioritário e insights completos.",
		monthlyPrice: 60,
		label: "Assinar agora",
		link: "/registro",
		features: [
			"Tudo no plano Pro",
			"Suporte prioritário",
			"Relatórios completos",
			"Acesso ao histórico completo de estatísticas",
		],
		topColor: "bg-cyan-700",
		baseColor: "bg-cyan-800",
	},
];

interface HeadingProps {
	billingCycle: "M" | "A";
	setBillingCycle: (cycle: "M" | "A") => void;
}

const Heading = ({ billingCycle, setBillingCycle }: HeadingProps) => (
	<div className="my-14 flex flex-col items-center gap-6">
		<div className="flex flex-col items-center gap-2 text-center">
			<h2 className="mt-4 font-extrabold text-4xl text-gray-900 lg:text-5xl">
				Escolha o melhor plano para você.
			</h2>
			<p className="mt-2 max-w-xl text-gray-700 text-xl">
				Comece agora com a Bionk e leve sua presença digital para o próximo
				nível.
			</p>
		</div>
		<div className="relative flex w-fit items-center rounded-full bg-gray-100 p-1">
			<div
				className={`absolute h-[calc(100%-8px)] transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
					billingCycle === "M" ? "left-1 w-20" : "left-[84px] w-32"
				}`}
				style={{ height: "calc(100% - 8px)" }}
			/>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "M"
						? "text-green-600"
						: "text-gray-500 hover:text-gray-700"
				}`}
				onClick={() => setBillingCycle("M")}
				type="button"
			>
				Mensal
			</button>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
					billingCycle === "A"
						? "text-green-600"
						: "w-full text-gray-500 hover:text-gray-700"
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
	// Calcula o preço com desconto para planos anuais (20% off)
	const price =
		billingCycle === "M" ? plan.monthlyPrice : Math.round(plan.monthlyPrice * 0.8);

	return (
		<div
			className={cn(
				"flex flex-col overflow-hidden rounded-2xl shadow-xl",
				plan.isPro ? "scale-105" : ""
			)}
		>
			{/* Cabeçalho */}
			<div className={cn("p-6 text-center", plan.topColor)}>
				<h3 className="flex items-center gap-2 font-extrabold text-2xl text-white">
					{plan.name}
					{plan.star}
				</h3>
				<p className="mt-2 text-start text-white/90">{plan.description}</p>
			</div>

			{/* Conteúdo principal */}
			<div
				className={cn(
					"flex flex-col justify-between p-8 text-center",
					plan.baseColor,
					"flex-1 text-white"
				)}
			>
				<div>
					<p className="mb-8 font-extrabold text-4xl">
						R${price}
						<span className="ml-1 font-medium text-lg">
							/mês
							{billingCycle === "A" && plan.monthlyPrice > 0 && (
								<span className="mt-1 block font-normal text-sm">
									(com desconto anual)
								</span>
							)}
						</span>
					</p>
					<Link
						className="block w-full rounded-xl bg-white py-3 font-bold text-gray-900 transition-colors duration-100 hover:bg-gray-200"
						href={plan.link}
					>
						{plan.label}
					</Link>
				</div>
				<div className="mt-10 space-y-3 text-left">
					{plan.features.map((feature) => (
						<div className="flex items-center gap-3" key={feature}>
							<Check className="text-white" size={18} />
							<span>{feature}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const Pricing = () => {
	const [billingCycle, setBillingCycle] = useState<"M" | "A">("M");

	return (
		<section className="min-h-screen w-full bg-white px-6 py-16">
			<Heading billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{pricingPlans.map((plan) => (
					<PricingCard
						billingCycle={billingCycle}
						key={plan.name}
						plan={plan}
					/>
				))}
			</div>
		</section>
	);
};

export default function PricingPage() {
	return <Pricing />;
}

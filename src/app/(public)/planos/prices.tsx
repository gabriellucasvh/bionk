"use client";

import { Check, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- DADOS PARA OS CARDS DE PREÇO ---
const pricingPlans = [
	{
		name: "Free",
		nameColor: "text-black",
		bgColor: "bg-white",
		buttonColor: "bg-black text-white hover:bg-gray-800",
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
		nameColor: "text-black",
		bgColor: "bg-emerald-400",
		buttonColor: "bg-white text-black hover:bg-gray-100",
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
		nameColor: "text-white",
		bgColor: "bg-violet-600",
		buttonColor: "bg-[#d2f34c] text-black hover:bg-lime-400",
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
		name: "Ultra",
		nameColor: "text-black",
		bgColor: "bg-sky-400",
		buttonColor: "bg-white text-black hover:bg-gray-100",
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

// --- DADOS PARA O PLANO PERSONALIZADO E TABELA DE COMPARAÇÃO ---
const customPlan = {
	name: "Personalizado",
	description: "Entre em contato e monte um plano sob medida.",
	label: "Falar conosco",
	link: "/planos/custom",
	features: [
		"Soluções sob medida",
		"Funcionalidades exclusivas",
		"Consultoria especializada",
		"Preços ajustados à sua necessidade",
	],
};

const featureList = [
	"Links ilimitados",
	"QR Codes para divulgação",
	"Personalização básica de cores e botões",
	"Estatísticas simples de visitas",
	"Agendamento de links",
	"Destaque para links principais",
	"Animações simples",
	"Estatísticas detalhadas",
	"Personalização avançada",
	"Miniaturas e imagens nos links",
	"Coleta de e-mails e contatos",
	"Acompanhamento detalhado de acessos",
	"Suporte prioritário",
	"Relatórios completos",
	"Acesso ao histórico completo de estatísticas",
];

const plansWithAllFeatures = [
	{ name: "Free", features: featureList.slice(0, 4) },
	{ name: "Basic", features: featureList.slice(0, 8) },
	{ name: "Pro", features: featureList.slice(0, 12) },
	{ name: "Ultra", features: featureList.slice(0, 15) },
];

// --- COMPONENTES DA PÁGINA ---

const Heading = ({
	billingCycle,
	setBillingCycle,
}: {
	billingCycle: "M" | "A";
	setBillingCycle: (cycle: "M" | "A") => void;
}) => (
	<div className="my-14 flex flex-col items-center gap-6">
		<div className="flex flex-col items-center gap-2 text-center">
			<h2 className="title mt-4 text-4xl text-black lg:text-5xl">
				Escolha o melhor plano para você.
			</h2>
			<p className="mt-2 max-w-xl text-gray-400 text-xl">
				Comece agora com a Bionk e leve sua presença digital para o próximo
				nível.
			</p>
		</div>
		<div className="relative flex w-fit items-center rounded-full bg-gray-200 p-1">
			<div
				className={`absolute h-[calc(100%-8px)] transform rounded-full bg-gray-100 shadow-md transition-all duration-300 ease-in-out ${
					billingCycle === "M" ? "left-1 w-20" : "left-[84px] w-32"
				}`}
			/>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${billingCycle === "M" ? "text-green-500" : "text-gray-400 hover:text-gray-500"}`}
				onClick={() => setBillingCycle("M")}
				type="button"
			>
				Mensal
			</button>
			<button
				className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${billingCycle === "A" ? "text-green-500" : "text-gray-400 hover:text-gray-500"}`}
				onClick={() => setBillingCycle("A")}
				type="button"
			>
				Anual (20% off)
			</button>
		</div>
	</div>
);

const PricingCard = ({
	plan,
	billingCycle,
}: {
	plan: (typeof pricingPlans)[number];
	billingCycle: "M" | "A";
}) => {
	const price =
		billingCycle === "M"
			? plan.monthlyPrice
			: Math.round(plan.monthlyPrice * 0.8);
	return (
		<div
			className={cn(
				"flex flex-col rounded-3xl p-8",
				plan.bgColor,
				plan.nameColor,
				plan.isBest && "relative"
			)}
		>
			{plan.isBest && (
				<span className="absolute top-4 right-4 rounded-full bg-[#d2f34c] px-3 py-1 font-bold text-black text-xs">
					Mais recomendado
				</span>
			)}
			<h3 className={"title font-black text-3xl"}>{plan.name}</h3>
			<p className="mt-2 font-medium opacity-90">{plan.description}</p>
			<p className="mt-6 font-black text-4xl">
				R${price}
				<span className="ml-1 font-medium text-base opacity-80">/mês</span>
				{billingCycle === "A" && plan.monthlyPrice > 0 && (
					<span className="mt-1 block font-bold text-sm opacity-80">
						(20% de desconto no anual)
					</span>
				)}
			</p>
			<Link
				className={`mt-6 block w-full rounded-full py-3 text-center font-bold transition-colors ${plan.buttonColor}`}
				href={`/checkout/${plan.name.toLocaleLowerCase()}`}
			>
				{plan.label}
			</Link>
			<div className="mt-8 space-y-3 text-left">
				{plan.features.map((feature) => (
					<div className="flex items-center gap-3" key={feature}>
						<Check size={18} weight="bold" />
						<span className="font-bold opacity-90">{feature}</span>
					</div>
				))}
			</div>
		</div>
	);
};

const CustomPlan = () => (
	<div className="mx-auto mt-16 flex max-w-5xl flex-col items-center justify-between gap-8 rounded-3xl bg-pink-500 p-10 text-white lg:flex-row">
		<div className="flex flex-col gap-4">
			<h3 className="title font-black text-3xl">{customPlan.name}</h3>
			<p className="max-w-xl font-medium opacity-90">
				{customPlan.description}
			</p>
			<div className="mt-4 space-y-2">
				{customPlan.features.map((feature) => (
					<div className="flex items-center gap-3" key={feature}>
						<Check size={18} weight="bold" />
						<span className="font-bold opacity-90">{feature}</span>
					</div>
				))}
			</div>
		</div>
		<Link
			className="rounded-full bg-white px-8 py-4 font-bold text-black transition-colors hover:bg-gray-100"
			href={customPlan.link}
		>
			{customPlan.label}
		</Link>
	</div>
);

// --- NOVA TABELA DE COMPARAÇÃO ---
const ComparisonTable = () => (
	<div className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 className="title text-center text-4xl text-black">
			Compare os planos em detalhes
		</h2>
		<div className="mt-10 flow-root">
			<div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8 overflow-x-auto">
				<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div className="overflow-hidden rounded-3xl bg-white">
						<table className="min-w-full">
							<thead className="bg-[#d2f34c]">
								<tr>
									<th
										className="px-6 py-4 text-left font-black text-black text-sm uppercase tracking-wider"
										scope="col"
									>
										Recursos
									</th>
									{plansWithAllFeatures.map((plan) => (
										<th
											className="w-1/4 px-6 py-4 text-center font-black text-black text-sm uppercase tracking-wider"
											key={plan.name}
											scope="col"
										>
											{plan.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="bg-white">
								{featureList.map((feature, featureIdx) => (
									<tr
										className={
											featureIdx % 2 === 0 ? "bg-white" : "bg-gray-100/50"
										}
										key={feature}
									>
										<td className="whitespace-nowrap px-6 py-4 font-bold text-black text-sm">
											{feature}
										</td>
										{plansWithAllFeatures.map((plan) => (
											<td
												className="px-6 py-4 text-center"
												key={`${plan.name}-${feature}`}
											>
												{plan.features.includes(feature) ? (
													<Check
														className="mx-auto h-5 w-5 text-black"
														weight="bold"
													/>
												) : (
													<X
														className="mx-auto h-5 w-5 text-gray-300"
														weight="bold"
													/>
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
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
			<ComparisonTable />
		</section>
	);
};

export default function PricingPage() {
	return <Pricing />;
}

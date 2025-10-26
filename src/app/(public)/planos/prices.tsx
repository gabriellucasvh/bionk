"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- DADOS PARA OS CARDS DE PREÇO ---
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
		name: "Ultra",
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
			<h2 className="mt-4 font-extrabold text-4xl text-black lg:text-5xl">
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
				href={`/checkout/${plan.name.toLocaleLowerCase()}`}
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

const CustomPlan = () => (
	<div className="mx-auto mt-16 flex max-w-5xl flex-col items-center justify-between gap-8 rounded-2xl border border-gray-300 bg-gray-100 p-10 shadow-lg lg:flex-row">
		<div className="flex flex-col gap-4">
			<h3 className="font-extrabold text-3xl text-black">{customPlan.name}</h3>
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

// --- NOVA TABELA DE COMPARAÇÃO ---
const ComparisonTable = () => (
	<div className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 className="text-center font-extrabold text-4xl text-black">
			Compare os planos em detalhes
		</h2>
		<div className="mt-10 flow-root">
			<div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8 overflow-x-auto">
				<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th
										className="px-6 py-4 text-left font-bold text-black text-sm uppercase tracking-wider"
										scope="col"
									>
										Recursos
									</th>
									{plansWithAllFeatures.map((plan) => (
										<th
											className="w-1/4 px-6 py-4 text-center font-bold text-black text-sm uppercase tracking-wider"
											key={plan.name}
											scope="col"
										>
											{plan.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 bg-white">
								{featureList.map((feature, featureIdx) => (
									<tr
										className={featureIdx % 2 === 0 ? undefined : "bg-gray-50"}
										key={feature}
									>
										<td className="whitespace-nowrap px-6 py-4 font-medium text-gray-800 text-sm">
											{feature}
										</td>
										{plansWithAllFeatures.map((plan) => (
											<td
												className="px-6 py-4 text-center"
												key={`${plan.name}-${feature}`}
											>
												{plan.features.includes(feature) ? (
													<Check className="mx-auto h-5 w-5 text-green-500" />
												) : (
													<X className="mx-auto h-5 w-5 text-gray-400" />
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

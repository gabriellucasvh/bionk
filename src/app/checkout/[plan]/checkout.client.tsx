// checkout.client.tsx

"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";

const pricingPlans = [
	{
		name: "Free",
		monthlyPrice: 0,
		description: "Comece sua presença digital sem custos!",
		features: [
			"Links ilimitados",
			"QR Codes",
			"Personalização básica",
			"Estatísticas simples",
		],
	},
	{
		name: "Basic",
		monthlyPrice: 10,
		description: "Aprimore sua página e se destaque.",
		features: [
			"Tudo do Free",
			"Agendamento de links",
			"Destaque de links",
			"Estatísticas detalhadas",
		],
	},
	{
		name: "Pro",
		monthlyPrice: 20,
		description: "Para quem quer personalização total e insights.",
		features: [
			"Tudo do Basic",
			"Personalização avançada",
			"Miniaturas nos links",
			"Acompanhamento detalhado",
		],
	},
	{
		name: "Premium",
		monthlyPrice: 60,
		description: "Suporte prioritário e insights completos.",
		features: [
			"Tudo do Pro",
			"Suporte prioritário",
			"Relatórios completos",
			"Histórico detalhado",
		],
	},
];

export default function PaymentPage() {
	const { plan } = useParams();
	const selectedPlan = pricingPlans.find(
		(p) => p.name.toLowerCase() === String(plan).toLowerCase()
	);

	const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
		"monthly"
	);
	const [isCouponVisible, setIsCouponVisible] = useState(false);
	const [coupon, setCoupon] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvv, setCvv] = useState("");
	const [name, setName] = useState("");

	if (!selectedPlan) {
		return notFound();
	}

	const isFreePlan = selectedPlan.monthlyPrice === 0;

	const annualPricePerMonth = Math.round(selectedPlan.monthlyPrice * 0.8);
	const totalAnnualPrice = annualPricePerMonth * 12;
	const totalMonthlyPrice = selectedPlan.monthlyPrice;
	const savings = totalMonthlyPrice * 12 - totalAnnualPrice;

	const price =
		billingCycle === "monthly" ? totalMonthlyPrice : annualPricePerMonth;
	const totalDue =
		billingCycle === "monthly" ? totalMonthlyPrice : totalAnnualPrice;
	const subtotal =
		billingCycle === "monthly" ? totalMonthlyPrice : totalMonthlyPrice * 12;

	// Funções de validação simples
	const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ""); // apenas números
		setCardNumber(value.slice(0, 16));
	};

	const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ""); // apenas números
		setExpiry(value.slice(0, 4));
	};

	const handleCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ""); // apenas números
		setCvv(value.slice(0, 4));
	};

	const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""); // apenas letras e espaços
		setName(value);
	};

	return (
		<main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
			{/* Coluna esquerda */}
			<div className="flex flex-col bg-emerald-950 p-8 text-white md:p-12">
				<div>
					<div className="mb-8">
						<Link
							className="flex items-center gap-2 font-semibold"
							href="/planos"
						>
							<Button
								className="h-auto p-1 text-white"
								size="icon"
								variant="ghost"
							>
								<ArrowLeft size={24} />
							</Button>
							<Image
								alt="logo"
								height={30}
								priority
								src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755640991/bionk-logo-white_ld4dzs.svg"
								width={90}
							/>
						</Link>
					</div>

					<p className="mb-2 text-lg">
						Assinatura do Plano {selectedPlan.name}
					</p>
					<div className="mb-4">
						<span className="font-bold text-5xl">R${price}</span>
						<span className="ml-2 text-gray-300">/mês</span>
					</div>
					<p className="border-gray-600 border-t pt-4 text-gray-300">
						{selectedPlan.description}
					</p>

					{/* troca de ciclo */}
					<div className="mt-8 space-y-4">
						<div
							className={cn(
								"flex cursor-pointer items-center justify-between rounded-lg border p-4",
								billingCycle === "monthly"
									? "border-green-300 bg-[#2A4C44]"
									: "border-gray-600 bg-transparent hover:bg-gray-700/20"
							)}
							onClick={() => setBillingCycle("monthly")}
							role="none"
						>
							<div>
								<p className="font-semibold">Cobrança Mensal</p>
								<p className="text-gray-300 text-sm">Pague mês a mês</p>
							</div>
							<p className="font-semibold">R${totalMonthlyPrice}/mês</p>
						</div>

						<div
							className={cn(
								"flex cursor-pointer items-center justify-between rounded-lg border p-4",
								billingCycle === "annual"
									? "border-green-300 bg-[#2A4C44]"
									: "border-gray-600 bg-transparent hover:bg-gray-700/20"
							)}
							onClick={() => setBillingCycle("annual")}
							role="none"
						>
							<div>
								<p className="font-semibold">Cobrança Anual</p>
								{savings > 0 && (
									<span className="rounded-md bg-green-200 px-2 py-1 font-bold text-green-800 text-xs">
										Economize R${savings}
									</span>
								)}
							</div>
							<p className="font-semibold">R${totalAnnualPrice}/ano</p>
						</div>
					</div>

					{/* resumo */}
					<div className="mt-8 space-y-3 border-gray-600 border-t pt-8">
						<div className="flex justify-between text-gray-300 text-sm">
							<p>Subtotal</p>
							<p>R${subtotal}</p>
						</div>
						{billingCycle === "annual" && (
							<div className="flex justify-between text-green-400 text-sm">
								<p>Desconto (Plano Anual)</p>
								<p>- R${savings.toFixed(2)}</p>
							</div>
						)}

						{/* CUPOM */}
						{isCouponVisible ? (
							<div>
								<Label className="text-sm" htmlFor="coupon-input">
									Cupom de desconto
								</Label>
								<div className="mt-1 flex items-center gap-2">
									<Input
										className="border-gray-800 bg-[#011c11] text-white"
										id="coupon-input"
										onChange={(e) => setCoupon(e.target.value)}
										placeholder="Ex: PROMO20"
										type="text"
										value={coupon}
									/>
									<BaseButton className="h-9" disabled={!coupon.trim()}>
										Aplicar
									</BaseButton>
								</div>
							</div>
						) : (
							<button
								className="font-semibold text-green-300 text-sm underline"
								onClick={() => setIsCouponVisible(true)}
								type="button"
							>
								Adicionar cupom de desconto
							</button>
						)}

						<div className="flex justify-between pt-4 font-bold text-xl">
							<p>Total</p>
							<p>R${totalDue}</p>
						</div>
					</div>
				</div>

				{/* Rodapé */}
				<div className="mt-auto flex gap-4 pt-8 text-gray-400 text-xs">
					<span>©{new Date().getFullYear()} Todos os direitos reservados</span>
					<Link
						className="underline"
						href="/termos"
						rel="noopener noreferrer"
						target="_blank"
					>
						Termos
					</Link>
					<Link
						className="underline"
						href="/privacidade"
						rel="noopener noreferrer"
						target="_blank"
					>
						Privacidade
					</Link>
				</div>
			</div>

			{/* Coluna direita */}
			<div className="bg-white p-8 md:p-12">
				{isFreePlan ? (
					<div className="flex h-full flex-col items-center justify-center text-center">
						<h2 className="mb-4 font-bold text-2xl">Plano Gratuito</h2>
						<p className="mb-6 text-gray-600">
							Comece agora sem precisar de cartão de crédito!
						</p>
						<Button
							asChild
							className="w-full max-w-sm bg-[#1A3A32] text-white hover:bg-[#2A4C44]"
						>
							<Link href="/studio">Acessar Studio</Link>
						</Button>
					</div>
				) : (
					<>
						<h2 className="mb-6 font-bold text-2xl">Pague com cartão</h2>
						<form className="space-y-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									placeholder="exemplo@gmail.com"
									type="email"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="name">Nome no cartão</Label>
								<Input
									id="name"
									onChange={handleName}
									placeholder="João C. Silva"
									type="text"
									value={name}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="card-details">Detalhes do cartão</Label>
								<div className="relative">
									<Input
										id="card-details"
										onChange={handleCardNumber}
										placeholder="1234 1234 1234 1234"
										type="text"
										value={cardNumber}
									/>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
										<Image
											alt="visa"
											height={32}
											src={"/visa.png"}
											width={32}
										/>
										<Image
											alt="mastercard"
											height={32}
											src={"/mastercard.png"}
											width={32}
										/>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-2 gap-4">
									<Input
										onChange={handleExpiry}
										placeholder="MM/AA"
										type="text"
										value={expiry}
									/>
									<Input
										onChange={handleCvv}
										placeholder="CVV"
										type="text"
										value={cvv}
									/>
								</div>
							</div>
							<div className="flex items-start rounded-md border bg-gray-50 p-4">
								<Checkbox className="mt-0.5" id="save-info" />
								<div className="ml-3 text-sm">
									<Label
										className="cursor-pointer font-medium text-gray-900"
										htmlFor="save-info"
									>
										Salvar minhas informações
									</Label>
									<p className="text-gray-500">
										Checkout mais rápido no futuro.
									</p>
								</div>
							</div>
							<Button
								className="h-auto w-full bg-[#1A3A32] py-3 font-bold text-white hover:bg-[#2A4C44]"
								type="submit"
							>
								{billingCycle === "monthly"
									? `Assinar por R$${totalDue}/mês`
									: `Assinar por R$${totalDue}/ano`}
							</Button>
						</form>
					</>
				)}
			</div>
		</main>
	);
}

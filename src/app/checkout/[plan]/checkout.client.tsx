"use client";

import { ArrowLeft, CircleAlert, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const pricingPlans = [
	{
		name: "Free",
		monthlyPrice: 0,
		description: "Comece sua presença digital sem custos!",
	},
	{
		name: "Basic",
		monthlyPrice: 10,
		description: "Aprimore sua página e se destaque.",
	},
	{
		name: "Pro",
		monthlyPrice: 20,
		description: "Para quem quer personalização total e insights.",
	},
	{
		name: "Premium",
		monthlyPrice: 60,
		description: "Suporte prioritário e insights completos.",
	},
];
type BillingCycle = "monthly" | "annual";

interface CardFormData {
	token: string;
	issuer_id: string;
	payment_method_id: string;
	transaction_amount: number;
	installments: number;
	payer: {
		email: string;
		identification: { type: string; number: string };
	};
}

function BillingToggle({
	billingCycle,
	setBillingCycle,
	totalMonthlyPrice,
	totalAnnualPrice,
	savings,
}: {
	billingCycle: BillingCycle;
	setBillingCycle: (cycle: BillingCycle) => void;
	totalMonthlyPrice: number;
	totalAnnualPrice: number;
	savings: number;
}) {
	return (
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
			<span className="flex items-center gap-1 text-gray-300 text-sm">
				<CircleAlert className="h-3 w-3" />
				Você pode cancelar sua assinatura a qualquer momento!
			</span>
		</div>
	);
}

function Summary({
	billingCycle,
	subtotal,
	totalDue,
	savings,
	isCouponVisible,
	setIsCouponVisible,
	coupon,
	setCoupon,
}: {
	billingCycle: BillingCycle;
	subtotal: number;
	totalDue: number;
	savings: number;
	isCouponVisible: boolean;
	setIsCouponVisible: (value: boolean) => void;
	coupon: string;
	setCoupon: (value: string) => void;
}) {
	return (
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
	);
}

export default function PaymentPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const { plan } = useParams();
	const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
	const [isCouponVisible, setIsCouponVisible] = useState(false);
	const [coupon, setCoupon] = useState("");
	const [sdkReady, setSdkReady] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const cardPaymentBrickController = useRef<any>(null);

	const selectedPlan = pricingPlans.find(
		(p) => p.name.toLowerCase() === String(plan).toLowerCase()
	);

	useEffect(() => {
		const cleanupBrick = async () => {
			if (cardPaymentBrickController.current) {
				await cardPaymentBrickController.current.unmount();
				cardPaymentBrickController.current = null;
			}
		};

		const initBrick = async () => {
			if (
				sdkReady &&
				session?.user?.email &&
				process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY &&
				selectedPlan
			) {
				await cleanupBrick();
				const mp = new window.MercadoPago(
					process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
					{ locale: "pt-BR" }
				);
				const bricksBuilder = mp.bricks();
				const totalDue =
					billingCycle === "monthly"
						? selectedPlan.monthlyPrice
						: Math.round(selectedPlan.monthlyPrice * 0.8) * 12;

				const customization = {
					visual: {
						font: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
						style: {
							theme: "flat",
							customVariables: {
								theme: "dark",
								baseColor: "#99e600",
								contrastColor: "#FFFFFF",
								formBackgroundColor: "#f5f5f5",
								inputBorderColor: "#e5e5e5",
								inputFocusBorderColor: "#99e600",
								borderRadius: "0.5rem",
								textColor: "#1e293b",
								placeholderColor: "#a1a1aa",
								errorColor: "#ef4444",
							},
						},
					},
				};

				const controller = await bricksBuilder.create(
					"cardPayment",
					"cardPaymentBrick_container",
					{
						initialization: { amount: totalDue },
						customization,
						callbacks: {
							onReady: () => {
								/* Brick pronto */
							},
							// --- CORREÇÃO 1: Assinatura da função onSubmit ---
							// O objeto com os dados do formulário é passado diretamente como o primeiro argumento.
							onSubmit: async (formData: CardFormData) => {
								setLoading(true);
								setError(null);
								try {
									// Adicionamos uma verificação extra para garantir que formData e formData.payer existem
									if (!formData?.payer?.email) {
										throw new Error(
											"Não foi possível obter os dados do pagador. Tente novamente."
										);
									}

									const response = await fetch("/api/mercadopago", {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({
											plan: selectedPlan.name.toLowerCase(),
											billingCycle,
											email: formData.payer.email,
											userId: session?.user?.id,
											card_token_id: formData.token,
										}),
									});
									const data = await response.json();
									if (!response.ok) {
										throw new Error(data.details || "Erro ao criar assinatura");
									}

									// Redireciona conforme a resposta do backend/Mercado Pago
									if (data?.init_point) {
										// URL externa do Mercado Pago para concluir a autorização
										window.location.href = data.init_point;
										return;
									}

									const status = String(data?.status || "").toLowerCase();
									if (status === "authorized" || status === "active") {
										// Assinatura confirmada imediatamente
										router.push("/checkout/success");
									} else if (status === "pending") {
										// Aguardando aprovação/pagamento
										router.push("/checkout/pending");
									} else {
										// Falha ou status inesperado
										router.push("/checkout/failure");
									}
								} catch (err: any) {
									setError(err.message || "Ocorreu um erro. Tente novamente.");
									setLoading(false);
								}
							},
							onError: (_err: any) => {
								setError(
									"Dados do cartão inválidos. Verifique as informações."
								);
							},
						},
					}
				);
				cardPaymentBrickController.current = controller;
			}
		};
		initBrick();
		return () => {
			cleanupBrick();
		};
	}, [
		sdkReady,
		billingCycle,
		session?.user?.id,
		session?.user?.email,
		selectedPlan,
		router,
	]);

	if (!selectedPlan) {
		return notFound();
	}

	const isFreePlan = selectedPlan.monthlyPrice === 0;
	const annualPricePerMonth = Math.round(selectedPlan.monthlyPrice * 0.8);
	const totalAnnualPrice = annualPricePerMonth * 12;
	const totalMonthlyPrice = selectedPlan.monthlyPrice;
	const savings = totalMonthlyPrice * 12 - totalAnnualPrice;
	const totalDue =
		billingCycle === "monthly" ? totalMonthlyPrice : totalAnnualPrice;
	const subtotal =
		billingCycle === "monthly" ? totalMonthlyPrice : totalMonthlyPrice * 12;

	return (
		<>
			<Script
				onLoad={() => setSdkReady(true)}
				src="https://sdk.mercadopago.com/js/v2"
			/>
			<main className="grid min-h-screen w-full grid-cols-1 font-geist lg:grid-cols-2">
				<div className="flex flex-col bg-emerald-950 p-8 text-white md:p-12">
					<div className="mb-8 flex items-center gap-2 font-semibold">
						<Link href="/planos">
							<Button
								className="h-auto p-1 text-white"
								size="icon"
								variant="ghost"
							>
								<ArrowLeft size={24} />
							</Button>
						</Link>
						<Image
							alt="logo"
							height={30}
							priority
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755640991/bionk-logo-white_ld4dzs.svg"
							width={90}
						/>
					</div>
					<section className="font-sans">
						<p className="mb-2 text-lg">
							Assinatura do Plano {selectedPlan.name}
						</p>
						<div className="mb-4">
							<span className="font-bold text-5xl">
								R$
								{billingCycle === "monthly"
									? totalMonthlyPrice
									: annualPricePerMonth}
							</span>
							<span className="ml-2 text-gray-300">/mês</span>
						</div>
						<p className="border-gray-600 border-t pt-4 text-gray-300">
							{selectedPlan.description}
						</p>
						<BillingToggle
							billingCycle={billingCycle}
							savings={savings}
							setBillingCycle={setBillingCycle}
							totalAnnualPrice={totalAnnualPrice}
							totalMonthlyPrice={totalMonthlyPrice}
						/>
						<Summary
							billingCycle={billingCycle}
							coupon={coupon}
							isCouponVisible={isCouponVisible}
							savings={savings}
							setCoupon={setCoupon}
							setIsCouponVisible={setIsCouponVisible}
							subtotal={subtotal}
							totalDue={totalDue}
						/>
						<div className="mt-auto flex gap-4 pt-8 text-gray-400 text-xs">
							<span>
								©{new Date().getFullYear()} Todos os direitos reservados
							</span>
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
					</section>
				</div>
				<div className="bg-white p-8 md:p-12">
					{isFreePlan ? (
						<div className="flex h-full flex-col items-center justify-center text-center font-sans">
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
							<h2 className="mb-6 flex items-center gap-2 font-bold text-xl">
								Pagamento seguro e garantido pelo Mercado Pago
								<Image
									alt="logo"
									height={30}
									priority
									src="/mercado-pago-wordmark.svg"
									width={90}
								/>
							</h2>
							{error && (
								<div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
									{error}
								</div>
							)}
							<div id="cardPaymentBrick_container" />
							{loading && (
								<div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
									<Loader2 className="h-5 w-5 animate-spin" /> Processando sua
									assinatura...
								</div>
							)}
						</>
					)}
				</div>
			</main>
		</>
	);
}

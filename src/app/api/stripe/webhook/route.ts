// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

type BillingCycle = "monthly" | "annual";

const PRICE_TO_PLAN: Record<
	string,
	{ plan: string; billingCycle: BillingCycle }
> = {
	// basic
	price_1SMJfgAFJoTCLcKxPpIET44r: { plan: "basic", billingCycle: "monthly" },
	price_1SMJgFAFJoTCLcKxi1Lz0mjw: { plan: "basic", billingCycle: "annual" },
	// pro
	price_1SMJgaAFJoTCLcKxjlhtrwTD: { plan: "pro", billingCycle: "monthly" },
	price_1SMJh8AFJoTCLcKxz315eFWB: { plan: "pro", billingCycle: "annual" },
	// ultra
	price_1SMJhRAFJoTCLcKxv0ON75lt: { plan: "ultra", billingCycle: "monthly" },
	price_1SMJhoAFJoTCLcKxFnOVycso: { plan: "ultra", billingCycle: "annual" },
};

function toStatus(status: string): string {
	switch (status) {
		case "active":
		case "trialing":
			return "active";
		case "canceled":
			return "canceled";
		case "incomplete":
		case "past_due":
		case "unpaid":
			return status;
		default:
			return status || "inactive";
	}
}

export async function POST(request: Request) {
	const payload = await request.text();
	const sig = request.headers.get("stripe-signature");

	let event: Stripe.Event;

	try {
		if (!(sig && webhookSecret)) {
			return NextResponse.json(
				{ error: "Webhook não configurado" },
				{ status: 400 }
			);
		}
		event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
	} catch (err: any) {
		console.error("Erro ao validar webhook:", err.message);
		return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				const userId = (session.metadata?.userId ||
					session.client_reference_id) as string | undefined;

				if (userId) {
					// Atualiza método de pagamento se disponível
					// Em geral, brand/last4 só ficam disponíveis via PaymentMethod vinculado à subscrição/fatura
					// Aqui não garantimos, mas tentamos enriquecer via invoice se existir
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "active",
						},
					});
				}
				break;
			}

			case "customer.subscription.created":
			case "customer.subscription.updated":
			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				const status = toStatus(subscription.status);
				// Remover duplicação e usar nome claro para o fim do período
				const currentPeriodEndEpoch = (subscription as any)?.current_period_end as number | undefined;
				const currentPeriodEndDate =
					typeof currentPeriodEndEpoch === "number"
						? new Date(currentPeriodEndEpoch * 1000)
						: null;

				// Determinar plano a partir do price
				const item = subscription.items?.data?.[0];
				const priceId = item?.price?.id || "";
				const mapped = PRICE_TO_PLAN[priceId];
				const plan = mapped?.plan || undefined;

				// Encontrar userId por metadata do checkout/session associada
				const userId = subscription.metadata?.userId as string | undefined;

				if (userId) {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionPlan: plan || undefined,
							billingCycle: mapped?.billingCycle || undefined,
							subscriptionStatus: status,
							subscriptionEndDate: currentPeriodEndDate || undefined,
						},
					});
				}
				break;
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object as Stripe.Invoice;
				const userId = invoice.metadata?.userId as string | undefined;
				let brand: string | undefined;
				let last4: string | undefined;
				try {
					const paymentIntentId = (invoice as any)?.payment_intent as string | undefined;
					if (paymentIntentId) {
						const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
							expand: ["payment_method"],
						});
						const pm = pi.payment_method as Stripe.PaymentMethod | null;
						const card = pm?.card;
						brand = card?.brand || undefined;
						last4 = card?.last4 || undefined;
					}
				} catch {}

				if (userId) {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "active",
							paymentMethodBrand: brand,
							paymentMethodLastFour: last4,
							// Atualiza período a partir da invoice (geralmente igual ao da subscrição)
							subscriptionEndDate: (() => {
								const endTs = invoice.lines?.data?.[0]?.period?.end;
								return typeof endTs === "number"
									? new Date(endTs * 1000)
									: undefined;
							})(),
						},
					});
				}
				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const userId = invoice.metadata?.userId as string | undefined;
				if (userId) {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "past_due",
						},
					});
				}
				break;
			}

			default:
				// Ignora outros eventos por enquanto
				break;
		}

		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error("Erro ao processar webhook:", error);
		return NextResponse.json(
			{ error: error?.message || "Erro interno" },
			{ status: 500 }
		);
	}
}

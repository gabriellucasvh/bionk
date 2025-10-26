// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
});

function mapPriceToPlan(
	priceId?: string | null
): "basic" | "pro" | "ultra" | null {
	const PRICE_TO_PLAN: Record<string, "basic" | "pro" | "ultra"> = {
		price_1SMJfgAFJoTCLcKxPpIET44r: "basic",
		price_1SMJgFAFJoTCLcKxi1Lz0mjw: "basic",
		price_1SMJgaAFJoTCLcKxjlhtrwTD: "pro",
		price_1SMJh8AFJoTCLcKxz315eFWB: "pro",
		price_1SMJhRAFJoTCLcKxv0ON75lt: "ultra",
		price_1SMJhoAFJoTCLcKxFnOVycso: "ultra",
	};
	if (!priceId) {
		return null;
	}
	return PRICE_TO_PLAN[priceId] || null;
}

export async function POST(req: Request) {
	const sig = req.headers.get("stripe-signature");
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

	if (!(sig && webhookSecret)) {
		return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		const payload = await req.text();
		event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
	} catch (err: any) {
		console.error("Falha ao validar webhook:", err?.message);
		return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
	}

	switch (event.type) {
		case "customer.subscription.created":
		case "customer.subscription.updated":
		case "customer.subscription.deleted": {
			const subscription = event.data.object as Stripe.Subscription;

			// Tenta obter userId do metadata
			let userId: string | undefined =
				(subscription.metadata?.userId as string | undefined) || undefined;

			// Fallback: buscar usuário pelo e-mail do Customer
			if (!userId) {
				const customerId = subscription.customer as string | undefined;
				if (customerId) {
					try {
						const customer = await stripe.customers.retrieve(customerId);
						if (
							typeof (customer as any).deleted === "boolean" &&
							(customer as any).deleted
						) {
							// Cliente deletado, não há e-mail
						} else {
							const email = (customer as Stripe.Customer).email || undefined;
							if (email) {
								const user = await prisma.user.findUnique({ where: { email } });
								if (user) {
									userId = user.id;
								}
							}
						}
					} catch (e) {
						console.warn(
							"Falha ao recuperar Customer para fallback de userId:",
							(e as any)?.message
						);
					}
				}
			}

			// Determina plano via price da subscription
			let plan: "basic" | "pro" | "ultra" | null = null;
			try {
				const priceId =
					(subscription.items?.data?.[0]?.price?.id as string | undefined) ||
					undefined;
				plan = mapPriceToPlan(priceId);
			} catch {}

			const status = subscription.status;
			const currentPeriodEndUnix =
				(subscription as any).current_period_end || undefined;
			const currentPeriodEndDate = currentPeriodEndUnix
				? new Date(currentPeriodEndUnix * 1000)
				: undefined;

			if (userId) {
				try {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: status,
							subscriptionPlan: plan || undefined,
							subscriptionEndDate: currentPeriodEndDate,
						},
					});
				} catch (e) {
					console.error(
						"Erro ao atualizar usuário por subscription:",
						(e as any)?.message
					);
				}
			} else {
				console.warn(
					"Subscription event sem userId identificável; ignorando atualização."
				);
			}

			break;
		}

		case "invoice.payment_succeeded": {
			const invoice = event.data.object as Stripe.Invoice;

			// Recupera dados do cartão via PaymentIntent
			let brand: string | undefined;
			let last4: string | undefined;
			try {
				const paymentIntentId = (invoice as any).payment_intent as
					| string
					| undefined;
				if (paymentIntentId) {
					const paymentIntent = await stripe.paymentIntents.retrieve(
						paymentIntentId,
						{ expand: ["payment_method"] }
					);
					const card = (paymentIntent.payment_method as Stripe.PaymentMethod)
						?.card;
					brand = card?.brand;
					last4 = card?.last4;
				}
			} catch (e) {
				console.warn(
					"Falha ao obter PaymentIntent para invoice:",
					(e as any)?.message
				);
			}

			// Tenta identificar o userId
			let userId: string | undefined =
				(invoice.metadata?.userId as string | undefined) || undefined;

			// Fallback 1: invoice.customer_email
			if (!userId && invoice.customer_email) {
				const user = await prisma.user.findUnique({
					where: { email: invoice.customer_email },
				});
				if (user) {
					userId = user.id;
				}
			}

			// Fallback 2: recuperar Customer e usar o e-mail
			if (!userId && invoice.customer) {
				try {
					const customer = await stripe.customers.retrieve(
						invoice.customer as string
					);
					if (
						!(
							typeof (customer as any).deleted === "boolean" &&
							(customer as any).deleted
						)
					) {
						const email = (customer as Stripe.Customer).email || undefined;
						if (email) {
							const user = await prisma.user.findUnique({ where: { email } });
							if (user) {
								userId = user.id;
							}
						}
					}
				} catch (e) {
					console.warn(
						"Falha ao recuperar Customer para fallback em invoice:",
						(e as any)?.message
					);
				}
			}

			// Determina plano via linha da fatura
			let plan: "basic" | "pro" | "ultra" | null = null;
			try {
				const line = invoice.lines?.data?.[0];
				const priceId =
					((line as any)?.price?.id as string | undefined) || undefined;
				plan = mapPriceToPlan(priceId);
			} catch {}

			// Deriva período de fim a partir da fatura (quando disponível)
			let subscriptionEndDate: Date | undefined;
			try {
				const line = invoice.lines?.data?.[0];
				const periodEnd = line?.period?.end;
				if (typeof periodEnd === "number") {
					subscriptionEndDate = new Date(periodEnd * 1000);
				}
			} catch {}

			if (userId) {
				try {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "active",
							subscriptionPlan: plan || undefined,
							subscriptionEndDate,
							paymentMethodBrand: brand,
							paymentMethodLastFour: last4,
						},
					});
				} catch (e) {
					console.error(
						"Erro ao atualizar usuário por invoice:",
						(e as any)?.message
					);
				}
			} else {
				console.warn(
					"Invoice sem userId identificável; ignorando atualização."
				);
			}

			break;
		}

		case "checkout.session.completed": {
			const cs = event.data.object as Stripe.Checkout.Session;
			let userId: string | undefined =
				(cs.metadata?.userId as string | undefined) ||
				(cs.client_reference_id as string | undefined) ||
				undefined;

			// Fallback por e-mail do Checkout Session
			if (!userId) {
				const email =
					cs.customer_details?.email || cs.customer_email || undefined;
				if (email) {
					const user = await prisma.user.findUnique({ where: { email } });
					if (user) {
						userId = user.id;
					}
				}
			}

			if (userId) {
				try {
					await prisma.user.update({
						where: { id: userId },
						data: {
							subscriptionStatus: "active",
						},
					});
				} catch (e) {
					console.error(
						"Erro ao atualizar usuário por checkout.session.completed:",
						(e as any)?.message
					);
				}
			}
			break;
		}

		default:
			// Outros eventos podem ser ignorados
			break;
	}

	return NextResponse.json({ received: true });
}

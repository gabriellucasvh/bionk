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
		console.error("Webhook inválido: faltando assinatura ou secret");
		return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
	}

	let event: Stripe.Event;
	try {
		const payload = await req.text();
		event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
	} catch {
		return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
	}

	switch (event.type) {
		case "customer.subscription.created": {
			const subscription = event.data.object as Stripe.Subscription;

			// Tenta obter userId do metadata
			let userId: string | undefined =
				(subscription.metadata?.userId as string | undefined) || undefined;

			// Novo fallback preferencial: buscar usuário pelo stripeCustomerId
			if (!userId) {
				const customerId = subscription.customer as string | undefined;
				if (customerId) {
					const userByCustomer = await prisma.user.findFirst({
						where: { stripeCustomerId: customerId },
						select: { id: true },
					});
					if (userByCustomer) {
						userId = userByCustomer.id;
					}
				}
			}

			// Fallback: buscar usuário pelo e-mail do Customer
			if (!userId) {
				const customerId = subscription.customer as string | undefined;
				if (customerId) {
					const customer = await stripe.customers
						.retrieve(customerId)
						.catch(() => null);
					if (
						customer &&
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
				}
			}

			// Determina plano via price da subscription
			let plan: "basic" | "pro" | "ultra" | null = null;
			const priceId =
				(subscription.items?.data?.[0]?.price?.id as string | undefined) ||
				undefined;
			plan = mapPriceToPlan(priceId);

			const status = subscription.status;
			const currentPeriodEndUnix =
				(subscription as any).current_period_end || undefined;
			const currentPeriodEndDate = currentPeriodEndUnix
				? new Date(currentPeriodEndUnix * 1000)
				: undefined;
			const currentPeriodStartUnix =
				(subscription as any).current_period_start || undefined;
			const currentPeriodStartDate = currentPeriodStartUnix
				? new Date(currentPeriodStartUnix * 1000)
				: undefined;

			if (userId) {
				const updateData = {
					subscriptionStatus: status,
					subscriptionPlan: plan || undefined,
					subscriptionEndDate: currentPeriodEndDate,
					subscriptionStartDate: currentPeriodStartDate,
					stripeCustomerId: (subscription.customer as string) || undefined,
					stripeSubscriptionId: subscription.id || undefined,
					stripePriceId: subscription.items?.data?.[0]?.price?.id || undefined,
				};
				await prisma.user.update({
					where: { id: userId },
					data: updateData,
				});

				// Reforço: garantir uma única assinatura ativa para o customer
				const customerId = subscription.customer as string;
				const list = await stripe.subscriptions
					.list({
						customer: customerId,
						status: "active",
						limit: 100,
					})
					.catch(() => null);
				if (list) {
					const currentId = subscription.id;
					const toCancel = list.data.filter((s) => s.id !== currentId);
					if (toCancel.length > 0) {
						await Promise.allSettled(
							toCancel.map((s) => stripe.subscriptions.cancel(s.id))
						);
					}
				}

				break;
			}

			break;
		}

		case "invoice.payment_succeeded": {
			const invoice = event.data.object as Stripe.Invoice;
			let expandedInvoice: Stripe.Invoice | null = null;

			// Para garantir dados consistentes, buscamos a invoice com a subscription expandida
			expandedInvoice = await stripe.invoices
				.retrieve(invoice.id, {
					expand: ["subscription"],
				})
				.catch(() => null);

			const sourceInvoice = expandedInvoice || invoice;

			// Recupera dados do cartão via PaymentIntent
			let brand: string | undefined;
			let last4: string | undefined;
			const paymentIntentId = (invoice as any).payment_intent as
				| string
				| undefined;
			if (paymentIntentId) {
				const paymentIntent = await stripe.paymentIntents
					.retrieve(paymentIntentId, { expand: ["payment_method"] })
					.catch(() => null);
				const card = (paymentIntent as any)?.payment_method?.card as
					| Stripe.PaymentMethod["card"]
					| undefined;
				brand = card?.brand;
				last4 = card?.last4;
			}

			// Tenta identificar o userId
			let userId: string | undefined =
				(invoice.metadata?.userId as string | undefined) || undefined;

			// Novo fallback preferencial: buscar usuário pelo stripeCustomerId
			if (!userId && invoice.customer) {
				const customerId = invoice.customer as string;
				const userByCustomer = await prisma.user.findFirst({
					where: { stripeCustomerId: customerId },
					select: { id: true },
				});
				if (userByCustomer) {
					userId = userByCustomer.id;
				}
			}

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
				const customer = await stripe.customers
					.retrieve(invoice.customer as string)
					.catch(() => null);
				if (
					customer &&
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
			}

			// Determina plano via linha da fatura
			let plan: "basic" | "pro" | "ultra" | null = null;
			let priceId: string | undefined;
			const line = invoice.lines?.data?.[0];
			priceId = ((line as any)?.price?.id as string | undefined) || undefined;
			plan = mapPriceToPlan(priceId);

			// Extrai subscriptionId de forma compatível com tipos
			let subscriptionId: string | undefined;
			const invSub = (sourceInvoice as any).subscription;
			if (typeof invSub === "string") {
				subscriptionId = invSub;
			} else if (invSub && typeof invSub === "object") {
				subscriptionId = (invSub as Stripe.Subscription).id;
			}

			// Deriva período de fim a partir da fatura (quando disponível)
			let subscriptionEndDate: Date | undefined;
			let subscriptionStartDate: Date | undefined;
			const line2 = invoice.lines?.data?.[0];
			const periodEnd = line2?.period?.end;
			const periodStart = line2?.period?.start;
			if (typeof periodEnd === "number") {
				subscriptionEndDate = new Date(periodEnd * 1000);
			}
			if (typeof periodStart === "number") {
				subscriptionStartDate = new Date(periodStart * 1000);
			}

			if (userId) {
				// Lógica de atualização não destrutiva
				const updateData: Record<string, any> = {
					subscriptionStatus: "active",
					stripeCustomerId: (sourceInvoice.customer as string) || undefined,
				};

				if (plan) {
					updateData.subscriptionPlan = plan;
				}
				if (subscriptionStartDate) {
					updateData.subscriptionStartDate = subscriptionStartDate;
				}
				if (subscriptionEndDate) {
					updateData.subscriptionEndDate = subscriptionEndDate;
				}
				if (brand) {
					updateData.paymentMethodBrand = brand;
				}
				if (last4) {
					updateData.paymentMethodLastFour = last4;
				}
				if (subscriptionId) {
					updateData.stripeSubscriptionId = subscriptionId;
				}
				if (priceId) {
					updateData.stripePriceId = priceId;
				}

				await prisma.user.update({
					where: { id: userId },
					data: updateData,
				});
			}

			break;
		}

		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;

			// Tenta identificar o userId
			let userId: string | undefined =
				(session.metadata?.userId as string | undefined) || undefined;

			// Fallback: usar customer_email
			if (!userId && session.customer_email) {
				const user = await prisma.user.findUnique({
					where: { email: session.customer_email },
				});
				if (user) {
					userId = user.id;
				}
			}

			// Novo: tentar extrair plano e período direto no checkout
			let plan: "basic" | "pro" | "ultra" | null = null;
			let stripeSubscriptionId: string | undefined;
			let stripePriceId: string | undefined;
			let subscriptionEndDate: Date | undefined;
			let subscriptionStartDate: Date | undefined;
			if (session.subscription) {
				const sub = await stripe.subscriptions
					.retrieve(session.subscription as string, {
						expand: ["items.data.price"],
					})
					.catch(() => null);
				if (sub) {
					stripeSubscriptionId = sub.id;
					stripePriceId = sub.items?.data?.[0]?.price?.id;
					plan = mapPriceToPlan(stripePriceId);
					const endUnix = (sub as any).current_period_end;
					const startUnix = (sub as any).current_period_start;
					subscriptionEndDate =
						typeof endUnix === "number" ? new Date(endUnix * 1000) : undefined;
					subscriptionStartDate =
						typeof startUnix === "number"
							? new Date(startUnix * 1000)
							: undefined;
				}
			} else {
				// Fallback: expandir line_items no checkout para obter o priceId
				const expanded = await stripe.checkout.sessions
					.retrieve(session.id, { expand: ["line_items"] })
					.catch(() => null);
				const line = (expanded as any)?.line_items?.data?.[0];
				stripePriceId = line?.price?.id;
				plan = mapPriceToPlan(stripePriceId);
			}

			if (userId) {
				const updateData = {
					subscriptionStatus: "active",
					subscriptionPlan: plan || undefined,
					subscriptionStartDate,
					subscriptionEndDate,
					stripeCustomerId: (session.customer as string) || undefined,
					stripeSubscriptionId,
					stripePriceId,
				};
				await prisma.user.update({
					where: { id: userId },
					data: updateData,
				});
			}

			break;
		}

		default:
			// Outros eventos podem ser ignorados
			break;
	}

	return NextResponse.json({ received: true });
}

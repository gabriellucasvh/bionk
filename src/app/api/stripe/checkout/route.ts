// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
});

type BillingCycle = "monthly" | "annual";

const PRICE_IDS: Record<string, Record<BillingCycle, string>> = {
	basic: {
		monthly: "price_1SMJfgAFJoTCLcKxPpIET44r",
		annual: "price_1SMJgFAFJoTCLcKxi1Lz0mjw",
	},
	pro: {
		monthly: "price_1SMJgaAFJoTCLcKxjlhtrwTD",
		annual: "price_1SMJh8AFJoTCLcKxz315eFWB",
	},
	ultra: {
		monthly: "price_1SMJhRAFJoTCLcKxv0ON75lt",
		annual: "price_1SMJhoAFJoTCLcKxFnOVycso",
	},
};

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));
		const plan: string = (body.plan || "").toLowerCase();
		const billingCycleInput: string = (body.billingCycle || "monthly").toLowerCase();
		const billingCycle: BillingCycle = billingCycleInput === "annual" ? "annual" : "monthly";

		const selectedPlan = plan;
		const finalPriceId =
			PRICE_IDS[selectedPlan] && PRICE_IDS[selectedPlan][billingCycle]
				? PRICE_IDS[selectedPlan][billingCycle]
				: undefined;
		if (!finalPriceId) {
			return NextResponse.json(
				{ error: "Plano ou ciclo de cobrança inválido" },
				{ status: 400 }
			);
		}

		// Recupera/cria o Customer da Stripe por usuário e persiste stripeCustomerId
		const dbUser = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				email: true,
				stripeCustomerId: true,
				stripeSubscriptionId: true,
				subscriptionStatus: true,
			},
		});

		let customerId: string | undefined = dbUser?.stripeCustomerId || undefined;
		const userEmail =
			dbUser?.email || (session.user as any)?.email || undefined;

		if (!customerId && userEmail) {
			const existing = await stripe.customers.list({
				email: userEmail,
				limit: 1,
			});
			customerId = existing.data[0]?.id;
		}

		if (!customerId && userEmail) {
			const created = await stripe.customers.create({ email: userEmail });
			customerId = created.id;
		}

		// Persistir no banco para futuras compras (tanto encontrado quanto criado)
		if (customerId && customerId !== dbUser?.stripeCustomerId) {
			await prisma.user.update({
				where: { id: session.user.id },
				data: { stripeCustomerId: customerId },
			});
		}

		// Se já existe assinatura ativa, não criar nova: usar Portal ou rota de troca
		if (
			dbUser?.stripeSubscriptionId &&
			dbUser?.subscriptionStatus === "active"
		) {
			// Opcional: criar sessão de portal diretamente para conveniência
			const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
			const returnUrl = `${origin}/studio`;
			const configurationId =
				process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID || undefined;

			if (!customerId) {
				return NextResponse.json(
					{ error: "Cliente Stripe não encontrado para portal" },
					{ status: 400 }
				);
			}

			const params: Stripe.BillingPortal.SessionCreateParams = {
				customer: customerId,
				return_url: returnUrl,
			};
			if (configurationId) {
				(params as any).configuration = configurationId;
			}
			const portal = await stripe.billingPortal.sessions.create(params);

			return NextResponse.json(
				{
					error:
						"Assinatura ativa detectada. Gerencie seu plano no Customer Portal.",
					portalUrl: portal.url,
				},
				{ status: 409 }
			);
		}

		// URLs de sucesso/cancelamento
		const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const successUrl = `${origin}/checkout/success`;
		const cancelUrl = `${origin}/checkout/failure`;

		if (!customerId) {
			return NextResponse.json(
				{ error: "Cliente Stripe não disponível para checkout" },
				{ status: 400 }
			);
		}

		const sessionCheckout = await stripe.checkout.sessions.create({
			mode: "subscription",
			locale: "pt-BR",
			// Usa explicitamente o Customer do usuário para vincular corretamente
			customer: customerId,
			line_items: [{ price: finalPriceId, quantity: 1 }],
			success_url: successUrl,
			cancel_url: cancelUrl,
			client_reference_id: session.user.id,
			metadata: {
				userId: session.user.id,
				plan: selectedPlan || "unknown",
				billingCycle,
			},
			// Propaga metadata para a Subscription (usado no webhook)
			subscription_data: {
				metadata: {
					userId: session.user.id,
					plan: selectedPlan || "unknown",
					billingCycle,
				},
			},
		});

		return NextResponse.json({ url: sessionCheckout.url });
	} catch (error: any) {
		return NextResponse.json(
			{ error: error?.message || "Erro interno" },
			{ status: 500 }
		);
	}
}

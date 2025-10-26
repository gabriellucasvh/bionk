// src/app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

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
		const billingCycle: BillingCycle = body.billingCycle || "monthly";
		const explicitPriceId: string | undefined = body.priceId;

		let priceId = explicitPriceId;
		const selectedPlan = plan;

		if (!priceId) {
			if (!(PRICE_IDS[selectedPlan] && PRICE_IDS[selectedPlan][billingCycle])) {
				return NextResponse.json(
					{ error: "Plano ou ciclo de cobrança inválido" },
					{ status: 400 }
				);
			}
			priceId = PRICE_IDS[selectedPlan][billingCycle];
		}

		// URLs de sucesso/cancelamento
		const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const successUrl = `${origin}/checkout/success`;
		const cancelUrl = `${origin}/checkout/failure`;

		const sessionCheckout = await stripe.checkout.sessions.create({
			mode: "subscription",
			// customer_creation só é permitido em mode: 'payment'; remova-o para subscrição.
			// Em subscrição, associe o cliente via 'customer_email' ou deixe o Checkout criar automaticamente.
			customer_email: session.user.email || undefined,
			line_items: [{ price: priceId!, quantity: 1 }],
			success_url: successUrl,
			cancel_url: cancelUrl,
			client_reference_id: session.user.id,
			metadata: {
				userId: session.user.id,
				plan: selectedPlan || "unknown",
				billingCycle,
			},
		});

		return NextResponse.json({ url: sessionCheckout.url });
	} catch (error: any) {
		console.error("Erro ao criar Checkout Session:", error);
		return NextResponse.json(
			{ error: error?.message || "Erro interno" },
			{ status: 500 }
		);
	}
}

// src/app/api/stripe/customer-portal/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
});

export async function POST() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { email: true, stripeCustomerId: true },
		});

		if (!user?.email) {
			return NextResponse.json({ error: "Usuário sem email" }, { status: 400 });
		}

		// Preferir o customerId já persistido
		let customerId: string | undefined = user.stripeCustomerId || undefined;

		// Fallback: buscar Customer por e-mail
		if (!customerId) {
			const customers = await stripe.customers.list({
				email: user.email,
				limit: 1,
			});
			customerId = customers.data[0]?.id;
		}

		// Fallback definitivo: criar Customer e persistir no banco
		if (!customerId) {
			const created = await stripe.customers.create({ email: user.email });
			customerId = created.id;
			await prisma.user.update({
				where: { id: session.user.id },
				data: { stripeCustomerId: customerId },
			});
		}

		const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const returnUrl = `${origin}/studio`;

		// Se houver uma configuração específica do portal no .env, usar
		const configurationId =
			process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID || undefined;

		const params: Stripe.BillingPortal.SessionCreateParams = {
			locale: "pt-BR",
			customer: customerId,
			return_url: returnUrl,
		};
		if (configurationId) {
			(params as any).configuration = configurationId;
		}

		const portal = await stripe.billingPortal.sessions.create(params);

		return NextResponse.json({ url: portal.url });
	} catch (error: any) {
		console.error("Erro ao criar sessão do Customer Portal:", error);
		const message =
			typeof error?.message === "string" ? error.message : "Erro interno";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

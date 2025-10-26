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
			select: { email: true /*, stripeCustomerId: true*/ },
		});

		if (!user?.email) {
			return NextResponse.json({ error: "Usuário sem email" }, { status: 400 });
		}

		// Tenta recuperar o customer na Stripe
		let customerId: string | undefined;

		// Se existir no banco, use (desativado por tipagem até gerar Prisma)
		// customerId = (user as any).stripeCustomerId || undefined;

		if (!customerId) {
			const customers = await stripe.customers.list({
				email: user.email,
				limit: 1,
			});
			customerId = customers.data[0]?.id;
		}

		if (!customerId) {
			// Como fallback, cria um customer
			const created = await stripe.customers.create({ email: user.email });
			customerId = created.id;
		}

		const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const returnUrl = `${origin}/studio`;

		const portal = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: returnUrl,
		});

		return NextResponse.json({ url: portal.url });
	} catch (error: any) {
		console.error("Erro ao criar sessão do Customer Portal:", error);
		return NextResponse.json(
			{ error: error?.message || "Erro interno" },
			{ status: 500 }
		);
	}
}

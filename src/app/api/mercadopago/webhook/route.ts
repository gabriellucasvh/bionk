// src/app/api/mercadopago/webhook/route.ts

import prisma from "@/lib/prisma";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Calcula a data de expiração da assinatura com base na data de início e na frequência.
 */
function calculateEndDate(
	startDate: Date,
	recurring: PreApprovalResponse["auto_recurring"]
): Date {
	const endDate = new Date(startDate);

	if (recurring?.frequency && recurring.frequency_type) {
		if (recurring.frequency_type === "months") {
			endDate.setMonth(endDate.getMonth() + recurring.frequency);
		} else if (recurring.frequency_type === "days") {
			endDate.setDate(endDate.getDate() + recurring.frequency);
		}
	} else {
		endDate.setDate(endDate.getDate() + 30);
	}

	return endDate;
}

/**
 * Processa a notificação de assinatura e atualiza o usuário no banco de dados.
 */
async function processSubscriptionUpdate(subDetails: PreApprovalResponse) {
	const userId = subDetails.external_reference;
	if (!(userId && subDetails.id)) {
		return;
	}

	const planName = subDetails.reason?.split(" ")[2]?.toLowerCase() || "unknown";
	const billingCycle = subDetails.reason?.includes("annual")
		? "annual"
		: "monthly";

	const startDate = new Date(subDetails.date_created || Date.now());
	const endDate = calculateEndDate(startDate, subDetails.auto_recurring);

	await prisma.user.update({
		where: { id: userId },
		data: {
			mercadopagoSubscriptionId: subDetails.id,
			subscriptionPlan: planName,
			subscriptionStatus: "active",
			billingCycle,
			subscriptionStartDate: startDate,
			subscriptionEndDate: endDate,
			// --- CORREÇÃO: Removido pois os dados não estão disponíveis neste evento ---
			// paymentMethodBrand: subDetails.summarized?.card_brand,
			// paymentMethodLastFour: subDetails.summarized?.last_four_digits,
		},
	});
}

/**
 * Rota principal que recebe os webhooks do Mercado Pago.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (body.type === "preapproval" && body.data?.id) {
			const preapprovalId = body.data.id;

			const client = new MercadoPagoConfig({
				accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
			});
			const preapproval = new PreApproval(client);
			const subDetails = await preapproval.get({ id: preapprovalId });

			if (subDetails.status === "authorized") {
				await processSubscriptionUpdate(subDetails);
			}
		}

		return NextResponse.json({ success: true });
	} catch  {
		return NextResponse.json(
			{ error: "Erro ao processar webhook de assinatura" },
			{ status: 500 }
		);
	}
}

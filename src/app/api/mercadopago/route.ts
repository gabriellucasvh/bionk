// src/app/api/mercadopago/route.ts

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { type NextRequest, NextResponse } from "next/server";

const PLAN_IDS = {
	basic: {
		monthly: "fa25602799524fe99242c4c22df7b817",
		annual: "01e6f8407bde451d8e20b756396c8c3e",
	},
	pro: {
		monthly: "dcfd3a38065244a69e5fdfda98b3a307",
		annual: "29441e6cf2fe45bca9d3e71ea600d520",
	},
	premium: {
		monthly: "6e0ffaa030134804b3c5ca34ea9ef1b0",
		annual: "6e9c9a016f5449bba0ec7615883d59ca",
	},
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		// Agora recebemos card_token_id
		const { plan, billingCycle, email, userId, card_token_id } = body;

		if (!(plan && billingCycle && email && userId && card_token_id)) {
			return NextResponse.json(
				{
					error:
						"Dados incompletos para criar assinatura (token do cartão ausente)",
				},
				{ status: 400 }
			);
		}

		const planKey = plan.toLowerCase() as keyof typeof PLAN_IDS;
		const cycleKey =
			billingCycle.toLowerCase() as keyof (typeof PLAN_IDS)["basic"];
		const preapproval_plan_id = PLAN_IDS[planKey]?.[cycleKey];

		if (!preapproval_plan_id) {
			return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
		}

		const client = new MercadoPagoConfig({
			accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
		});
		const preapproval = new PreApproval(client);

		const preapprovalData = {
			preapproval_plan_id,
			payer_email: email,
			card_token_id, // <-- ADICIONADO AQUI
			back_url: `${process.env.NEXT_PUBLIC_APP_URL}/studio`,
			reason: `Assinatura Plano ${plan} (${billingCycle})`,
			external_reference: userId,
			status: "authorized", // Força a autorização imediata com o token do cartão
		};

		const result = await preapproval.create({ body: preapprovalData });

		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json(
			{
				error: "Erro ao criar assinatura",
				details: error.message || "Erro desconhecido",
			},
			{ status: 500 }
		);
	}
}

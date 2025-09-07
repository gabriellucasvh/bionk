// src/app/api/mercadopago/webhook/route.ts

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

	// Validações básicas
	if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
		console.error("Webhook: external_reference inválido", { userId });
		return;
	}

	if (!subDetails.id) {
		console.error("Webhook: ID da preapproval não encontrado", { subDetails });
		return;
	}

	// Extrair informações do plano
	const planName = subDetails.reason?.split(" ")[2]?.toLowerCase() || "unknown";
	const billingCycle = subDetails.reason?.includes("annual")
		? "annual"
		: "monthly";

	const startDate = new Date(subDetails.date_created || Date.now());
	const endDate = calculateEndDate(startDate, subDetails.auto_recurring);

	try {
		// Verificar se o usuário existe antes de atualizar
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			console.error("Webhook: Usuário não encontrado para atualização", {
				userId,
			});
			return;
		}

		// Verificar se a assinatura já foi processada
		if (existingUser.mercadopagoSubscriptionId === subDetails.id) {
			console.log("Webhook: Assinatura já processada anteriormente", {
				userId,
				subscriptionId: subDetails.id,
			});
			return;
		}

		// Atualizar dados da assinatura
		await prisma.user.update({
			where: { id: userId },
			data: {
				mercadopagoSubscriptionId: subDetails.id,
				subscriptionPlan: planName,
				subscriptionStatus: "active",
				billingCycle,
				subscriptionStartDate: startDate,
				subscriptionEndDate: endDate,
			},
		});

		console.log("Webhook: Usuário atualizado com sucesso", {
			userId,
			subscriptionId: subDetails.id,
			plan: planName,
			billingCycle,
			startDate,
			endDate,
		});
	} catch (dbError) {
		console.error("Webhook: Erro ao atualizar usuário no banco de dados", {
			userId,
			subscriptionId: subDetails.id,
			error: dbError,
		});
		throw dbError; // Re-throw para que o webhook retorne erro
	}
}

/**
 * Rota principal que recebe os webhooks do Mercado Pago.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		// Validação do Content-Type
		const contentType = request.headers.get("content-type");
		if (!contentType?.includes("application/json")) {
			console.error("Webhook: Content-Type inválido", { contentType });
			return NextResponse.json(
				{ error: "Content-Type deve ser application/json" },
				{ status: 400 }
			);
		}

		// Verificar configuração do Mercado Pago
		if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
			console.error("Webhook: Token de acesso não configurado");
			return NextResponse.json(
				{ error: "Configuração inválida" },
				{ status: 503 }
			);
		}

		let body: any;
		try {
			body = await request.json();
		} catch (parseError) {
			console.error("Webhook: Erro ao fazer parse do JSON", parseError);
			return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
		}

		console.log("Webhook recebido:", {
			type: body.type,
			dataId: body.data?.id,
		});

		// Validar estrutura do webhook
		if (!(body.type && body.data?.id)) {
			console.error("Webhook: Estrutura inválida", { body });
			return NextResponse.json(
				{ error: "Estrutura de webhook inválida" },
				{ status: 400 }
			);
		}

		// Processar apenas webhooks de preapproval
		if (body.type === "preapproval") {
			const preapprovalId = body.data.id;

			try {
				const client = new MercadoPagoConfig({
					accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
				});
				const preapproval = new PreApproval(client);
				const subDetails = await preapproval.get({ id: preapprovalId });

				console.log("Detalhes da preapproval:", {
					id: subDetails.id,
					status: subDetails.status,
					externalReference: subDetails.external_reference,
				});

				if (subDetails.status === "authorized") {
					await processSubscriptionUpdate(subDetails);
					console.log("Assinatura processada com sucesso:", {
						id: preapprovalId,
					});
				} else {
					console.log("Preapproval não autorizada, ignorando:", {
						id: preapprovalId,
						status: subDetails.status,
					});
				}
			} catch (mpError) {
				console.error("Erro ao buscar preapproval no Mercado Pago:", mpError);
				return NextResponse.json(
					{ error: "Erro ao processar webhook" },
					{ status: 500 }
				);
			}
		} else {
			console.log("Tipo de webhook ignorado:", { type: body.type });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro geral no webhook:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

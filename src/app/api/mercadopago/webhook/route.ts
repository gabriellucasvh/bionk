// src/app/api/mercadopago/webhook/route.ts

import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateUserSubscriptionCache } from "@/providers/subscriptionProvider";

// Chave secreta do webhook do Mercado Pago
const MERCADO_PAGO_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

// --- Funções de Validação de Assinatura (Sem alterações) ---
function parseSignatureParts(xSignature: string): {
	timestamp?: string;
	hash?: string;
} {
	const parts = xSignature.split(",").map((p) => p.trim());
	const map = new Map<string, string>();
	for (const part of parts) {
		const [key, value] = part.split("=");
		if (key && value) {
			map.set(key, value);
		}
	}
	return { timestamp: map.get("ts"), hash: map.get("v1") };
}

function validateSignatureHeaders(
	xSignature: string | null,
	xRequestId: string | null,
	dataId: string
): boolean {
	if (!xSignature || !xRequestId) {
		console.error("Webhook: Assinatura ou request-id ausente", { xSignature, xRequestId });
		return false;
	}

	const { timestamp, hash } = parseSignatureParts(xSignature);
	if (!timestamp || !hash) {
		console.error("Webhook: Assinatura inválida (partes ausentes)", { xSignature });
		return false;
	}

	const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;
	const expectedHash = crypto
		.createHmac("sha256", MERCADO_PAGO_WEBHOOK_SECRET || "")
		.update(manifest)
		.digest("hex");

	const isValid = expectedHash === hash;
	console.log("Webhook: Validação de assinatura", { manifest, expectedHash, receivedHash: hash, isValid });
	return isValid;
}

function validateWebhookSignature(request: NextRequest, dataId: string): boolean {
	const xSignature = request.headers.get("x-signature");
	const xRequestId = request.headers.get("x-request-id");
	return validateSignatureHeaders(xSignature, xRequestId, dataId);
}

function calculateEndDate(
	startDate: Date,
	recurring: PreApprovalResponse["auto_recurring"]
): Date {
	const endDate = new Date(startDate);

	if (recurring?.frequency && recurring.frequency_type) {
		if (recurring.frequency_type === "months") {
			const currentMonth = endDate.getUTCMonth();
			const currentYear = endDate.getUTCFullYear();
			const newMonth = currentMonth + recurring.frequency;

			if (newMonth >= 12) {
				endDate.setUTCFullYear(currentYear + Math.floor(newMonth / 12));
				endDate.setUTCMonth(newMonth % 12);
			} else {
				endDate.setUTCMonth(newMonth);
			}
		} else if (recurring.frequency_type === "days") {
			endDate.setUTCDate(endDate.getUTCDate() + recurring.frequency);
		}
	} else {
		endDate.setUTCDate(endDate.getUTCDate() + 30);
	}

	return endDate;
}

async function processSubscriptionUpdate(subDetails: PreApprovalResponse) {
	const userId = subDetails.external_reference;

	if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
		console.error("Webhook: external_reference inválido", { userId });
		return;
	}

	if (!subDetails.id) {
		console.error("Webhook: ID da preapproval não encontrado", { subDetails });
		return;
	}

	const planName = subDetails.reason?.split(" ")[2]?.toLowerCase() || "unknown";
	const billingCycle = subDetails.reason?.includes("Anual")
		? "annual"
		: "monthly";

	const startDate = new Date(subDetails.date_created || Date.now());
	const endDate = calculateEndDate(startDate, subDetails.auto_recurring);

	try {
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				mercadopagoSubscriptionId: true,
				pendingSubscriptionPlan: true,
			},
		});

		if (!existingUser) {
			console.error("Webhook: Usuário não encontrado para atualização", { userId });
			return;
		}

		if (existingUser.mercadopagoSubscriptionId === subDetails.id) {
			console.log("Webhook: Assinatura já processada anteriormente", {
				userId,
				subscriptionId: subDetails.id,
			});
			return;
		}

		const finalPlanName = existingUser.pendingSubscriptionPlan || planName;

		console.log("Webhook: Dados para atualização:", {
			userId,
			mercadopagoSubscriptionId: subDetails.id,
			finalPlanName,
			billingCycle,
			startDate,
			endDate,
		});

		await prisma.user.update({
			where: { id: userId },
			data: {
				mercadopagoSubscriptionId: subDetails.id,
				subscriptionPlan: finalPlanName,
				subscriptionStatus: "active",
				billingCycle,
				subscriptionStartDate: startDate,
				subscriptionEndDate: endDate,
				pendingSubscriptionPlan: null,
			},
		});

		// Invalida o cache do plano do usuário para forçar nova busca
		invalidateUserSubscriptionCache(userId);

		console.log("Webhook: Usuário atualizado com sucesso e cache invalidado");
	} catch (dbError) {
		console.error("Webhook: Erro ao atualizar usuário no banco de dados", {
			userId,
			subscriptionId: subDetails.id,
			error: dbError,
		});
		throw dbError;
	}
}

// --- Funções de Processamento de Webhook (ATUALIZADAS) ---

/**
 * Processa webhooks de pagamento. Esta é a fonte de verdade para ativar assinaturas.
 * Agora faz fallback: se o pagamento aprovado vier sem external_reference,
 * usa o preapproval_id para buscar a assinatura e obter o external_reference.
 */
async function processPaymentWebhook(body: any): Promise<NextResponse> {
	const paymentId = body.data.id;
	console.log("Processando webhook de payment:", { paymentId });

	try {
		const client = new MercadoPagoConfig({
			accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
		});
		const payment = new Payment(client);
		const paymentDetails = await payment.get({ id: paymentId });

		const typedPaymentDetails = paymentDetails as any;
		const status: string | undefined = typedPaymentDetails.status;
		const statusDetail: string | undefined = typedPaymentDetails.status_detail;
		const userId: string | undefined = typedPaymentDetails.external_reference;
		const preapprovalId: string | undefined = typedPaymentDetails.preapproval_id;

		if (status === "approved") {
			if (userId && preapprovalId) {
				console.log("Pagamento aprovado, ativando assinatura para o usuário:", {
					userId,
					preapprovalId,
				});

				const preapproval = new PreApproval(client);
				const subDetails = await preapproval.get({ id: preapprovalId });
				await processSubscriptionUpdate(subDetails);
			} else if (!userId && preapprovalId) {
				console.log(
					"Pagamento aprovado sem external_reference; buscando referência via preapproval",
					{ paymentId, preapprovalId }
				);
				const preapproval = new PreApproval(client);
				const subDetails = await preapproval.get({ id: preapprovalId });
				await processSubscriptionUpdate(subDetails);
			} else {
				console.log("Pagamento aprovado, mas informações insuficientes para ativar", {
					paymentId,
					userId,
					preapprovalId,
				});
			}
		} else {
			console.log("Pagamento não aprovado", {
				paymentId,
				status,
				statusDetail,
				userId: userId ?? null,
				preapprovalId: preapprovalId ?? null,
			});
		}
	} catch (error) {
		console.error("Erro fatal ao processar webhook de payment:", error);
		return NextResponse.json(
			{ error: "Erro interno ao processar webhook de payment" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true });
}

/**
 * Processa webhooks de preapproval: ativa quando a assinatura está autorizada/ativa.
 */
async function processPreapprovalWebhook(body: any): Promise<NextResponse> {
	const preapprovalId = body.data.id;
	console.log("Webhook de preapproval recebido:", { preapprovalId, action: body.action, type: body.type });

	try {
		const client = new MercadoPagoConfig({
			accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
		});
		const preapproval = new PreApproval(client);
		const subDetails = await preapproval.get({ id: preapprovalId });

		// Somente ativa quando realmente autorizado/ativo
		if (subDetails.status === "authorized" || subDetails.status === "active") {
			console.log("Preapproval autorizado/ativo, ativando assinatura", {
				preapprovalId,
				status: subDetails.status,
				external_reference: subDetails.external_reference,
			});
			await processSubscriptionUpdate(subDetails as any);
		} else {
			console.log("Preapproval não autorizado/ativo ainda; aguardando fluxo de pagamento", {
				preapprovalId,
				status: subDetails.status,
			});
		}
	} catch (error) {
		console.error("Erro ao processar webhook de preapproval:", error);
		return NextResponse.json(
			{ error: "Erro interno ao processar webhook de preapproval" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true });
}

// --- Funções de Validação da Rota (Sem alterações) ---
function validateWebhookRequest(request: NextRequest): NextResponse | null {
	const contentType = request.headers.get("content-type");
	if (!contentType?.includes("application/json")) {
		console.error("Webhook: Content-Type inválido", { contentType });
		return NextResponse.json(
			{ error: "Content-Type deve ser application/json" },
			{ status: 400 }
		);
	}

	if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
		console.error("Webhook: Token de acesso não configurado");
		return NextResponse.json(
			{ error: "Configuração inválida" },
			{ status: 503 }
		);
	}

	return null;
}

function validateWebhookBody(body: any): NextResponse | null {
	if (!(body.type && body.data?.id)) {
		console.error("Webhook: Estrutura inválida", { body });
		return NextResponse.json(
			{ error: "Estrutura de webhook inválida" },
			{ status: 400 }
		);
	}
	return null;
}

// --- Rota Principal POST (Sem alterações na lógica principal) ---
export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const requestError = validateWebhookRequest(request);
		if (requestError) {
			return requestError;
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
			timestamp: new Date().toISOString(),
			headers: {
				xSignature: request.headers.get("x-signature"),
				xRequestId: request.headers.get("x-request-id"),
				userAgent: request.headers.get("user-agent"),
			},
			body: JSON.stringify(body, null, 2),
		});

		const bodyError = validateWebhookBody(body);
		if (bodyError) {
			return bodyError;
		}

		const signatureValid = validateWebhookSignature(request, body.data.id);
		console.log("Webhook: Validação de assinatura:", {
			signatureValid,
			dataId: body.data.id,
		});

		if (!signatureValid) {
			console.error("Webhook: Assinatura inválida - possível tentativa de fraude");
			return NextResponse.json(
				{ error: "Assinatura inválida" },
				{ status: 401 }
			);
		}

		if (body.type === "preapproval" || body.type === "subscription_preapproval") {
			return await processPreapprovalWebhook(body);
		}
		if (body.type === "payment") {
			return await processPaymentWebhook(body);
		}
		console.log("Tipo de webhook ignorado:", { type: body.type });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Erro geral no webhook:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

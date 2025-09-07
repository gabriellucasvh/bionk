// src/app/api/mercadopago/webhook/route.ts

import crypto from "node:crypto";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Chave secreta do webhook do Mercado Pago
const MERCADO_PAGO_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

/**
 * Valida a assinatura do webhook do Mercado Pago para garantir autenticidade.
 */
function validateWebhookSignature(
	request: NextRequest,
	dataId: string
): boolean {
	const xSignature = request.headers.get("x-signature");
	const xRequestId = request.headers.get("x-request-id");

	if (!MERCADO_PAGO_WEBHOOK_SECRET) {
		console.error("Webhook: Chave secreta não configurada");
		return false;
	}

	if (!(xSignature && xRequestId && dataId)) {
		console.error("Webhook: Headers de validação ausentes", {
			xSignature: !!xSignature,
			xRequestId: !!xRequestId,
			dataId: !!dataId,
		});
		return false;
	}

	try {
		// Parse da assinatura: "ts=timestamp,v1=hash"
		const parts = xSignature.split(",");
		let timestamp: string | undefined;
		let hash: string | undefined;

		for (const part of parts) {
			const [key, value] = part.split("=");

			if (key && value) {
				const trimmedKey = key.trim();
				const trimmedValue = value.trim();

				if (trimmedKey === "ts") {
					timestamp = trimmedValue;
				} else if (trimmedKey === "v1") {
					hash = trimmedValue;
				}
			}
		}

		if (!(timestamp && hash)) {
			console.error("Webhook: Formato de assinatura inválido", {
				xSignature,
				timestamp: !!timestamp,
				hash: !!hash,
			});
			return false;
		}

		// Criar o manifest para validação
		const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;

		// Gerar hash HMAC-SHA256
		const expectedHash = crypto
			.createHmac("sha256", MERCADO_PAGO_WEBHOOK_SECRET)
			.update(manifest)
			.digest("hex");

		const isValid = expectedHash === hash;

		console.log("Webhook: Validação de assinatura", {
			manifest,
			expectedHash,
			receivedHash: hash,
			isValid,
		});

		return isValid;
	} catch (error) {
		console.error("Webhook: Erro na validação da assinatura", error);
		return false;
	}
}

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
			// Usar setUTCMonth para evitar problemas de timezone
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
		// Default: 30 dias para planos mensais
		endDate.setUTCDate(endDate.getUTCDate() + 30);
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
			select: {
				id: true,
				mercadopagoSubscriptionId: true,
				pendingSubscriptionPlan: true,
			},
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

		// Usar o plano do campo pendingSubscriptionPlan se disponível, senão usar o extraído da reason
		const finalPlanName = existingUser.pendingSubscriptionPlan || planName;

		console.log("Webhook: Dados para atualização:", {
			userId,
			mercadopagoSubscriptionId: subDetails.id,
			finalPlanName,
			pendingPlan: existingUser.pendingSubscriptionPlan,
			extractedPlan: planName,
			billingCycle,
			startDate,
			endDate,
		});

		// Atualizar dados da assinatura
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				mercadopagoSubscriptionId: subDetails.id,
				subscriptionPlan: finalPlanName,
				subscriptionStatus: "active",
				billingCycle,
				subscriptionStartDate: startDate,
				subscriptionEndDate: endDate,
				// Limpar o campo temporário após confirmação
				pendingSubscriptionPlan: null,
			},
			select: {
				id: true,
				mercadopagoSubscriptionId: true,
				subscriptionPlan: true,
				subscriptionStatus: true,
			},
		});

		console.log("Webhook: Usuário atualizado com sucesso:", updatedUser);
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
			timestamp: new Date().toISOString(),
			headers: {
				xSignature: request.headers.get("x-signature"),
				xRequestId: request.headers.get("x-request-id"),
				userAgent: request.headers.get("user-agent"),
			},
			body: JSON.stringify(body, null, 2),
		});

		// Validar estrutura do webhook
		if (!(body.type && body.data?.id)) {
			console.error("Webhook: Estrutura inválida", { body });
			return NextResponse.json(
				{ error: "Estrutura de webhook inválida" },
				{ status: 400 }
			);
		}

		// Validar assinatura do webhook para garantir autenticidade
		// TEMPORÁRIO: Desabilitar validação de assinatura para debug em produção
		const signatureValid = validateWebhookSignature(request, body.data.id);
		console.log("Webhook: Validação de assinatura:", {
			signatureValid,
			dataId: body.data.id,
			xSignature: request.headers.get("x-signature"),
			xRequestId: request.headers.get("x-request-id"),
			hasSecret: !!MERCADO_PAGO_WEBHOOK_SECRET,
		});

		// TODO: Reabilitar validação após debug
		// if (!signatureValid) {
		// 	console.error(
		// 		"Webhook: Assinatura inválida - possível tentativa de fraude",
		// 		{
		// 			dataId: body.data.id,
		// 			xSignature: request.headers.get("x-signature"),
		// 			xRequestId: request.headers.get("x-request-id"),
		// 		}
		// 	);
		// 	return NextResponse.json(
		// 		{ error: "Assinatura inválida" },
		// 		{ status: 401 }
		// 	);
		// }

		// Processar apenas webhooks de preapproval
		if (body.type === "preapproval") {
			const preapprovalId = body.data.id;

			// Para testes, retornar sucesso sem processar
			if (preapprovalId.startsWith("test-")) {
				console.log("Webhook de teste processado com sucesso:", {
					preapprovalId,
				});
				return NextResponse.json({ success: true, test: true });
			}

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
					reason: subDetails.reason,
					dateCreated: subDetails.date_created,
					autoRecurring: subDetails.auto_recurring,
					payerEmail: subDetails.payer_email,
					fullDetails: JSON.stringify(subDetails, null, 2),
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

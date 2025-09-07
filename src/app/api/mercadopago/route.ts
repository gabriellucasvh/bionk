// src/app/api/mercadopago/route.ts

import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { type NextRequest, NextResponse } from "next/server";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";

// Rate limiting para prevenir abuso
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const record = requestCounts.get(ip);

	if (!record || now > record.resetTime) {
		requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
		return true;
	}

	if (record.count >= RATE_LIMIT) {
		return false;
	}

	record.count++;
	return true;
}

// Função para logging detalhado
function logError(context: string, error: any, additionalData?: any) {
	console.error(`[MERCADO_PAGO_ERROR] ${context}:`, {
		error: error.message || error,
		stack: error.stack,
		additionalData,
		timestamp: new Date().toISOString(),
	});
}

function logInfo(context: string, data: any) {
	console.log(`[MERCADO_PAGO_INFO] ${context}:`, {
		data,
		timestamp: new Date().toISOString(),
	});
}

// Preços dos planos em centavos (R$)
const PLAN_PRICES = {
	basic: {
		monthly: 1000, // R$ 10,00
		annual: 9600, // R$ 120,00 - 20% = R$ 96,00
	},
	pro: {
		monthly: 2000, // R$ 20,00
		annual: 19_200, // R$ 240,00 - 20% = R$ 192,00
	},
	premium: {
		monthly: 6000, // R$ 60,00
		annual: 57_600, // R$ 720,00 - 20% = R$ 576,00
	},
};

// Regex para validação de email (definido no escopo superior para performance)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Função para validar rate limiting
function validateRateLimit(request: NextRequest): NextResponse | null {
	const ip =
		request.headers.get("x-forwarded-for") ||
		request.headers.get("x-real-ip") ||
		"unknown";
	if (!checkRateLimit(ip)) {
		logError("Rate limit exceeded", { ip });
		return NextResponse.json(
			{ error: "Muitas tentativas. Tente novamente em alguns minutos." },
			{ status: 429 }
		);
	}
	return null;
}

// Função para validar Content-Type
function validateContentType(request: NextRequest): NextResponse | null {
	const contentType = request.headers.get("content-type");
	if (!contentType?.includes("application/json")) {
		logError("Content-Type inválido", { contentType });
		return NextResponse.json(
			{ error: "Content-Type deve ser application/json" },
			{ status: 400 }
		);
	}
	return null;
}

// Função para fazer parse do JSON
async function parseRequestBody(request: NextRequest): Promise<any> {
	try {
		return await request.json();
	} catch (parseError) {
		logError("Erro ao fazer parse do JSON", parseError);
		throw new Error("JSON inválido");
	}
}

// Função para validar campos obrigatórios
function validateRequestFields(body: any): NextResponse | null {
	const { plan, billingCycle, email, userId, card_token_id } = body;

	if (!plan || typeof plan !== "string" || plan.trim().length === 0) {
		logError("Campo 'plan' inválido", { plan });
		return NextResponse.json(
			{ error: "Campo 'plan' é obrigatório e deve ser uma string válida" },
			{ status: 400 }
		);
	}

	if (!(billingCycle && ["monthly", "annual"].includes(billingCycle))) {
		logError("Campo 'billingCycle' inválido", { billingCycle });
		return NextResponse.json(
			{ error: "Campo 'billingCycle' deve ser 'monthly' ou 'annual'" },
			{ status: 400 }
		);
	}

	if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
		logError("Campo 'email' inválido", {
			email: `${email?.substring(0, 3)}***`,
		});
		return NextResponse.json(
			{ error: "Campo 'email' deve ser um endereço de email válido" },
			{ status: 400 }
		);
	}

	if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
		logError("Campo 'userId' inválido", { userId });
		return NextResponse.json(
			{ error: "Campo 'userId' é obrigatório e deve ser uma string válida" },
			{ status: 400 }
		);
	}

	if (!card_token_id || typeof card_token_id !== "string" || card_token_id.trim().length === 0) {
		logError("Campo 'card_token_id' inválido", { card_token_id });
		return NextResponse.json(
			{ error: "Token do cartão é obrigatório" },
			{ status: 400 }
		);
	}

	return null;
}

// Função para validar plano e obter preço
function validatePlanAndGetPrice(
	plan: string,
	billingCycle: string
): { transactionAmount: number } | NextResponse {
	const planKey = plan.toLowerCase() as keyof typeof PLAN_PRICES;
	const cycleKey =
		billingCycle.toLowerCase() as keyof (typeof PLAN_PRICES)["basic"];
	const transactionAmount = PLAN_PRICES[planKey]?.[cycleKey];

	logInfo("Plan lookup", {
		planKey,
		cycleKey,
		transactionAmount,
		availablePlans: Object.keys(PLAN_PRICES),
	});

	if (!transactionAmount) {
		logError("Plan not found", new Error("Invalid plan configuration"), {
			requestedPlan: `${planKey}_${cycleKey}`,
			availablePlans: Object.keys(PLAN_PRICES),
		});
		return NextResponse.json(
			{
				error: `Plano inválido: ${plan} - ${billingCycle}`,
				details: `Plano '${planKey}_${cycleKey}' não está configurado`,
				availablePlans: Object.keys(PLAN_PRICES),
			},
			{ status: 400 }
		);
	}

	return { transactionAmount };
}

// Função para verificar configuração do Mercado Pago
function validateMercadoPagoConfig(): NextResponse | null {
	if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
		logError("Configuration error", new Error("Missing access token"));
		return NextResponse.json(
			{
				error: "Serviço temporariamente indisponível",
				code: "PAYMENT_SERVICE_UNAVAILABLE",
				message: "Tente novamente em alguns minutos",
			},
			{ status: 503 }
		);
	}
	return null;
}

// Função para verificar se usuário existe
async function validateUserExists(
	userId: string
): Promise<NextResponse | null> {
	try {
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			logError("Usuário não encontrado", { userId });
			return NextResponse.json(
				{
					error: "Usuário não encontrado",
					code: "USER_NOT_FOUND",
					message: "Verifique se o usuário está registrado",
				},
				{ status: 404 }
			);
		}
	} catch (dbError) {
		logError("Erro ao verificar usuário no banco de dados", dbError);
		return NextResponse.json(
			{
				error: "Erro interno do servidor",
				code: "DATABASE_ERROR",
				message: "Tente novamente em alguns minutos",
			},
			{ status: 500 }
		);
	}
	return null;
}

// Função para criar preapproval no Mercado Pago
async function createPreapproval(
	plan: string,
	billingCycle: string,
	email: string,
	userId: string,
	transactionAmount: number,
	cardTokenId: string
) {
	const client = new MercadoPagoConfig({
		accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
	});
	const preapproval = new PreApproval(client);
	logInfo("Mercado Pago client configured", {
		hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
	});

	// Configuração de datas
	const startDate = new Date();
	startDate.setDate(startDate.getDate() + 1);
	const endDate = new Date(startDate);
	endDate.setFullYear(endDate.getFullYear() + 10);

	// Dados da assinatura
	const preapprovalData = {
		payer_email: email,
		reason: `Assinatura Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${billingCycle === "monthly" ? "Mensal" : "Anual"})`,
		auto_recurring: {
			frequency: billingCycle === "monthly" ? 1 : 12,
			frequency_type: "months",
			transaction_amount: transactionAmount / 100,
			currency_id: "BRL",
			start_date: startDate.toISOString(),
			end_date: endDate.toISOString(),
		},
		back_url: "https://www.mercadopago.com.br",
		external_reference: userId,
		status: "authorized",
		notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.bionk.me'}/api/mercadopago/webhook`,
		card_token_id: cardTokenId,
	};

	logInfo("Creating preapproval", {
		preapprovalData,
		transactionAmount: transactionAmount / 100,
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString(),
		notificationUrl: preapprovalData.notification_url,
	});

	const result = await preapproval.create({ body: preapprovalData });

	logInfo("Preapproval created successfully", {
		preapprovalId: result.id,
		status: result.status,
		initPoint: result.init_point,
	});

	return result;
}

// Função para lidar com pós-criação (salvar no banco e notificar)
async function handlePostCreation(
	result: any,
	userId: string,
	plan: string,
	billingCycle: string,
	email: string,
	transactionAmount: number
) {
	if (!result.id) {
		return;
	}

	// Salvar apenas dados temporários no banco - NÃO alterar o plano ainda
	// O plano só será alterado quando o webhook confirmar o pagamento
	try {
		// Buscar o plano atual do usuário para manter
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { subscriptionPlan: true }
		});

		const currentPlan = currentUser?.subscriptionPlan || "free";

		// Salvar apenas informações de controle, mantendo o plano atual
		await prisma.user.update({
			where: { id: userId },
			data: {
				// Manter o plano atual - não alterar até confirmação
				subscriptionPlan: currentPlan,
				// Salvar o plano solicitado em campo temporário
				pendingSubscriptionPlan: plan,
				// Salvar status como pending para controle
				subscriptionStatus: "pending",
				// Salvar dados do plano solicitado
				billingCycle,
				// Não definir datas até confirmação do pagamento
				subscriptionStartDate: null,
				subscriptionEndDate: null,
				// Não salvar mercadopagoSubscriptionId até confirmação
				mercadopagoSubscriptionId: null,
			},
		});

		logInfo("User subscription request saved (plan unchanged until confirmation)", {
			userId,
			subscriptionId: result.id,
			requestedPlan: plan,
			currentPlan,
			billingCycle,
			status: "pending"
		});
	} catch (dbError) {
		logError("Database save failed", dbError, {
			userId,
			subscriptionId: result.id,
		});
	}

	// Notificar via Discord
	try {
		await discordWebhook.notifyPurchase({
			user: { email },
			amount: transactionAmount / 100,
			plan: `${plan} (${billingCycle}) - PENDING CONFIRMATION`,
			id: result.id,
			paymentMethod: "Mercado Pago",
			currency: "BRL",
		});
	} catch (webhookError) {
		console.error("[MP API] Erro ao enviar webhook Discord:", webhookError);
	}
}

// Função para tratar erros do Mercado Pago
function handleMercadoPagoError(
	error: any,
	email: string,
	plan: string
): NextResponse {
	let errorResponse = {
		error: "Erro ao processar pagamento",
		code: "PAYMENT_PROCESSING_ERROR",
		message: "Tente novamente ou entre em contato com o suporte",
	};
	let statusCode = 500;

	if (error?.cause) {
		try {
			const errorData = JSON.parse(error.cause);

			if (errorData.status === 400) {
				errorResponse = {
					error: "Dados inválidos",
					code: "INVALID_PAYMENT_DATA",
					message: "Verifique os dados informados e tente novamente",
				};
				statusCode = 400;
			} else if (errorData.status === 401) {
				errorResponse = {
					error: "Serviço temporariamente indisponível",
					code: "PAYMENT_SERVICE_AUTH_ERROR",
					message: "Tente novamente em alguns minutos",
				};
				statusCode = 503;
			} else if (errorData.status === 403) {
				errorResponse = {
					error: "Operação não permitida",
					code: "PAYMENT_FORBIDDEN",
					message: "Entre em contato com o suporte",
				};
				statusCode = 403;
			} else if (errorData.status >= 500) {
				errorResponse = {
					error: "Serviço temporariamente indisponível",
					code: "PAYMENT_SERVICE_ERROR",
					message: "Tente novamente em alguns minutos",
				};
				statusCode = 503;
			}
		} catch {
			// Manter erro genérico se não conseguir fazer parse
		}
	}

	// Notificar falha via Discord
	try {
		discordWebhook.notifyPaymentFailure({
			user: { email: email ? `${email.substring(0, 3)}***` : "unknown" },
			amount: 0,
			plan: plan || "unknown",
			reason: errorResponse.code,
			paymentMethod: "Mercado Pago",
		});
	} catch (webhookError) {
		logError("Discord notification failed", webhookError);
	}

	return NextResponse.json(
		{
			...errorResponse,
			timestamp: new Date().toISOString(),
		},
		{ status: statusCode }
	);
}

export async function POST(request: NextRequest) {
	let plan = "",
		billingCycle = "",
		email = "",
		userId = "";

	try {
		// Validações iniciais
		const rateLimitError = validateRateLimit(request);
		if (rateLimitError) {
			return rateLimitError;
		}

		const contentTypeError = validateContentType(request);
		if (contentTypeError) {
			return contentTypeError;
		}

		// Parse do body
		let body: any;
		try {
			body = await parseRequestBody(request);
		} catch {
			return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
		}

		({ plan, billingCycle, email, userId } = body);

		logInfo("Request received", {
			plan,
			billingCycle,
			email: `${email?.substring(0, 3)}***`,
			userId,
		});

		// Validação dos campos
		const fieldsError = validateRequestFields(body);
		if (fieldsError) {
			return fieldsError;
		}

		// Validação do plano e preço
		const planResult = validatePlanAndGetPrice(plan, billingCycle);
		if (planResult instanceof NextResponse) {
			return planResult;
		}
		const { transactionAmount } = planResult;

		// Validação da configuração do Mercado Pago
		const configError = validateMercadoPagoConfig();
		if (configError) {
			return configError;
		}

		// Validação do usuário
		const userError = await validateUserExists(userId);
		if (userError) {
			return userError;
		}

		// Criar preapproval
		const result = await createPreapproval(
			plan,
			billingCycle,
			email,
			userId,
			transactionAmount,
			body.card_token_id
		);

		// Salvar dados no banco e notificar
		await handlePostCreation(
			result,
			userId,
			plan,
			billingCycle,
			email,
			transactionAmount
		);

		return NextResponse.json(result);
	} catch (error: any) {
		// Log detalhado do erro
		logError("Preapproval creation failed", error, {
			userId,
			email,
			plan,
			billingCycle,
			errorType: error.constructor.name,
			errorCode: error.code,
			errorStatus: error.status,
			errorCause: error.cause,
		});

		return handleMercadoPagoError(error, email, plan);
	}
}

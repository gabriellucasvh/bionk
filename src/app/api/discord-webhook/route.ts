// src/app/api/discord-webhook/route.ts

import { type NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Configuração do webhook do Discord bot
const DISCORD_BOT_URL = process.env.DISCORD_BOT_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Função para validar o secret do webhook
function validateWebhookSecret(request: NextRequest): boolean {
	const authHeader = request.headers.get("authorization");
	const providedSecret = authHeader?.replace("Bearer ", "");
	if (!(WEBHOOK_SECRET && providedSecret)) {
		return false;
	}
	return providedSecret === WEBHOOK_SECRET;
}

// Função para enviar dados para o Discord bot
async function sendToDiscordBot(endpoint: string, data: any) {
	try {
		if (!(DISCORD_BOT_URL && WEBHOOK_SECRET)) {
			return { success: false, error: "Serviço indisponível" };
		}
		const response = await fetch(`${DISCORD_BOT_URL}${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-webhook-secret": WEBHOOK_SECRET,
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			return { success: false, error: `HTTP ${response.status}` };
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}

// Processadores de webhook por tipo
function processRegistrationWebhook(data: any, _request: NextRequest) {
	return {
		endpoint: "/webhook/new-registration",
		processedData: {
			userId: data.userId || data.id,
			username: data.username,
			maskedEmail:
				typeof data.email === "string"
					? `${data.email.split("@")[0].slice(0, 1)}***@${data.email.split("@")[1]}`
					: undefined,
			name: data.name || data.username,
			source: data.source || "website",
			provider: data.source === "google_oauth" ? "Google" : "Email",
			plan: data.plan || "free",
			timestamp: new Date().toISOString(),
			metadata: {
				registrationMethod:
					data.metadata?.registrationMethod || data.source || "website",
			},
		},
	};
}

function processPurchaseWebhook(data: any) {
	return {
		endpoint: "/webhook/new-purchase",
		processedData: {
			user: {
				username: data.user?.username,
				email: data.user?.email,
				name: data.user?.name,
			},
			amount: data.amount,
			plan: data.plan,
			id: data.id || `purchase_${Date.now()}`,
			paymentMethod: data.paymentMethod || "unknown",
			metadata: {
				timestamp: new Date().toISOString(),
				currency: data.currency || "BRL",
				...data.metadata,
			},
		},
	};
}

function processFormWebhook(data: any, request: NextRequest) {
	return {
		endpoint: "/webhook/form-submission",
		processedData: {
			type: data.type || "contact",
			name: data.name,
			email: data.email,
			subject: data.subject,
			message: data.message,
			source: data.source || "website",
			metadata: {
				timestamp: new Date().toISOString(),
				userAgent: request.headers.get("user-agent"),
				ip: request.headers.get("x-forwarded-for") || "unknown",
				...data.metadata,
			},
		},
	};
}

function processExceptionWebhook(data: any, request: NextRequest) {
	return {
		endpoint: "/webhook/exception",
		processedData: {
			error: data.error,
			message: data.message,
			stack: data.stack,
			context: data.context || "unknown",
			metadata: {
				timestamp: new Date().toISOString(),
				userAgent: request.headers.get("user-agent"),
				url: data.url,
				...data.metadata,
			},
		},
	};
}

function processPaymentFailureWebhook(data: any) {
	return {
		endpoint: "/webhook/payment-failure",
		processedData: {
			user: {
				username: data.user?.username,
				email: data.user?.email,
			},
			amount: data.amount,
			plan: data.plan,
			reason: data.reason || "unknown",
			paymentMethod: data.paymentMethod,
			metadata: {
				timestamp: new Date().toISOString(),
				...data.metadata,
			},
		},
	};
}

function processAccountDeletionWebhook(data: any, request: NextRequest) {
	return {
		endpoint: "/webhook/account-deletion",
		processedData: {
			userId: data.userId,
			username: data.username,
			email: data.email,
			name: data.name,
			reason: data.reason || "user_request",
			deletionType: data.deletionType || "soft_delete",
			metadata: {
				timestamp: new Date().toISOString(),
				userAgent: request.headers.get("user-agent"),
				ip: request.headers.get("x-forwarded-for") || "unknown",
				...data.metadata,
			},
		},
	};
}

// Mapa de processadores de webhook
type WebhookProcessor = (
	data: any,
	request: NextRequest
) => {
	endpoint: string;
	processedData: any;
};

const WEBHOOK_PROCESSORS: Record<string, WebhookProcessor> = {
	registration: processRegistrationWebhook,
	purchase: processPurchaseWebhook,
	form: processFormWebhook,
	"form-submission": processFormWebhook, // Alias para form
	exception: processExceptionWebhook,
	"payment-failure": processPaymentFailureWebhook,
	"account-deletion": processAccountDeletionWebhook,
};

// Endpoint principal para receber webhooks
export async function POST(request: NextRequest) {
	try {
		if (!(DISCORD_BOT_URL && WEBHOOK_SECRET)) {
			return NextResponse.json(
				{ error: "Serviço de webhook indisponível" },
				{ status: 503 }
			);
		}
		// Validar secret do webhook
		if (!validateWebhookSecret(request)) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const body = await request.json();
		const { type, data } = body;

		if (!(type && data)) {
			return NextResponse.json(
				{ error: "Tipo ou dados do webhook não fornecidos" },
				{ status: 400 }
			);
		}

		// Buscar processador para o tipo
		const processor = WEBHOOK_PROCESSORS[type];
		if (!processor) {
			return NextResponse.json(
				{ error: `Tipo de webhook não suportado: ${type}` },
				{ status: 400 }
			);
		}

		// Processar dados usando o processador apropriado
		const { endpoint, processedData } = processor(data, request);

		// Enviar para o Discord bot
		const result = await sendToDiscordBot(endpoint, processedData);

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: `Webhook ${type} processado com sucesso`,
				data: result.data,
			});
		}
		return NextResponse.json(
			{
				success: false,
				error: `Falha ao processar webhook: ${result.error}`,
			},
			{ status: 500 }
		);
	} catch {
		return NextResponse.json(
			{
				success: false,
				error: "Erro interno do servidor",
			},
			{ status: 500 }
		);
	}
}

// Endpoint para testar a conexão
export async function GET() {
	try {
		const result = await sendToDiscordBot("/health", { test: true });

		return NextResponse.json({
			status: "ok",
			discordBot: result.success ? "connected" : "disconnected",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "error",
				discordBot: "disconnected",
				error: error instanceof Error ? error.message : "Erro desconhecido",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}

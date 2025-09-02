// src/lib/discord-webhook.ts

/**
 * Cliente para enviar webhooks para o Discord bot
 * Facilita a integração entre o projeto Bionk e o sistema de logs do Discord
 */
export class DiscordWebhookClient {
  private baseUrl: string;
  private secret: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    this.secret = process.env.WEBHOOK_SECRET || "your_webhook_secret_here";
  }

  /**
   * Envia um webhook genérico
   */
  private async sendWebhook(type: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discord-webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.secret}`,
        },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
      };
    }
  }

  /**
   * Notifica um novo cadastro
   */
  notifyRegistration(data: {
    username: string;
    email: string;
    name?: string;
    source?: string;
    plan?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("registration", data);
  }

  /**
   * Notifica uma nova compra
   */
  notifyPurchase(data: {
    user: {
      username?: string;
      email: string;
      name?: string;
    };
    amount: number;
    plan: string;
    id?: string;
    paymentMethod?: string;
    currency?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("purchase", data);
  }

  /**
   * Notifica um envio de formulário
   */
  notifyFormSubmission(data: {
    type?: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    source?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("form", data);
  }

  /**
   * Notifica uma exceção/erro
   */
  notifyException(data: {
    error: string;
    message: string;
    stack?: string;
    context?: string;
    url?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("exception", data);
  }

  /**
   * Notifica falha de pagamento
   */
  notifyPaymentFailure(data: {
    user: {
      username?: string;
      email: string;
    };
    amount: number;
    plan: string;
    reason?: string;
    paymentMethod?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("payment-failure", data);
  }

  /**
   * Notifica exclusão de conta
   */
  notifyAccountDeletion(data: {
    userId: string;
    username?: string;
    email: string;
    name?: string;
    reason?: string;
    deletionType?: string;
    metadata?: Record<string, any>;
  }) {
    return this.sendWebhook("account-deletion", data);
  }

  /**
   * Testa a conexão com o Discord bot
   */
  async testConnection(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/discord-webhook`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.secret}`,
        },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, status: data.status };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão",
      };
    }
  }
}

// Instância singleton para uso em toda a aplicação
export const discordWebhook = new DiscordWebhookClient();

// Tipos para TypeScript
export interface WebhookResponse {
  success: boolean;
  error?: string;
}

export interface RegistrationData {
  username: string;
  email: string;
  name?: string;
  source?: string;
  plan?: string;
  metadata?: Record<string, any>;
}

export interface PurchaseData {
  user: {
    username?: string;
    email: string;
    name?: string;
  };
  amount: number;
  plan: string;
  id?: string;
  paymentMethod?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface FormData {
  type?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface ExceptionData {
  error: string;
  message: string;
  stack?: string;
  context?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface PaymentFailureData {
  user: {
    username?: string;
    email: string;
  };
  amount: number;
  plan: string;
  reason?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface AccountDeletionData {
  userId: string;
  username?: string;
  email: string;
  name?: string;
  reason?: string;
  deletionType?: string;
  metadata?: Record<string, any>;
}

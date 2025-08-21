// src/app/api/mercadopago/cancel-subscription/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		// 1. Encontrar o usuário e sua assinatura no seu banco de dados
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { mercadopagoSubscriptionId: true },
		});

		const subscriptionId = user?.mercadopagoSubscriptionId;

		if (!subscriptionId) {
			return NextResponse.json(
				{ error: "Nenhuma assinatura ativa encontrada para este usuário." },
				{ status: 404 }
			);
		}

		// 2. Comunicar com a API do Mercado Pago para cancelar a assinatura
		const client = new MercadoPagoConfig({
			accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
		});
		const preapproval = new PreApproval(client);

		const result = await preapproval.update({
			id: subscriptionId,
			body: {
				status: "cancelled",
			},
		});

		if (result.status !== "cancelled") {
			throw new Error("Falha ao cancelar a assinatura no Mercado Pago.");
		}

		// 3. Atualizar o status da assinatura no seu banco de dados
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				subscriptionStatus: "cancelled",
				// Opcional: Você pode querer limpar a data de fim também
				// subscriptionEndDate: null,
			},
		});

		return NextResponse.json({
			message: "Assinatura cancelada com sucesso!",
		});
	} catch (error: any) {
		return NextResponse.json(
			{
				error: "Erro ao cancelar a assinatura.",
				details: error.message || "Erro desconhecido",
			},
			{ status: 500 }
		);
	}
}

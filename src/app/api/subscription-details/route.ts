// src/app/api/subscription-details/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				subscriptionPlan: true,
				subscriptionStatus: true,
				subscriptionEndDate: true,
				mercadopagoSubscriptionId: true,
				paymentMethodBrand: true,
				paymentMethodLastFour: true,
			},
		});

		if (!user?.subscriptionPlan) {
			return NextResponse.json({ isSubscribed: false });
		}

		if (user.subscriptionPlan === "free") {
			return NextResponse.json({
				isSubscribed: true,
				plan: "free",
				status: "active",
			});
		}

		// Para planos pagos, validar se realmente está ativo
		const isPaidPlan = ["basic", "pro", "premium"].includes(
			user.subscriptionPlan
		);

		if (isPaidPlan) {
			// Verificar se tem mercadopagoSubscriptionId válido
			if (!user.mercadopagoSubscriptionId) {
				console.log(
					"User with paid plan but no mercadopagoSubscriptionId, showing as free",
					{
						userId: session.user.id,
						plan: user.subscriptionPlan,
						status: user.subscriptionStatus,
					}
				);
				return NextResponse.json({
					isSubscribed: true,
					plan: "free",
					status: "active",
				});
			}

			// Verificar se o status é ativo
			if (user.subscriptionStatus !== "active") {
				console.log(
					"User with paid plan but inactive status, showing as free",
					{
						userId: session.user.id,
						plan: user.subscriptionPlan,
						status: user.subscriptionStatus,
					}
				);
				return NextResponse.json({
					isSubscribed: true,
					plan: "free",
					status: "active",
				});
			}

			// Verificar se a assinatura não expirou
			if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
				console.log("User with expired subscription, showing as free", {
					userId: session.user.id,
					plan: user.subscriptionPlan,
					endDate: user.subscriptionEndDate,
				});
				return NextResponse.json({
					isSubscribed: true,
					plan: "free",
					status: "active",
				});
			}
		}

		const response = {
			isSubscribed: true,
			plan: user.subscriptionPlan,
			status: user.subscriptionStatus,
			renewsOn: user.subscriptionEndDate,
			paymentMethod: {
				brand: user.paymentMethodBrand || "Cartão",
				lastFour: user.paymentMethodLastFour || "****",
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error in subscription-details API:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar detalhes da assinatura." },
			{ status: 500 }
		);
	}
}

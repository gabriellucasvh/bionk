// src/app/api/user-plan/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				subscriptionPlan: true,
				subscriptionStatus: true,
				mercadopagoSubscriptionId: true,
				subscriptionEndDate: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		// Se não tem plano ou é free, retorna free
		if (!user.subscriptionPlan || user.subscriptionPlan === "free") {
			return NextResponse.json({ subscriptionPlan: "free" });
		}

		// Para planos pagos, validar se realmente está ativo
		const isPaidPlan = ["basic", "pro", "premium"].includes(
			user.subscriptionPlan
		);

		if (isPaidPlan) {
			// Verificar se tem mercadopagoSubscriptionId válido
			if (!user.mercadopagoSubscriptionId) {
				console.log(
					"User with paid plan but no mercadopagoSubscriptionId, reverting to free",
					{
						userId: session.user.id,
						plan: user.subscriptionPlan,
						status: user.subscriptionStatus,
					}
				);
				return NextResponse.json({ subscriptionPlan: "free" });
			}

			// Verificar se o status é ativo
			if (user.subscriptionStatus !== "active") {
				console.log(
					"User with paid plan but inactive status, reverting to free",
					{
						userId: session.user.id,
						plan: user.subscriptionPlan,
						status: user.subscriptionStatus,
					}
				);
				return NextResponse.json({ subscriptionPlan: "free" });
			}

			// Verificar se a assinatura não expirou
			if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
				console.log("User with expired subscription, reverting to free", {
					userId: session.user.id,
					plan: user.subscriptionPlan,
					endDate: user.subscriptionEndDate,
				});
				return NextResponse.json({ subscriptionPlan: "free" });
			}
		}

		return NextResponse.json({ subscriptionPlan: user.subscriptionPlan });
	} catch (error) {
		console.error("Error in user-plan API:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

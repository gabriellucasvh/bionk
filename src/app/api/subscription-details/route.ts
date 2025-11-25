// src/app/api/subscription-details/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

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
		const isPaidPlan = ["basic", "pro", "ultra"].includes(
			user.subscriptionPlan
		);

		if (isPaidPlan) {
			// Verificar se o status é ativo
            if (user.subscriptionStatus !== "active") {
                return NextResponse.json({
                    isSubscribed: true,
                    plan: "free",
                    status: "active",
                });
            }

			// Verificar se a assinatura não expirou
            if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
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
    } catch {
        return NextResponse.json(
            { error: "Erro ao buscar detalhes da assinatura." },
            { status: 500 }
        );
    }
}

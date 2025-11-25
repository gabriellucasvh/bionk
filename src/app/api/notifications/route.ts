import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            emailVerified: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            subscriptionEndDate: true,
            onboardingCompleted: true,
            isBanned: true,
            sensitiveProfile: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const now = new Date();
    const notifications: Array<{
        id: string;
        type: "info" | "warning" | "error";
        title: string;
        message: string;
        createdAt: string;
    }> = [];

    if (!user.onboardingCompleted) {
        notifications.push({
            id: "onboarding",
            type: "info",
            title: "Complete seu onboarding",
            message: "Finalize seu cadastro para liberar mais recursos.",
            createdAt: now.toISOString(),
        });
    }

    if (!user.emailVerified) {
        notifications.push({
            id: "email",
            type: "warning",
            title: "Verifique seu e-mail",
            message: "Confirme seu e-mail para proteger sua conta e evitar bloqueios.",
            createdAt: now.toISOString(),
        });
    }

    const paidPlan = ["basic", "pro", "ultra"].includes(user.subscriptionPlan || "");
    const activeSubscription = paidPlan && user.subscriptionStatus === "active" && (!user.subscriptionEndDate || user.subscriptionEndDate >= now);

    if (paidPlan && !activeSubscription) {
        notifications.push({
            id: "subscription-inactive",
            type: "warning",
            title: "Assinatura inativa",
            message: "Sua assinatura não está ativa. Renove para manter os recursos.",
            createdAt: now.toISOString(),
        });
    }

    if (activeSubscription && user.subscriptionEndDate) {
        const diffDays = Math.ceil((user.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays >= 0) {
            notifications.push({
                id: "subscription-expiring",
                type: "warning",
                title: "Assinatura expirando",
                message: `Sua assinatura expira em ${diffDays} dias.`,
                createdAt: now.toISOString(),
            });
        }
        if (diffDays < 0) {
            notifications.push({
                id: "subscription-expired",
                type: "error",
                title: "Assinatura expirada",
                message: "Sua assinatura expirou. Reative para continuar com os recursos.",
                createdAt: now.toISOString(),
            });
        }
    }

    if (user.sensitiveProfile) {
        notifications.push({
            id: "profile-sensitive",
            type: "info",
            title: "Perfil sensível",
            message: "Seu perfil está marcado como sensível. Verifique suas configurações.",
            createdAt: now.toISOString(),
        });
    }

    if (user.isBanned) {
        notifications.push({
            id: "account-banned",
            type: "error",
            title: "Conta suspensa",
            message: "Sua conta está suspensa. Entre em contato com o suporte.",
            createdAt: now.toISOString(),
        });
    }

    const response = NextResponse.json(notifications);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    return response;
}

// src/app/api/profile/[id]/route.ts

import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { authOptions } from "@/lib/auth";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const regex = /^[a-z0-9._]{3,30}$/;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
});

// FUNÇÃO GET ADICIONADA
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;

	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				name: true,
				username: true,
				bio: true,
				image: true,
				email: true,
				sensitiveProfile: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		return NextResponse.json(user);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;

	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { sensitiveProfile } = body;

		// Valida se sensitiveProfile é um boolean
		if (typeof sensitiveProfile !== "boolean") {
			return NextResponse.json(
				{ error: "sensitiveProfile deve ser um valor booleano" },
				{ status: 400 }
			);
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				sensitiveProfile,
			},
			select: {
				id: true,
				username: true,
				sensitiveProfile: true,
			},
		});

		// Revalida a página do perfil do usuário
		if (updatedUser.username) {
			revalidatePath(`/${updatedUser.username}`);
		}

		return NextResponse.json({
			message: "Perfil atualizado com sucesso",
			sensitiveProfile: updatedUser.sensitiveProfile,
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;

	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		// Buscar dados do usuário antes da exclusão para notificação e cancelamento do Stripe
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
				stripeCustomerId: true,
				stripeSubscriptionId: true,
				subscriptionStatus: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		// Cancelar assinatura do Stripe se existir
		let stripeCancellationStatus = "no_subscription";
		if (user.stripeSubscriptionId && user.subscriptionStatus === "active") {
			try {
				await stripe.subscriptions.cancel(user.stripeSubscriptionId);
				stripeCancellationStatus = "cancelled_successfully";
			} catch {
				stripeCancellationStatus = "cancellation_failed";
				// Continua com a exclusão mesmo se o cancelamento falhar
				// O usuário pode cancelar manualmente via Customer Portal se necessário
			}
		} else if (user.stripeSubscriptionId) {
			stripeCancellationStatus = "subscription_inactive";
		}

		// Excluir o usuário
		await prisma.user.delete({
			where: { id },
		});

		// Notificar Discord sobre exclusão de conta
		try {
			await discordWebhook.notifyAccountDeletion({
				userId: user.id,
				username: user.username || undefined,
				email: user.email,
				name: user.name || undefined,
				reason: "user_request",
				deletionType: "hard_delete",
				metadata: {
					timestamp: new Date().toISOString(),
					userAgent: request.headers.get("user-agent") || "unknown",
					ip: request.headers.get("x-forwarded-for") || "unknown",
					source: "user_settings",
					stripeSubscriptionId: user.stripeSubscriptionId || undefined,
					stripeCustomerId: user.stripeCustomerId || undefined,
					stripeCancellationStatus,
					subscriptionStatus: user.subscriptionStatus || undefined,
				},
			});
		} catch {
			// Não falha a exclusão se a notificação Discord falhar
		}

		return NextResponse.json({
			message: "Conta excluída com sucesso",
			userId: user.id,
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions);
	const { id } = await params;
	if (session?.user?.id !== id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name, username, bio, bannerUrl, image } = body;

		const existing = await prisma.user.findUnique({
			where: { id },
			select: { username: true, lastUsernameChange: true },
		});

		if (!existing) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		const isUsernameChange =
			typeof username === "string" &&
			username.trim() &&
			username.toLowerCase() !== (existing.username || "");

		if (isUsernameChange) {
			const normalized = username.toLowerCase().trim();
			if (!regex.test(normalized)) {
				return NextResponse.json(
					{ error: "Username inválido" },
					{ status: 400 }
				);
			}
			if (BLACKLISTED_USERNAMES.includes(normalized)) {
				return NextResponse.json(
					{ error: "Username não disponível" },
					{ status: 400 }
				);
			}
			const exists = await prisma.user.findUnique({
				where: { username: normalized },
			});
			if (exists && exists.id !== id) {
				return NextResponse.json(
					{ error: "Username já está em uso" },
					{ status: 400 }
				);
			}
			const last = existing.lastUsernameChange
				? new Date(existing.lastUsernameChange)
				: null;
			const now = new Date();
			const cooldownMs = 3 * 24 * 60 * 60 * 1000;
			if (last && now.getTime() < last.getTime() + cooldownMs) {
				const retryAt = new Date(last.getTime() + cooldownMs).toISOString();
				return NextResponse.json(
					{
						error: "Você só pode trocar o nome de usuário a cada 3 dias.",
						retryAt,
					},
					{ status: 400 }
				);
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name,
				username: isUsernameChange
					? username.toLowerCase().trim()
					: existing.username,
				bio,
				bannerUrl,
				image,
				lastUsernameChange: isUsernameChange ? new Date() : undefined,
			},
		});

		// Revalida a página do perfil do usuário
		if (updatedUser.username) {
			revalidatePath(`/${updatedUser.username}`);
		}

		return NextResponse.json(updatedUser);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

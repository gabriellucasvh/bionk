// src/app/api/profile/[id]/route.ts

import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { discordWebhook } from "@/lib/discord-webhook";
import prisma from "@/lib/prisma";

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
		if (typeof sensitiveProfile !== 'boolean') {
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
		// Buscar dados do usuário antes da exclusão para notificação
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
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
		const { name, username, bio, bannerUrl } = body;

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				name,
				username,
				bio,
				bannerUrl,
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

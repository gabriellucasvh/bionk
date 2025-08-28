// src/app/api/social-links/[id]/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

export async function PUT(request: NextRequest, context: RouteParams) {
	const session = await getServerSession(authOptions);
	if (!(session?.user?.id)) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const params = await context.params;
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { username, url, active, order } = body;

		const existingLink = await prisma.socialLink.findUnique({
			where: { id },
		});

		if (!existingLink) {
			return NextResponse.json(
				{ error: "Link social não encontrado" },
				{ status: 404 }
			);
		}

		if (existingLink.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Não autorizado a modificar este link" },
				{ status: 403 }
			);
		}

		if (body.platform && body.platform !== existingLink.platform) {
			const conflictingLink = await prisma.socialLink.findFirst({
				where: {
					userId: session.user.id,
					platform: body.platform,
					id: { not: id },
				},
			});
			if (conflictingLink) {
				return NextResponse.json(
					{ error: "Já existe um link para esta plataforma." },
					{ status: 409 }
				);
			}
		}

		const updatedSocialLink = await prisma.socialLink.update({
			where: { id },
			data: {
				username: username !== undefined ? username : existingLink.username,
				url: url !== undefined ? url : existingLink.url,
				active: active !== undefined ? active : existingLink.active,
				order: order !== undefined ? order : existingLink.order,
			},
		});

		// Otimização: Revalide a página do usuário
		if (session.user.username) {
			revalidatePath(`/${session.user.username}`);
		}

		return NextResponse.json(updatedSocialLink);
	} catch {
		return NextResponse.json(
			{ error: "Erro ao atualizar link social" },
			{ status: 500 }
		);
	}
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
	const session = await getServerSession(authOptions);
	if (!(session?.user?.id)) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const params = await context.params;
	const { id } = params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const existingLink = await prisma.socialLink.findUnique({
			where: { id },
		});

		if (!existingLink) {
			return NextResponse.json(
				{ error: "Link social não encontrado" },
				{ status: 404 }
			);
		}

		if (existingLink.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Não autorizado a excluir este link" },
				{ status: 403 }
			);
		}

		await prisma.socialLink.delete({
			where: { id },
		});

		// Otimização: Revalide a página do usuário
		if (session.user.username) {
			revalidatePath(`/${session.user.username}`);
		}

		return NextResponse.json(
			{ message: "Link social excluído com sucesso" },
			{ status: 200 }
		);
	} catch  {
		return NextResponse.json(
			{ error: "Erro ao excluir link social" },
			{ status: 500 }
		);
	}
}

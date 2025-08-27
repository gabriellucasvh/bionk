// api/links/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	const status = searchParams.get("status");

	if (!userId) {
		return NextResponse.json(
			{ error: "Parâmetro 'userId' ausente." },
			{ status: 400 }
		);
	}

	try {
		const links = await prisma.link.findMany({
			where: { userId, archived: status === "archived" },
			orderBy: { order: "asc" },
		});
		return NextResponse.json({ links });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao buscar links." },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	if (!userExists) {
		return NextResponse.json(
			{
				error:
					"Usuário da sessão não encontrado no banco de dados. Por favor, faça login novamente.",
			},
			{ status: 404 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			url,
			sectionTitle,
			badge,
			password,
			expiresAt,
			deleteOnClicks,
			launchesAt,
		} = body;

		if (!(title && url)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios não informados." },
				{ status: 400 }
			);
		}

		await prisma.link.updateMany({
			where: { userId: session.user.id },
			data: {
				order: {
					increment: 1,
				},
			},
		});

		const newLink = await prisma.link.create({
			data: {
				userId: session.user.id,
				title,
				url,
				order: 0,
				active: true,
				sectionTitle,
				badge: badge || null,
				password,
				expiresAt,
				deleteOnClicks,
				launchesAt,
			},
		});

		if (userExists.username) {
			revalidatePath(`/${userExists.username}`);
		}

		return NextResponse.json(newLink, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar link." },
			{ status: 500 }
		);
	}
}

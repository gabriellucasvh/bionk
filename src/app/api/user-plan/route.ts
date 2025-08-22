// src/app/api/user-plan/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { subscriptionPlan: true },
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

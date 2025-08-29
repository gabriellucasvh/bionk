import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { type NextRequest, NextResponse } from "next/server";

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

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Erro ao atualizar o perfil:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

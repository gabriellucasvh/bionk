import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function checkUserBanned() {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	if (session.user.banido) {
		return NextResponse.json(
			{
				error: "Conta suspensa",
				message: "Sua conta foi suspensa e não pode realizar esta ação.",
			},
			{ status: 403 }
		);
	}

	return null; // Usuário não está banido
}

export async function getAuthenticatedUser() {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return {
			error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
		};
	}

	if (session.user.banido) {
		return {
			error: NextResponse.json(
				{
					error: "Conta suspensa",
					message: "Sua conta foi suspensa e não pode realizar esta ação.",
				},
				{ status: 403 }
			),
		};
	}

	return { user: session.user };
}

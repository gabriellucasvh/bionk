import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { title, url, archived, launchesAt, expiresAt } = body;

		const updatedLink = await prisma.link.update({
			where: { id: Number.parseInt(id, 10) },
			data: {
				title,
				url,
				archived,
				launchesAt: launchesAt ? new Date(launchesAt) : null,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
			},
		});

		revalidatePath("/studio/links");

		return NextResponse.json(updatedLink);
	} catch (error) {
		console.error("Erro ao atualizar o link:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		await prisma.link.delete({
			where: { id: Number.parseInt(id, 10) },
		});

		revalidatePath("/studio/links");

		return NextResponse.json({ message: "Link excluído com sucesso" });
	} catch (error) {
		console.error("Erro ao excluir o link:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

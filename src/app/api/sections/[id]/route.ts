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
			{ error: "ID da seção é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { title, links } = body;

		const updatedSection = await prisma.section.update({
			where: { id: Number.parseInt(id, 10) },
			data: {
				title,
				links: {
					set: links.map((linkId: string) => ({
						id: Number.parseInt(linkId, 10),
					})),
				},
			},
		});

		revalidatePath("/studio/links");

		return NextResponse.json(updatedSection);
	} catch (error) {
		console.error("Erro ao atualizar a seção:", error);
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
			{ error: "ID da seção é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		await prisma.section.delete({
			where: { id: Number.parseInt(id, 10) },
		});

		revalidatePath("/studio/links");

		return NextResponse.json({ message: "Seção excluída com sucesso" });
	} catch (error) {
		console.error("Erro ao excluir a seção:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

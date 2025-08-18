import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	if (!id || Number.isNaN(Number(id))) {
		return NextResponse.json({ error: "ID inválido" }, { status: 400 });
	}

	try {
		const body = await request.json();

		// Removemos campos que não devem ser atualizados diretamente ou são undefined
		const cleanBody = Object.fromEntries(
			Object.entries(body).filter(([, value]) => value !== undefined)
		);

		const updatedLink = await prisma.link.update({
			where: { id: Number(id) },
			data: cleanBody,
		});

		return NextResponse.json(updatedLink);
	} catch {
		return NextResponse.json(
			{ error: "Falha ao atualizar link." },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	if (!id || Number.isNaN(Number(id))) {
		return NextResponse.json({ error: "ID inválido" }, { status: 400 });
	}

	try {
		await prisma.link.delete({
			where: { id: Number(id) },
		});

		return NextResponse.json({ message: "Link excluído com sucesso." });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao excluir link." },
			{ status: 500 }
		);
	}
}

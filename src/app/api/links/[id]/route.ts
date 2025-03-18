import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Params {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Atualiza os campos desejados (por exemplo, title, url, active, sensitive)
        const updatedLink = await prisma.user.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(updatedLink);
    } catch (error) {
        return NextResponse.json({ error: "Falha ao atualizar link." }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id },
        });
        return NextResponse.json({ message: "Link excluído com sucesso." });
    } catch (error) {
        return NextResponse.json({ error: "Falha ao excluir link." }, { status: 500 });
    }
}

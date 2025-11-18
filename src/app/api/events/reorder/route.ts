import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const reorderSchema = z.object({
    items: z.array(
        z.object({
            id: z.number(),
            order: z.number(),
        })
    ),
});

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validation = reorderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { items } = validation.data;

        const transactions = items.map((item) =>
            prisma.event.update({
                where: { id: item.id, userId: session.user.id },
                data: { order: item.order },
            })
        );

        await prisma.$transaction(transactions);

        revalidatePath("/studio/links");
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true },
        });
        if (user?.username) {
            revalidatePath(`/${user.username}`);
        }

        return NextResponse.json({ message: "Ordem dos eventos atualizada" });
    } catch {
        return NextResponse.json(
            { error: "Ocorreu um erro ao reordenar os eventos." },
            { status: 500 }
        );
    }
}

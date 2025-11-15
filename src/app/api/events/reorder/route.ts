import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const reorderSchema = z.object({
	items: z.array(z.object({ id: z.number(), order: z.number() })),
});

export async function PUT(request: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const parsed = reorderSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
		}

		const updates = parsed.data.items.map((it) =>
			prisma.event.update({ where: { id: it.id }, data: { order: it.order } })
		);
		await Promise.all(updates);

		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao reordenar eventos" },
			{ status: 500 }
		);
	}
}

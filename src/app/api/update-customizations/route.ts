// src/app/api/update-customizations/route.ts
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 1. Recebe as novas personalizações do frontend
		const newCustomizations = await request.json();

		// 2. Remove campos undefined ou null das novas personalizações
		const cleanedCustomizations = Object.fromEntries(
			Object.entries(newCustomizations).filter(
				([_, value]) => value !== undefined && value !== null
			)
		);

		// 3. Busca as personalizações existentes no banco
		const existingPresets = await prisma.customPresets.findUnique({
			where: { userId: session.user.id },
		});

		if (existingPresets) {
			// 4. Atualiza apenas os campos enviados, preservando os existentes
			const updated = await prisma.customPresets.update({
				where: { userId: session.user.id },
				data: cleanedCustomizations, // Apenas os campos que mudaram
			});

			return NextResponse.json(updated);
		}
		// 5. Se não existe registro, cria um novo apenas com os campos enviados
		const dataToCreate = {
			...cleanedCustomizations,
			userId: session.user.id,
		};

		const created = await prisma.customPresets.create({
			data: dataToCreate,
		});

		return NextResponse.json(created);
	} catch {
		return NextResponse.json(
			{ error: "Failed to update customizations" },
			{ status: 500 }
		);
	}
}

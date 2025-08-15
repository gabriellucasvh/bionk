// src/app/api/update-template/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const VALID_TEMPLATES = [
	"default",
	"simple",
	"vibrant",
	"gradient",
	"business",
	"corporate",
	"modern",
	"clean",
	"dark",
	"midnight",
	"artistic",
	"unique",
	"elegant",
	"lux",
	"neon",
	"cyber",
	"retro",
	"vintage",
	"photo",
	"gallery",
];

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		// Garantir que o email não seja null/undefined após a verificação
		const userEmail = session.user.email;

		const body: { template: string; templateCategory: string } =
			await req.json();
		const { template, templateCategory } = body;

		if (!template) {
			return NextResponse.json({ error: "Template inválido" }, { status: 400 });
		}

		if (!VALID_TEMPLATES.includes(template)) {
			return NextResponse.json(
				{ error: "Template não permitido" },
				{ status: 400 }
			);
		}

		// Buscar o usuário para pegar o ID
		const user = await prisma.user.findUnique({
			where: { email: userEmail },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		// Usar transação para garantir que ambas operações sejam executadas
		await prisma.$transaction(async (tx) => {
			// 1. Atualizar o template do usuário
			await tx.user.update({
				where: { email: userEmail },
				data: {
					template,
					templateCategory,
				},
			});

			// 2. Resetar todas as personalizações customizadas
			// Primeiro, verificar se existe registro de personalizações
			const existingPresets = await tx.customPresets.findUnique({
				where: { userId: user.id },
			});

			if (existingPresets) {
				// Se existir, resetar todos os campos
				await tx.customPresets.update({
					where: { userId: user.id },
					data: {
						customBackgroundColor: "",
						customBackgroundGradient: "",
						customTextColor: "",
						customFont: "",
						customButton: "",
						customButtonFill: "",
						customButtonCorners: "",
					},
				});
			}
			// Se não existir registro, não precisa fazer nada
			// O template padrão será usado automaticamente
		});

		return NextResponse.json({
			message: "Template atualizado e personalizações resetadas com sucesso",
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

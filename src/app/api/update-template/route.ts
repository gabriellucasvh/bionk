// src/app/api/update-template/route.ts

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getTemplatePreset } from "@/utils/templatePresets";

const VALID_TEMPLATES = [
	"default",
	"simple",
	"vibrant",
	"vinho",
	"ember",
	"modern",
	"abacate",
	"pulse",
	"mistico",
	"artistic",
	"unique",
	"menta",
	"lux",
	"neon",
	"cyber",
	"retro",
];

export async function POST(req: Request): Promise<NextResponse> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
		}

		const userEmail = session.user.email;

		const body: { template: string; templateCategory: string } =
			await req.json();
		const { template, templateCategory } = body;

		if (!(template && VALID_TEMPLATES.includes(template))) {
			return NextResponse.json({ error: "Template inválido" }, { status: 400 });
		}

		// Buscar o usuário para pegar o ID e o username
		const user = await prisma.user.findUnique({
			where: { email: userEmail },
			select: { id: true, username: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado" },
				{ status: 404 }
			);
		}

		const templatePreset = getTemplatePreset(template);

		await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { email: userEmail },
				data: {
					template,
					templateCategory,
				},
			});

			const existingPresets = await tx.customPresets.findUnique({
				where: { userId: user.id },
			});

			if (existingPresets) {
				await tx.customPresets.update({
					where: { userId: user.id },
					data: templatePreset,
				});
			} else {
				await tx.customPresets.create({
					data: {
						userId: user.id,
						...templatePreset,
					},
				});
			}
		});

		// Otimização: Revalide a página do usuário após a atualização
		if (user.username) {
			revalidatePath(`/${user.username}`);
		}

		return NextResponse.json({
			message: "Template atualizado e configurações aplicadas com sucesso",
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

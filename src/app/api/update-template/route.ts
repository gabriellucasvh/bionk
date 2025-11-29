// src/app/api/update-template/route.ts

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileBaseTag, profileCustomizationsTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { getTemplatePreset } from "@/utils/templatePresets";
export const runtime = "nodejs";

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

		await prisma.$transaction(async (tx: any) => {
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
			revalidateTag(profileBaseTag(user.username));
			revalidateTag(profileCustomizationsTag(user.username));
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

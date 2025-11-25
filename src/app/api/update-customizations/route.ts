// src/app/api/update-customizations/route.ts

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

// Regex de extensão definido no escopo de módulo para performance
const EXTENSION_REGEX = /\.[^/.]+$/;

function extractBackgroundPublicId(url: string | null | undefined) {
	if (!url) {
		return null;
	}
	try {
		const u = new URL(url);
		const parts = u.pathname.split("/").filter(Boolean);
		const bgIdx = parts.findIndex((seg) => seg === "backgrounds");
		if (bgIdx === -1) {
			return null;
		}
		const publicIdWithExt = parts.slice(bgIdx).join("/");
		return publicIdWithExt.replace(EXTENSION_REGEX, "");
	} catch {
		return null;
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session.user.banido) {
			return NextResponse.json(
				{
					error: "Conta suspensa",
					message: "Sua conta foi suspensa e não pode realizar esta ação.",
				},
				{ status: 403 }
			);
		}

		// 1. Recebe as novas personalizações do frontend
		const newCustomizations = await request.json();

		// 2. Mantém apenas campos suportados pelo modelo CustomPresets
		const allowedKeys = new Set([
			"customBackgroundColor",
			"customBackgroundGradient",
			"customBackgroundMediaType",
			"customBackgroundImageUrl",
			"customBackgroundVideoUrl",
			"customTextColor",
			"customFont",
			"customButtonColor",
			"customButtonTextColor",
			"customButtonStyle",
			"customButtonFill",
			"customButtonCorners",
			"headerStyle",
			"customBlurredBackground",
		]);

		const cleanedCustomizations = Object.fromEntries(
			Object.entries(newCustomizations)
				.filter(
					([key, value]) =>
						allowedKeys.has(key) && value !== undefined && value !== null
				)
				.map(([key, value]) => {
					if (key === "customBlurredBackground") {
						return [key, Boolean(value)];
					}
					return [key, value];
				})
		);

		// 3. Busca as personalizações existentes no banco
		const existingPresets = await prisma.customPresets.findUnique({
			where: { userId: session.user.id },
		});

		const hasUpdates = Object.keys(cleanedCustomizations).length > 0;

		if (existingPresets) {
			// Se não há nenhum campo para atualizar, retorna o registro existente
			if (!hasUpdates) {
				// Revalida a página do perfil do usuário
				const user = await prisma.user.findUnique({
					where: { id: session.user.id },
					select: { username: true },
				});
				if (user?.username) {
					revalidatePath(`/${user.username}`);
				}
				return NextResponse.json(existingPresets);
			}
			// 4. Garantir exclusividade e limpar Cloudinary quando apropriado
			const incomingType = cleanedCustomizations.customBackgroundMediaType as
				| "image"
				| "video"
				| undefined;

			// Forçar exclusividade nas URLs com base no tipo informado
			if (incomingType === "image") {
				cleanedCustomizations.customBackgroundVideoUrl = "";
			} else if (incomingType === "video") {
				cleanedCustomizations.customBackgroundImageUrl = "";
			}

			// Apagar do Cloudinary a mídia oposta quando o tipo muda
			try {
				if (
					incomingType === "image" &&
					existingPresets.customBackgroundVideoUrl
				) {
					const publicId = extractBackgroundPublicId(
						existingPresets.customBackgroundVideoUrl
					);
					if (publicId) {
						await cloudinary.uploader.destroy(publicId, {
							resource_type: "video",
						} as any);
					}
				}
				if (
					incomingType === "video" &&
					existingPresets.customBackgroundImageUrl
				) {
					const publicId = extractBackgroundPublicId(
						existingPresets.customBackgroundImageUrl
					);
					if (publicId) {
						await cloudinary.uploader.destroy(publicId, {
							resource_type: "image",
						} as any);
					}
				}
			} catch {}

			// Apagar imagem quando for removida explicitamente
			try {
				if (
					cleanedCustomizations.customBackgroundImageUrl === "" &&
					existingPresets.customBackgroundImageUrl
				) {
					const publicId = extractBackgroundPublicId(
						existingPresets.customBackgroundImageUrl
					);
					if (publicId) {
						await cloudinary.uploader.destroy(publicId, {
							resource_type: "image",
						} as any);
					}
				}
			} catch {}

			// Apagar vídeo quando for removido explicitamente
			try {
				if (
					cleanedCustomizations.customBackgroundVideoUrl === "" &&
					existingPresets.customBackgroundVideoUrl
				) {
					const publicId = extractBackgroundPublicId(
						existingPresets.customBackgroundVideoUrl
					);
					if (publicId) {
						await cloudinary.uploader.destroy(publicId, {
							resource_type: "video",
						} as any);
					}
				}
			} catch {}

			// Agora atualiza os campos enviados
			const updated = await prisma.customPresets.update({
				where: { userId: session.user.id },
				data: cleanedCustomizations,
			});

			// Revalida a página do perfil do usuário
			const user = await prisma.user.findUnique({
				where: { id: session.user.id },
				select: { username: true },
			});
			if (user?.username) {
				revalidatePath(`/${user.username}`);
			}

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

		// Revalida a página do perfil do usuário
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
		}

		return NextResponse.json(created);
	} catch (err: unknown) {
		// Log detalhado do erro para diagnóstico
		console.error("[update-customizations] erro ao salvar:", err);
		const e: any = err as any;
		return NextResponse.json(
			{
				error: "Failed to update customizations",
				message: e?.message,
				code: e?.code,
				meta: e?.meta,
			},
			{ status: 500 }
		);
	}
}

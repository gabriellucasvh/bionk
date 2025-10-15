import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { authOptions, clearUserTokenCache } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getDefaultCustomPresets } from "@/utils/templatePresets";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/;

// Função auxiliar para validar dados do onboarding
function validateOnboardingData(name: string, username: string) {
	if (!name || name.trim().length < 2 || name.length > 44) {
		return "Nome deve ter entre 2 e 44 caracteres";
	}

	if (!(username && USERNAME_REGEX.test(username))) {
		return "Username deve conter apenas letras, números, _ ou - e ter entre 3-30 caracteres";
	}

	if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
		return "Este nome de usuário não está disponível";
	}

	return null;
}

// Função auxiliar para fazer upload de imagem
async function uploadProfileImage(profileImage: string, defaultImage: string) {
	if (!profileImage || typeof profileImage !== 'string' || profileImage.trim() === '') {
		return defaultImage;
	}

	try {
		// Se for uma URL, usar diretamente
		if (profileImage.startsWith('http')) {
			return profileImage;
		}

		// Se for base64, fazer upload para Cloudinary
		const buffer = Buffer.from(profileImage.replace(BASE64_IMAGE_REGEX, ''), 'base64');

		// Upload para Cloudinary
		const uploadResponse = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: "profile-images",
						transformation: [
							{ width: 400, height: 400, crop: "fill" },
							{ quality: "auto" },
						],
					},
					(error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result);
						}
					}
				)
				.end(buffer);
		});

		return (uploadResponse as any).secure_url;
	} catch (error) {
		console.error("Erro no upload da imagem:", error);
		return defaultImage;
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		// Verificar se usuário tem status pending e evitar recompletar onboarding
		if (session.user.status !== "pending" || session.user.onboardingCompleted) {
			return NextResponse.json(
				{
					error: "Onboarding já foi concluído ou indisponível para este usuário",
				},
				{ status: 400 }
			);
		}

		const body = await request.json();
		const { name, username, bio, profileImage } = body;

		// Validar dados
		const validationError = validateOnboardingData(name, username);
		if (validationError) {
			return NextResponse.json({ error: validationError }, { status: 400 });
		}

		// Verificar se username já existe
		const existingUser = await prisma.user.findUnique({
			where: { username },
		});

		if (existingUser && existingUser.id !== session.user.id) {
			return NextResponse.json(
				{ error: "Nome de usuário já está em uso" },
				{ status: 400 }
			);
		}

		// Upload da imagem
		const imageUrl = await uploadProfileImage(profileImage, session.user.image || '');

		// Atualizar usuário no banco e criar presets padrão (idempotente)
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				name: name.trim(),
				username,
				bio: bio?.trim() || null,
				image: imageUrl,
				onboardingCompleted: true,
				status: "active",
				CustomPresets: {
					upsert: {
						create: getDefaultCustomPresets(),
						update: {},
					},
				}
			},
		});

		// Limpar cache do token para forçar atualização na próxima requisição
		clearUserTokenCache(session.user.id);

		return NextResponse.json({
			message: "Onboarding completado com sucesso",
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				username: updatedUser.username,
				bio: updatedUser.bio,
				image: updatedUser.image,
				onboardingCompleted: updatedUser.onboardingCompleted,
				status: updatedUser.status,
			},
		});
	} catch (error) {
		console.error("Erro no onboarding:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

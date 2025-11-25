import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import { authOptions, clearUserTokenCache } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { getDefaultCustomPresets } from "@/utils/templatePresets";
export const runtime = "nodejs";

const BASE64_IMAGE_REGEX = /^data:image\/\w+;base64,/;

async function uploadProfileImage(input: unknown, defaultImage: string) {
	if (!input) {
		return defaultImage;
	}

	try {
		// String input: URL or base64
		if (typeof input === "string") {
			const profileImage = input.trim();
			if (!profileImage) {
				return defaultImage;
			}
			if (profileImage.startsWith("http")) {
				return profileImage;
			}
			const buffer = Buffer.from(
				profileImage.replace(BASE64_IMAGE_REGEX, ""),
				"base64"
			);

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
		}

		// Blob/File input from FormData
		if (typeof (input as Blob)?.arrayBuffer === "function") {
			const blob = input as Blob;
			const buffer = Buffer.from(await blob.arrayBuffer());

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
		}

		return defaultImage;
    } catch {
        return defaultImage;
    }
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		// Suporta JSON e FormData
		const contentType = request.headers.get("content-type") || "";
		let name = "";
		let username = "";
		let bio: string | null = null;
		let profileImageInput: unknown = null;
    let plan = "";
    let userType = "";

		if (contentType.includes("multipart/form-data")) {
			const form = await request.formData();
			name = String(form.get("name") || "");
			username = String(form.get("username") || "");
			bio = form.get("bio") ? String(form.get("bio")) : null;
			profileImageInput = form.get("profileImage") ?? null;
            plan = String(form.get("plan") || "");
            userType = String(form.get("userType") || "");
        } else {
            const body = await request.json().catch(async () => {
                // Fallback para formData caso .json() falhe
                const form = await request.formData();
                return {
                    name: String(form.get("name") || ""),
                    username: String(form.get("username") || ""),
                    bio: form.get("bio") ? String(form.get("bio")) : null,
                    profileImage: form.get("profileImage") ?? null,
                    plan: String(form.get("plan") || ""),
                    userType: String(form.get("userType") || ""),
                };
            });
            name = body.name || "";
            username = body.username || "";
            bio = body.bio ?? null;
            profileImageInput = body.profileImage ?? null;
            plan = body.plan || "";
            userType = body.userType || "";
        }

		// Validações
		if (!name || name.trim().length === 0) {
			return NextResponse.json(
				{ error: "Nome é obrigatório" },
				{ status: 400 }
			);
		}

		if (name.length > 44) {
			return NextResponse.json(
				{ error: "Nome deve ter no máximo 44 caracteres" },
				{ status: 400 }
			);
		}

		if (!username || username.trim().length === 0) {
			return NextResponse.json(
				{ error: "Username é obrigatório" },
				{ status: 400 }
			);
		}

		if (username.length > 30) {
			return NextResponse.json(
				{ error: "Username deve ter no máximo 30 caracteres" },
				{ status: 400 }
			);
		}

		// Verificar se username está na blacklist
		if (BLACKLISTED_USERNAMES.includes(username.toLowerCase())) {
			return NextResponse.json(
				{ error: "Username não disponível" },
				{ status: 400 }
			);
		}

		// Verificar se username já está em uso
		const existingUser = await prisma.user.findFirst({
			where: {
				username: username.toLowerCase(),
				NOT: {
					id: session.user.id,
				},
			},
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Username já está em uso" },
				{ status: 400 }
			);
		}

		// Upload da imagem (se houver) e atualizar usuário, criando presets padrão
		const imageUrl = await uploadProfileImage(
			profileImageInput,
			session.user.image || ""
		);

        const selectedPlan = plan === "pro" ? "pro" : "free";
        const selectedType =
            userType === "creator" || userType === "enterprise" || userType === "personal"
                ? userType
                : "personal";

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name.trim(),
                username: username.toLowerCase().trim(),
                bio: bio?.trim() || null,
                image: imageUrl,
                onboardingCompleted: true,
                userType: selectedType,
                pendingSubscriptionPlan: selectedPlan === "pro" ? "pro" : null,
                subscriptionPlan: selectedPlan === "free" ? "free" : "free",
                CustomPresets: {
                    upsert: {
                        create: getDefaultCustomPresets(),
                        update: {},
                    },
                },
            },
        });

		// Limpar cache do token para forçar atualização na próxima requisição
		clearUserTokenCache(session.user.id);

		return NextResponse.json(
			{
				success: true,
                user: {
                    id: updatedUser.id,
                    name: updatedUser.name,
                    username: updatedUser.username,
                    bio: updatedUser.bio,
                    image: updatedUser.image,
                    userType: updatedUser.userType,
                    pendingSubscriptionPlan: updatedUser.pendingSubscriptionPlan,
                    subscriptionPlan: updatedUser.subscriptionPlan,
                },
            },
            { status: 200 }
        );
	} catch (error) {
		console.error("Erro ao completar onboarding:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

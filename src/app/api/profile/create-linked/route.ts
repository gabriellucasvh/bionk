import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const data = await req.json();
		const {
			name,
			username,
			bio,
			userType,
			profileImage,
			template,
			socialLinks,
			customLinks,
		} = data;

		if (!username) {
			return NextResponse.json(
				{ error: "Username é obrigatório" },
				{ status: 400 }
			);
		}

		const ownerId = session.user.id;

		// Verificar limite de contas (Plano Free = max 10)
		const subProfilesCount = await prisma.user.count({
			where: { ownerId },
		});

		if (subProfilesCount >= 10) {
			return NextResponse.json(
				{ error: "Limite de páginas atingido (10/10)" },
				{ status: 403 }
			);
		}

		// Verificar se username já existe
		const existingUser = await prisma.user.findUnique({
			where: { username },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Username já em uso" },
				{ status: 400 }
			);
		}

		// Gerar um email fake temporário só para satisfazer o campo unique
		const fakeEmail = `sub_${crypto.randomUUID().slice(0, 8)}@linked.bionk.me`;

		let templateCategory = "classicos";
		let templatePreset: Record<string, any> | null = null;

		if (template) {
			const { getTemplatePreset, getTemplateInfo } = await import(
				"@/utils/templatePresets"
			);
			templatePreset = getTemplatePreset(template);
			templateCategory = getTemplateInfo(template).category;
		}

		// Criar o perfil vinculado e configurações em uma transação
		const newProfile = await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: fakeEmail,
					name: name || username,
					username,
					bio: bio || null,
					userType: userType || "personal",
					ownerId,
					status: "active",
					onboardingCompleted: true,
					image:
						profileImage ||
						"https://res.cloudinary.com/dlfpjuk2r/image/upload/v1757491297/default_xry2zk.png",
					provider: "linked",
					...(template ? { template, templateCategory } : {}),
				},
			});

			if (templatePreset) {
				await tx.customPresets.create({
					data: {
						userId: user.id,
						...templatePreset,
					},
				});
			}

			if (socialLinks && socialLinks.length > 0) {
				const { SOCIAL_PLATFORMS } = await import("@/config/social-platforms");
				const platformMap = new Map(SOCIAL_PLATFORMS.map((p) => [p.key, p]));
				const socialLinksData: any[] = [];

				let order = 0;
				for (const item of socialLinks) {
					const cfg = platformMap.get(item.platform);
					if (cfg) {
						const base = cfg.baseUrl || "";
						const url = `${base}${item.username}`;
						socialLinksData.push({
							userId: user.id,
							platform: item.platform,
							username: item.username,
							url,
							active: true,
							order: order++,
						});
					}
				}

				if (socialLinksData.length > 0) {
					await tx.socialLink.createMany({
						data: socialLinksData,
					});
				}
			}

			if (customLinks && customLinks.length > 0) {
				const linksData = customLinks.map((link: any, index: number) => ({
					userId: user.id,
					title: link.title,
					url: link.url,
					active: true,
					order: index,
				}));

				await tx.link.createMany({
					data: linksData,
				});
			}

			return user;
		});

		return NextResponse.json({
			success: true,
			profile: {
				id: newProfile.id,
				username: newProfile.username,
			},
		});
	} catch (error) {
		console.error("Erro ao criar perfil vinculado:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

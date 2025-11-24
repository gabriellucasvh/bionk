import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
const HTTP_SCHEME_RE = /^https?:\/\//i;
export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const {
			title,
			description,
			layout,
			ratio = "square",
			sizePercent = 100,
			items,
			sectionId,
		} = await request.json();

		if (!(layout && ["single", "column", "carousel"].includes(layout))) {
			return NextResponse.json(
				{ error: "Layout inválido. Use: single, column ou carousel" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ error: "É necessário enviar pelo menos uma imagem" },
				{ status: 400 }
			);
		}

		if (layout === "single" && items.length !== 1) {
			return NextResponse.json(
				{ error: "Layout 'single' requer exatamente 1 imagem" },
				{ status: 400 }
			);
		}

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		if (description && description.length > 200) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 200 caracteres" },
				{ status: 400 }
			);
		}

		if (Array.isArray(items)) {
			for (let i = 0; i < items.length; i++) {
				const raw = items[i]?.linkUrl as string | undefined;
				if (raw && raw.trim().length > 0) {
					const v = raw.trim();
					const hasScheme = HTTP_SCHEME_RE.test(v) || v.startsWith("//");
					const normalized = hasScheme ? v : `https://${v}`;
					try {
						const u = new URL(normalized);
						if (!(u.protocol === "http:" || u.protocol === "https:")) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
						const host = u.hostname;
						if (!(host && host.includes("."))) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
						const tld = host.split(".").pop() || "";
						if (tld.length < 2) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
					} catch {
						return NextResponse.json(
							{ error: `URL inválida na imagem ${i + 1}` },
							{ status: 400 }
						);
					}
				}
			}
		}

		// Ao criar um novo item, empurra os outros para baixo mantendo o order
		await prisma.$transaction([
			prisma.link.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.text.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.section.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.video.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
			prisma.image.updateMany({
				where: { userId: session.user.id },
				data: { order: { increment: 1 } },
			}),
		]);

		const image = await prisma.image.create({
			data: {
				title: title?.trim() || null,
				description: description?.trim() || null,
				layout,
				ratio,
				sizePercent,
				items, // Json: [{ url, previewUrl?, provider?, authorName?, authorLink?, sourceLink?, linkUrl? }]
				active: true,
				order: 0,
				userId: session.user.id,
				sectionId: sectionId || null,
			},
		});

		return NextResponse.json(image, { status: 201 });
	} catch (error) {
		console.error("Erro ao criar imagem:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		const images = await prisma.image.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ images });
	} catch (error) {
		console.error("Erro ao listar imagens:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

// Regex para remover extensão de arquivo
const FILE_EXTENSION_REGEX = /\.[^/.]+$/;

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		// Permite que campos avançados também sejam atualizados
		const {
			title,
			url,
			active,
			archived,
			launchesAt,
			expiresAt,
			animated,
			badge,
			password,
			deleteOnClicks,
			customImageUrl,
			shareAllowed,
		} = body;

		if (title && title.length > 80) {
			return NextResponse.json(
				{ error: "O título do link deve ter no máximo 80 caracteres." },
				{ status: 400 }
			);
		}

		// Validação simples do badge (máximo 12 caracteres)
		if (typeof badge === "string" && badge.length > 12) {
			return NextResponse.json(
				{ error: "O badge deve ter no máximo 12 caracteres." },
				{ status: 400 }
			);
		}

		// Buscar expiração atual para validar reativação
		const current = await prisma.link.findUnique({
			where: { id: Number.parseInt(id, 10) },
			select: { expiresAt: true },
		});

		const requestedExpiresDate = expiresAt ? new Date(expiresAt) : null;
		const effectiveExpires = requestedExpiresDate ?? current?.expiresAt ?? null;
		if (active === true && effectiveExpires && effectiveExpires <= new Date()) {
			return NextResponse.json(
				{ error: "Link expirado — não pode ser reativado" },
				{ status: 400 }
			);
		}

		// Montar payload de update sem apagar datas quando não enviadas
		const updateData: any = {
			title,
			url,
			active,
			archived,
			animated,
			badge:
				typeof badge === "string" && badge.trim() !== "" ? badge.trim() : null,
			password:
				typeof password === "string" ? password.trim() || null : password,
			deleteOnClicks:
				typeof deleteOnClicks === "number" && deleteOnClicks > 0
					? deleteOnClicks
					: null,
			customImageUrl,
			shareAllowed:
				typeof shareAllowed === "boolean" ? shareAllowed : undefined,
		};
		if (Object.hasOwn(body, "launchesAt")) {
			updateData.launchesAt = launchesAt ? new Date(launchesAt) : null;
		}
		if (Object.hasOwn(body, "expiresAt")) {
			updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
		}

		const updatedLink = await prisma.link.update({
			where: { id: Number.parseInt(id, 10) },
			data: updateData,
		});

		// Revalida tanto o studio quanto a página do perfil
		revalidatePath("/studio/links");

		// Busca o username do usuário para revalidar sua página
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
		}

		return NextResponse.json(updatedLink);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const linkId = Number.parseInt(id, 10);

		// Buscar o link para verificar se tem imagem personalizada
		const link = await prisma.link.findUnique({
			where: { id: linkId },
			select: { id: true, customImageUrl: true },
		});

		if (!link) {
			return NextResponse.json(
				{ error: "Link não encontrado" },
				{ status: 404 }
			);
		}

		// Remover imagem do Cloudinary se existir
		if (link.customImageUrl) {
			try {
				// Extrair public_id da URL do Cloudinary
				const publicId = link.customImageUrl
					.split("/")
					.slice(-2)
					.join("/")
					.replace(FILE_EXTENSION_REGEX, "");

				await cloudinary.uploader.destroy(publicId);
			} catch (cloudinaryError) {
				console.error("Erro ao remover imagem do Cloudinary:", cloudinaryError);
				// Continua mesmo se falhar ao remover do Cloudinary
			}
		}

		// Deletar o link do banco de dados
		await prisma.link.delete({
			where: { id: linkId },
		});

		// Revalida tanto o studio quanto a página do perfil
		revalidatePath("/studio/links");

		// Busca o username do usuário para revalidar sua página
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { username: true },
		});
		if (user?.username) {
			revalidatePath(`/${user.username}`);
		}

		return NextResponse.json({ message: "Link excluído com sucesso" });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

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

	const { id } = await params;
	if (!id) {
		return NextResponse.json(
			{ error: "ID do link é obrigatório" },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		// Permite que qualquer campo do link seja atualizado
		const { title, url, active, archived, launchesAt, expiresAt, animated } = body;

		const updatedLink = await prisma.link.update({
			where: { id: Number.parseInt(id, 10) },
			data: {
				title,
				url,
				active,
				archived,
				launchesAt: launchesAt ? new Date(launchesAt) : null,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				animated,
			},
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

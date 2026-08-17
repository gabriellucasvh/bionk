
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { profileLinksTag } from "@/lib/cache-tags";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
		}

		const { id: paramId } = await params;
		const id = Number.parseInt(paramId);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "ID inválido." }, { status: 400 });
		}

		const data = await req.json();
		const {
			title,
			description,
			imageUrl,
			successMessage,
			buttonText,
			collectName,
			collectEmail,
			collectPhone,
			isCompact,
			sectionId,
			order,
			isActive,
		} = data;

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, username: true },
		});

		if (!user) {
			return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
		}

		const existingForm = await prisma.contactForm.findUnique({
			where: { id },
		});

		if (!existingForm || existingForm.userId !== user.id) {
			return NextResponse.json({ error: "Formulário não encontrado ou não autorizado." }, { status: 404 });
		}

		// Validation if updating fields
		if (collectName !== undefined && !collectName && !collectEmail && !collectPhone) {
			return NextResponse.json({ error: "Selecione pelo menos um campo para coletar" }, { status: 400 });
		}

		const updateData: any = {};
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
		if (successMessage !== undefined) updateData.successMessage = successMessage;
		if (buttonText !== undefined) updateData.buttonText = buttonText;
		if (collectName !== undefined) updateData.collectName = collectName;
		if (collectEmail !== undefined) updateData.collectEmail = collectEmail;
		if (collectPhone !== undefined) updateData.collectPhone = collectPhone;
		if (isCompact !== undefined) updateData.isCompact = isCompact;
		if (sectionId !== undefined) updateData.sectionId = sectionId;
		if (order !== undefined) updateData.order = order;
		if (isActive !== undefined) updateData.active = isActive;

		const updatedForm = await prisma.contactForm.update({
			where: { id },
			data: updateData,
		});

		if (user.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileLinksTag(user.username));
		}

		return NextResponse.json(updatedForm);
	} catch (error) {
		console.error("Error updating contact form:", error);
		return NextResponse.json(
			{ error: "Erro ao atualizar formulário de contato." },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
		}

		const { id: paramId } = await params;
		const id = Number.parseInt(paramId);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "ID inválido." }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, username: true },
		});

		if (!user) {
			return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
		}

		const existingForm = await prisma.contactForm.findUnique({
			where: { id },
		});

		if (!existingForm || existingForm.userId !== user.id) {
			return NextResponse.json({ error: "Formulário não encontrado ou não autorizado." }, { status: 404 });
		}

		await prisma.contactForm.delete({
			where: { id },
		});

		if (user.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileLinksTag(user.username));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting contact form:", error);
		return NextResponse.json(
			{ error: "Erro ao excluir formulário de contato." },
			{ status: 500 }
		);
	}
}

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileLinksTag } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado." },
				{ status: 404 }
			);
		}

		const contactForms = await prisma.contactForm.findMany({
			where: { userId: user.id },
			orderBy: { order: "asc" },
			include: {
				_count: {
					select: { submissions: true },
				},
			},
		});

		return NextResponse.json({ contactForms });
	} catch (error) {
		console.error("Error fetching contact forms:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar formulários de contato." },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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
		} = data;

		// Validation
		if (!(collectName || collectEmail || collectPhone)) {
			return NextResponse.json(
				{ error: "Selecione pelo menos um campo para coletar" },
				{ status: 400 }
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, username: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Usuário não encontrado." },
				{ status: 404 }
			);
		}

		// Find min order across all items to put it at the top
		const uid = user.id;
		const [minL, minT, minV, minI, minM, minS, minE, minC] = await Promise.all([
			prisma.link.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.text.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.video.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.image.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.music.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.section.aggregate({
				where: { userId: uid },
				_min: { order: true },
			}),
			prisma.event.aggregate({ where: { userId: uid }, _min: { order: true } }),
			prisma.contactForm.aggregate({
				where: { userId: uid },
				_min: { order: true },
			}),
		]);
		const candidates = [
			minL._min.order,
			minT._min.order,
			minV._min.order,
			minI._min.order,
			minM._min.order,
			minS._min.order,
			minE._min.order,
			minC._min.order,
		].filter((n) => typeof n === "number") as number[];

		const base = candidates.length > 0 ? Math.min(...candidates) : 0;
		const newOrder = base - 1;

		const contactForm = await prisma.contactForm.create({
			data: {
				userId: user.id,
				title: title || "",
				description: description || "",
				imageUrl: imageUrl || null,
				successMessage: successMessage || "Enviado",
				buttonText: buttonText || "Enviar Mensagem",
				collectName: collectName ?? true,
				collectEmail: collectEmail ?? true,
				collectPhone: collectPhone ?? true,
				isCompact: isCompact ?? false,
				order: newOrder,
				sectionId: sectionId || null,
			},
		});

		if (user.username) {
			revalidatePath(`/${user.username}`);
			revalidateTag(profileLinksTag(user.username));
		}

		return NextResponse.json(contactForm);
	} catch (error) {
		console.error("Error creating contact form:", error);
		return NextResponse.json(
			{ error: "Erro ao criar formulário de contato." },
			{ status: 500 }
		);
	}
}

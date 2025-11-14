import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const data = await req.json();
		const {
			title,
			location,
			eventDate,
			eventTime,
			descriptionShort,
			externalLink,
			priceType,
			price,
			eventType,
			organizer,
			coverImageUrl,
			seatsAvailable,
			ageRating,
		} = data || {};

		if (!(title && location && eventDate && eventTime && eventType)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios ausentes" },
				{ status: 400 }
			);
		}

		if (
			(priceType === "paid" || priceType === "donation") &&
			!(typeof price === "number" && price >= 0)
		) {
			return NextResponse.json(
				{ error: "Preço inválido para o tipo selecionado" },
				{ status: 400 }
			);
		}

		const created = await prisma.event.create({
			data: {
				userId: session.user.id,
				title: String(title),
				location: String(location),
				eventDate: new Date(eventDate),
				eventTime: String(eventTime),
				descriptionShort: descriptionShort ? String(descriptionShort) : null,
				externalLink: externalLink ? String(externalLink) : null,
				priceType: priceType ?? "free",
				price: price ?? null,
				eventType: String(eventType),
				organizer: organizer ? String(organizer) : null,
				coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
				seatsAvailable:
					typeof seatsAvailable === "number"
						? Math.max(0, seatsAvailable)
						: null,
				ageRating: ageRating ? String(ageRating) : null,
			},
			select: { id: true },
		});

		return NextResponse.json({ id: created.id });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar evento" },
			{ status: 500 }
		);
	}
}

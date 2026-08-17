import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

		// Buscar todas as submissões dos formulários do usuário
		const submissions = await prisma.contactSubmission.findMany({
			where: {
				contactForm: {
					userId: user.id,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			include: {
				contactForm: {
					select: {
						title: true,
					},
				},
			},
		});

		// Calcular taxa de crescimento (últimos 7 dias vs 7 dias anteriores)
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

		const currentWeekCount = submissions.filter(
			(sub) => new Date(sub.createdAt) >= sevenDaysAgo
		).length;

		const previousWeekCount = submissions.filter((sub) => {
			const date = new Date(sub.createdAt);
			return date >= fourteenDaysAgo && date < sevenDaysAgo;
		}).length;

		let growthRate = 0;
		if (previousWeekCount === 0) {
			growthRate = currentWeekCount > 0 ? 100 : 0;
		} else {
			growthRate =
				((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
		}

		return NextResponse.json({
			totalContacts: submissions.length,
			growthRate: Math.round(growthRate * 10) / 10, // Arredondar para 1 casa decimal
			data: submissions,
		});
	} catch (error: any) {
		console.error("GET /api/audience error:", error);
		return NextResponse.json(
			{ error: "Erro ao buscar audiência.", details: error.message },
			{ status: 500 }
		);
	}
}

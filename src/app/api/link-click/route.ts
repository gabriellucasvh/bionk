import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getCountryFromIP, getClientIP } from "@/utils/geolocation";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		// Lida tanto com JSON quanto com texto plano do sendBeacon
		const body = await req.text();
		const { linkId } = JSON.parse(body);

		if (!linkId || Number.isNaN(Number(linkId))) {
			return NextResponse.json(
				{ error: "ID do link é obrigatório e deve ser um número" },
				{ status: 400 }
			);
		}

		// Detectar tipo de dispositivo de forma anônima (LGPD compliant)
		const userAgent = getUserAgent(req);
		const deviceType = detectDeviceType(userAgent);

		// Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(req);
		const country = await getCountryFromIP(clientIP || '127.0.0.1');

		const [, updatedLink] = await prisma.$transaction([
			prisma.linkClick.create({
				data: {
					linkId: Number(linkId),
					device: deviceType,
					userAgent: userAgent,
					country: country
				},
			}),
			prisma.link.update({
				where: { id: Number(linkId) },
				data: { clicks: { increment: 1 } },
			}),
		]);

		if (
			updatedLink.deleteOnClicks &&
			updatedLink.clicks >= updatedLink.deleteOnClicks
		) {
			await prisma.link.update({
				where: { id: Number(linkId) },
				data: { active: false },
			});
		}

		return NextResponse.json(updatedLink);
	} catch  {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

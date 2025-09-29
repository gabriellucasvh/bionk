import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";

export async function POST(req: NextRequest) {
	try {
		// Lida tanto com JSON quanto com texto plano do sendBeacon
		const body = await req.text();
		const { linkId, trafficSource } = JSON.parse(body);

		if (!linkId || Number.isNaN(Number(linkId))) {
			return NextResponse.json(
				{ error: "ID do link é obrigatório e deve ser um número" },
				{ status: 400 }
			);
		}

		// Verificar preferências de cookies
		const cookiePreferences = getCookiePreferencesFromRequest(req);

		// Se analytics não estão permitidos, não processar o tracking detalhado
		if (!cookiePreferences.analytics) {
			// Ainda incrementar o contador de cliques (funcionalidade essencial)
			// mas sem coletar dados de tracking
			const linkWithIncrementedClicks = await prisma.link.update({
				where: { id: Number(linkId) },
				data: { clicks: { increment: 1 } },
			});

			if (
				linkWithIncrementedClicks.deleteOnClicks &&
				linkWithIncrementedClicks.clicks >=
					linkWithIncrementedClicks.deleteOnClicks
			) {
				await prisma.link.update({
					where: { id: Number(linkId) },
					data: { active: false },
				});
			}

			return NextResponse.json({
				message: "Click recorded without tracking",
				clicks: linkWithIncrementedClicks.clicks,
			});
		}

		// Detectar tipo de dispositivo de forma anônima (LGPD compliant)
		const userAgent = getUserAgent(req);
		const deviceType = detectDeviceType(userAgent);

		// Obter país baseado no IP (sem rastrear usuário individualmente)
		const clientIP = getClientIP(req);
		const country = await getCountryFromIP(clientIP || "127.0.0.1");

		// Log para debug em produção

		// Usar trafficSource do cliente ou fallback para direct
		const normalizedReferrer = trafficSource || "direct";

		const [, updatedLink] = await prisma.$transaction([
			prisma.linkClick.create({
				data: {
					linkId: Number(linkId),
					device: deviceType,
					userAgent,
					country,
					referrer: normalizedReferrer,
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
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

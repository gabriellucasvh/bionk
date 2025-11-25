import { type NextRequest, NextResponse } from "next/server";
import { getCookiePreferencesFromRequest } from "@/lib/cookie-server";
import prisma from "@/lib/prisma";
import { detectDeviceType, getUserAgent } from "@/utils/deviceDetection";
import { getClientIP, getCountryFromIP } from "@/utils/geolocation";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	try {
		// Lida tanto com JSON quanto com texto plano do sendBeacon
		const body = await req.text();
		const parsed = JSON.parse(body);
		let { linkId, trafficSource, url, userId, title, type } = parsed as {
			linkId?: number | string;
			trafficSource?: string;
			url?: string;
			userId?: string;
			title?: string;
			type?: string;
		};

		if (!linkId || Number.isNaN(Number(linkId))) {
			if (!(url && userId)) {
				return NextResponse.json(
					{
						error:
							"ID do link inválido; informe url e userId ou um linkId válido",
					},
					{ status: 400 }
				);
			}

			const linkType =
				typeof type === "string" && type ? type : "countdown_link";
			const existing = await prisma.link.findFirst({
				where: { userId, url, type: linkType },
				select: { id: true },
			});
			if (existing) {
				linkId = existing.id;
			} else {
				const created = await prisma.link.create({
					data: {
						userId,
						title:
							linkType === "countdown_link"
								? title
									? `Countdown: ${title}`
									: "Countdown"
								: title || "Vídeo",
						url,
						active: false,
						archived: true,
						type: linkType,
					},
					select: { id: true },
				});
				linkId = created.id;
			}
		}

		// Verificar preferências de cookies
        const cookiePreferences = getCookiePreferencesFromRequest(req as unknown as Request);

		// Se analytics não estão permitidos, registramos o clique com dados mínimos
		if (!cookiePreferences.analytics) {
			const [, updatedLinkAnon] = await prisma.$transaction([
				prisma.linkClick.create({
					data: {
						linkId: Number(linkId),
						device: "unknown",
						userAgent: null,
						country: null,
						referrer: null,
					},
				}),
				prisma.link.update({
					where: { id: Number(linkId) },
					data: { clicks: { increment: 1 } },
					select: {
						id: true,
						clicks: true,
						deleteOnClicks: true,
						active: true,
						title: true,
					},
				}),
			]);

			if (
				updatedLinkAnon.deleteOnClicks &&
				updatedLinkAnon.clicks >= updatedLinkAnon.deleteOnClicks
			) {
				await prisma.link.update({
					where: { id: Number(linkId) },
					data: { active: false },
				});
			}

			return NextResponse.json(updatedLinkAnon);
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

		const [, updatedLinkDetailed] = await prisma.$transaction([
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
				select: {
					id: true,
					clicks: true,
					deleteOnClicks: true,
					active: true,
					title: true,
				},
			}),
		]);

		if (
			updatedLinkDetailed.deleteOnClicks &&
			updatedLinkDetailed.clicks >= updatedLinkDetailed.deleteOnClicks
		) {
			await prisma.link.update({
				where: { id: Number(linkId) },
				data: { active: false },
			});
		}

		return NextResponse.json(updatedLinkDetailed);
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

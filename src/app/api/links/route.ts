// src/app/api/links/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

type LinkItem = {
	id: number;
	sectionId: number | null;
	section: { id: number; title: string; active: boolean; order: number } | null;
} & { [key: string]: any };

export async function GET(request: Request): Promise<NextResponse> {
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

	const { searchParams } = new URL(request.url);
	const status = searchParams.get("status");

	try {
		// Inativar automaticamente links expirados antes de listar
		await prisma.link.updateMany({
			where: {
				userId: session.user.id,
				expiresAt: { lte: new Date() },
				active: true,
			},
			data: { active: false },
		});

		const links: LinkItem[] = await prisma.link.findMany({
			where: { userId: session.user.id, archived: status === "archived" },
			orderBy: { order: "asc" },
			include: {
				section: {
					select: {
						id: true,
						title: true,
						active: true,
						order: true,
					},
				},
			},
		});

		// Transform the data to include section information directly in the link
		const transformedLinks = links.map((link: LinkItem) => ({
			...link,
			sectionId: link.section?.id || link.sectionId,
			section: link.section
				? {
						id: link.section.id,
						title: link.section.title,
					}
				: null,
		}));

		return NextResponse.json({ links: transformedLinks });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao buscar links." },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json(
			{ error: "Não autorizado - Faça login para criar links" },
			{ status: 401 }
		);
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

	const userExists = await prisma.user.findUnique({
		where: { id: session.user.id },
	});

	if (!userExists) {
		return NextResponse.json(
			{
				error:
					"Usuário da sessão não encontrado no banco de dados. Por favor, faça login novamente.",
			},
			{ status: 404 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			url,
			sectionId,
			badge,
			password,
			expiresAt,
			deleteOnClicks,
			launchesAt,
			shareAllowed,
		} = body;

		if (!(title && url)) {
			return NextResponse.json(
				{ error: "Campos obrigatórios não informados." },
				{ status: 400 }
			);
		}

		if (title.length > 80) {
			return NextResponse.json(
				{ error: "O título do link deve ter no máximo 80 caracteres." },
				{ status: 400 }
			);
		}

		// Validar se sectionId existe se fornecido
		if (sectionId) {
			const section = await prisma.section.findFirst({
				where: {
					id: sectionId,
					userId: session.user.id,
				},
			});
			if (!section) {
				return NextResponse.json(
					{ error: "Seção não encontrada." },
					{ status: 404 }
				);
			}
		}

		const uid = session.user.id;
		const ingestMode = (process.env.INGEST_MODE || "").toLowerCase();
		const useQueue = ingestMode
			? ingestMode !== "sync"
			: process.env.NODE_ENV === "production";
		if (!useQueue) {
			const [minL, minT, minV, minI, minM, minS, minE] = await Promise.all([
				prisma.link.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.text.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.video.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.image.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.music.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.section.aggregate({
					where: { userId: uid },
					_min: { order: true },
				}),
				prisma.event.aggregate({
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
			].filter((n) => typeof n === "number") as number[];
			const base = candidates.length > 0 ? Math.min(...candidates) : 0;
			const created = await prisma.link.create({
				data: {
					userId: uid,
					title,
					url,
					order: base - 1,
					active: true,
					sectionId: sectionId ? Number(sectionId) : null,
					badge: badge ? String(badge) : null,
					password:
						password && password.trim() !== "" ? String(password.trim()) : null,
					expiresAt: expiresAt ? new Date(expiresAt) : null,
					deleteOnClicks:
						deleteOnClicks && deleteOnClicks > 0
							? Number(deleteOnClicks)
							: null,
					launchesAt: launchesAt ? new Date(launchesAt) : null,
					shareAllowed: Boolean(shareAllowed),
				},
			});
			return NextResponse.json(created, { status: 201 });
		}

		const r = getRedis();
		const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
		const shard =
			Math.abs(Array.from(uid).reduce((a, c) => a + c.charCodeAt(0), 0)) %
			shardCount;
		const payload = {
			userId: uid,
			title,
			url,
			sectionId: sectionId || null,
			badge: badge || null,
			password: password && password.trim() !== "" ? password.trim() : null,
			expiresAt: expiresAt ? String(new Date(expiresAt).toISOString()) : null,
			deleteOnClicks:
				deleteOnClicks && deleteOnClicks > 0 ? deleteOnClicks : null,
			launchesAt: launchesAt
				? String(new Date(launchesAt).toISOString())
				: null,
			shareAllowed: Boolean(shareAllowed),
		};
		await r.lpush(`ingest:links:${uid}:${shard}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
	} catch {
		return NextResponse.json(
			{ error: "Falha ao criar link." },
			{ status: 500 }
		);
	}
}

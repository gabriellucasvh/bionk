import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";
const HTTP_SCHEME_RE = /^https?:\/\//i;
export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const {
			title,
			description,
			layout,
			ratio = "square",
			sizePercent = 100,
			items,
			sectionId,
		} = await request.json();

		if (!(layout && ["single", "column", "carousel"].includes(layout))) {
			return NextResponse.json(
				{ error: "Layout inválido. Use: single, column ou carousel" },
				{ status: 400 }
			);
		}

		if (!Array.isArray(items) || items.length === 0) {
			return NextResponse.json(
				{ error: "É necessário enviar pelo menos uma imagem" },
				{ status: 400 }
			);
		}

		if (layout === "single" && items.length !== 1) {
			return NextResponse.json(
				{ error: "Layout 'single' requer exatamente 1 imagem" },
				{ status: 400 }
			);
		}

		if (title && title.length > 100) {
			return NextResponse.json(
				{ error: "Título deve ter no máximo 100 caracteres" },
				{ status: 400 }
			);
		}

		if (description && description.length > 200) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 200 caracteres" },
				{ status: 400 }
			);
		}

		if (Array.isArray(items)) {
			for (let i = 0; i < items.length; i++) {
				const raw = items[i]?.linkUrl as string | undefined;
				if (raw && raw.trim().length > 0) {
					const v = raw.trim();
					const hasScheme = HTTP_SCHEME_RE.test(v) || v.startsWith("//");
					const normalized = hasScheme ? v : `https://${v}`;
					try {
						const u = new URL(normalized);
						if (!(u.protocol === "http:" || u.protocol === "https:")) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
						const host = u.hostname;
						if (!(host && host.includes("."))) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
						const tld = host.split(".").pop() || "";
						if (tld.length < 2) {
							return NextResponse.json(
								{ error: `URL inválida na imagem ${i + 1}` },
								{ status: 400 }
							);
						}
					} catch {
						return NextResponse.json(
							{ error: `URL inválida na imagem ${i + 1}` },
							{ status: 400 }
						);
					}
				}
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
			const created = await prisma.image.create({
				data: {
					userId: uid,
					title: title ? title.trim() : null,
					description: description ? description.trim() : null,
					layout,
					ratio,
					sizePercent,
					items,
					active: true,
					order: base - 1,
					sectionId: sectionId || null,
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
			title: title ? title.trim() : null,
			description: description ? description.trim() : null,
			layout,
			ratio,
			sizePercent,
			items,
			sectionId: sectionId || null,
		};
		await r.lpush(`ingest:images:${uid}:${shard}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		const images = await prisma.image.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ images });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
